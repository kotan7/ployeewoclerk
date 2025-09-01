"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoSignIn from "@/components/ui/AutoSignIn";
import { canStartSession, getCurrentESUsage, getESPlanLimit, getUserPlanName, getUserPlanLimit } from "@/lib/actions/usage.actions";
import { MessageCircle, History, Edit, FileText } from "lucide-react";
import { PlanAndUsageWidgets } from "@/components/ui/plan-and-usage-widgets";

const DashboardPage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{
    planName: string;
    remainingInterviews: number;
    remainingES: number;
    planLimitInterviews: number;
    planLimitES: number;
    currentUsageInterviews: number;
    currentUsageES: number;
    isLoading: boolean;
  }>({
    planName: '',
    remainingInterviews: 0,
    remainingES: 0,
    planLimitInterviews: 0,
    planLimitES: 0,
    currentUsageInterviews: 0,
    currentUsageES: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const [sessionInfo, planName, esUsage, esLimit, interviewLimit] = await Promise.all([
          canStartSession(),
          getUserPlanName(),
          getCurrentESUsage(),
          getESPlanLimit(),
          getUserPlanLimit(),
        ]);

        setUserInfo({
          planName,
          remainingInterviews: sessionInfo.remainingInterviews,
          remainingES: Math.max(0, esLimit - esUsage),
          planLimitInterviews: interviewLimit,
          planLimitES: esLimit,
          currentUsageInterviews: sessionInfo.currentUsage,
          currentUsageES: esUsage,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserInfo(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserInfo();
  }, []);

  const dashboardOptions = [
    {
      id: "new-interview",
      title: "新しいAI面接",
      description: "AI面接官との実践的な面接練習を始める",
      icon: MessageCircle,
      route: "/interview/new"
    },
    {
      id: "past-interviews",
      title: "過去の面接",
      description: "これまでの面接練習履歴を確認する", 
      icon: History,
      route: "/past"
    },
    {
      id: "es-correction",
      title: "ES添削",
      description: "エントリーシートをAIが詳細分析・添削",
      icon: Edit,
      route: "/es-correction"
    },
    {
      id: "past-es-corrections",
      title: "過去のES添削",
      description: "これまでのES添削履歴を確認する",
      icon: FileText,
      route: "/es-correction/history"
    }
  ];

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AutoSignIn nonClosableModal={true}>
        {/* Modern Hero Section */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-[#f8fffe] pt-20 pb-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#163300] to-[#2F4F3F] bg-clip-text text-transparent mb-6">
                おかえりなさい！
              </h1>
            </div>

            {/* Modern User Plan Info */}
            <div className="max-w-4xl mx-auto mb-8">
              <PlanAndUsageWidgets
                planName={userInfo.planName}
                remainingInterviews={userInfo.remainingInterviews}
                remainingES={userInfo.remainingES}
                planLimitInterviews={userInfo.planLimitInterviews}
                planLimitES={userInfo.planLimitES}
                currentUsageInterviews={userInfo.currentUsageInterviews}
                currentUsageES={userInfo.currentUsageES}
                loading={userInfo.isLoading}
              />
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Welcome Message */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#163300] mb-6">
              何から始めますか？
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              AI面接練習とES添削で、あなたの就活・転職活動を全面サポート
            </p>
          </div>

          {/* Modern Dashboard Cards Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-16">
            {dashboardOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  onClick={() => handleCardClick(option.route)}
                  className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#9fe870]/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_rgba(159,232,112,0.15)] hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[#9fe870]/20 group-hover:to-[#8fd960]/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#9fe870]/25">
                        <IconComponent className="w-8 h-8 text-gray-600 group-hover:text-[#163300] transition-colors duration-300" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-[#9fe870]/0 to-[#8fd960]/0 group-hover:from-[#9fe870]/20 group-hover:to-[#8fd960]/20 rounded-2xl transition-all duration-300 -z-10 blur-sm"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#163300] transition-colors duration-300">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {option.description}
                      </p>
                    </div>
                    <div className="text-gray-400 group-hover:text-[#9fe870] transition-colors duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modern Quick Actions */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-[#163300] mb-4">
                今すぐ始めよう
              </h3>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                面接練習またはES添削で、理想の未来への第一歩を踏み出しましょう
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => router.push("/interview/new")}
                  className="group px-10 py-4 bg-gradient-to-r from-[#9fe870] to-[#8fd960] text-[#163300] rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_15px_30px_rgba(159,232,112,0.4)] hover:scale-105 hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>面接練習を始める</span>
                  </span>
                </button>
                <button
                  onClick={() => router.push("/es-correction")}
                  className="group px-10 py-4 bg-white border-2 border-[#9fe870] text-[#163300] rounded-2xl font-bold transition-all duration-300 hover:bg-[#9fe870] hover:shadow-[0_15px_30px_rgba(159,232,112,0.3)] hover:scale-105 hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Edit className="w-5 h-5" />
                    <span>ES添削を試す</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </AutoSignIn>
    </div>
  );
};

export default DashboardPage;