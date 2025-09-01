"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoSignIn from "@/components/ui/AutoSignIn";
import { canStartSession, getCurrentESUsage, getESPlanLimit, getUserPlanName } from "@/lib/actions/usage.actions";

const DashboardPage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{
    planName: string;
    remainingInterviews: number;
    remainingES: number;
    isLoading: boolean;
  }>({
    planName: '',
    remainingInterviews: 0,
    remainingES: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const [sessionInfo, planName, esUsage, esLimit] = await Promise.all([
          canStartSession(),
          getUserPlanName(),
          getCurrentESUsage(),
          getESPlanLimit(),
        ]);

        setUserInfo({
          planName,
          remainingInterviews: sessionInfo.remainingInterviews,
          remainingES: Math.max(0, esLimit - esUsage),
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
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      route: "/interview/new"
    },
    {
      id: "past-interviews",
      title: "過去の面接",
      description: "これまでの面接練習履歴を確認する",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6" />
        </svg>
      ),
      route: "/past"
    },
    {
      id: "es-correction",
      title: "ES添削",
      description: "エントリーシートをAIが詳細分析・添削",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      route: "/es-correction"
    },
    {
      id: "past-es-corrections",
      title: "過去のES添削",
      description: "これまでのES添削履歴を確認する",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      route: "/es-correction/history"
    }
  ];

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fffe] to-[#f0f9f6]">
      <AutoSignIn nonClosableModal={true}>
        {/* Hero Section - Homepage Style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#163300] to-[#2F4F3F] pt-20 pb-16">
          <div className="absolute inset-0 bg-[#142d25] opacity-50"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                おかえりなさい！
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
                今日も面接練習とES添削で、理想の未来に一歩近づきましょう
              </p>
            </div>

            {/* User Plan Info Section */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                {userInfo.isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-white">プラン情報を読み込み中...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="text-white/60 text-sm font-medium">現在のプラン</div>
                      <div className="text-white text-xl font-bold">{userInfo.planName}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-white/60 text-sm font-medium">残り面接回数</div>
                      <div className={`text-xl font-bold ${
                        userInfo.remainingInterviews <= 3 ? 'text-[#ff8c5a]' : 'text-[#9fe870]'
                      }`}>
                        {userInfo.remainingInterviews === 999 ? '無制限' : `${userInfo.remainingInterviews}回`}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-white/60 text-sm font-medium">残りES添削回数</div>
                      <div className={`text-xl font-bold ${
                        userInfo.remainingES <= 3 ? 'text-[#ff8c5a]' : 'text-[#9fe870]'
                      }`}>
                        {userInfo.remainingES === 999 ? '無制限' : `${userInfo.remainingES}回`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#163300] mb-4">
              何から始めますか？
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              AI面接練習とES添削で、あなたの就活・転職活動を全面サポート
            </p>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto">
            {dashboardOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => handleCardClick(option.route)}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-[#9fe870]/30 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9fe870] to-[#8fd960] rounded-2xl flex items-center justify-center text-[#163300] group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-[#163300] mb-3 group-hover:text-[#2F4F3F] transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                  <svg 
                    className="w-6 h-6 text-gray-400 group-hover:text-[#9fe870] transition-colors flex-shrink-0 mt-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-[#163300] mb-4">
                今すぐ始めよう
              </h3>
              <p className="text-gray-600 mb-8">
                面接練習またはES添削で、理想の未来への第一歩を踏み出しましょう
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/interview/new")}
                  className="px-8 py-4 bg-gradient-to-r from-[#9fe870] to-[#8fd960] text-[#163300] rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  面接練習を始める
                </button>
                <button
                  onClick={() => router.push("/es-correction")}
                  className="px-8 py-4 border-2 border-[#9fe870] text-[#163300] rounded-full font-bold hover:bg-[#9fe870] hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  ES添削を試す
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