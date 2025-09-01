"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AutoSignIn from "@/components/ui/AutoSignIn";

interface ESCorrectionData {
  id: string;
  company_name: string;
  question: string;
  answer: string;
  ai_feedback: string;
  overall_score: number;
  match_score: number;
  structure_score: number;
  basic_score: number;
  created_at: string;
  status: string;
}

interface ESResultClientProps {
  esData: ESCorrectionData;
}



const ESResultClient = ({ esData }: ESResultClientProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feedback" | "original">("feedback");

  const formatFeedback = (feedback: string) => {
    // Split feedback into sections and format them
    const sections = feedback.split(/【([^】]+)】/).filter(Boolean);
    const formattedSections = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i];
      const content = sections[i + 1];
      
      if (title && content) {
        formattedSections.push({ title, content: content.trim() });
      }
    }

    return formattedSections;
  };

  const feedbackSections = formatFeedback(esData.ai_feedback);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#9fe870";
    if (score >= 80) return "#ff8c5a";
    return "#ef4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "優秀";
    if (score >= 80) return "良好";
    if (score >= 70) return "改善の余地あり";
    return "要改善";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <AutoSignIn nonClosableModal={true}>
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#163300] mb-4 sm:mb-6">
              ES添削結果
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-semibold max-w-3xl mx-auto leading-relaxed">
              <strong>{esData.company_name}</strong> のエントリーシート分析結果をお届けします
            </p>
            <p className="text-sm text-gray-500 mt-4">
              分析日時: {new Date(esData.created_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#163300] mb-6 sm:mb-8 text-center">
              総合評価
            </h2>
            <div className="text-center">
              <div className="flex items-end gap-2 sm:gap-3 justify-center mb-4">
                <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#163300]">
                  {esData.overall_score}
                </span>
                <span className="pb-1 sm:pb-2 text-base sm:text-lg text-gray-500 font-medium">
                  /100
                </span>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-[#163300] mb-4">
                {getScoreLabel(esData.overall_score)}
              </p>
              <div className="w-full max-w-md mx-auto h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    esData.overall_score >= 90
                      ? "bg-[#9fe870]"
                      : esData.overall_score >= 70
                      ? "bg-[#fbbf24]"
                      : "bg-[#f97316]"
                  }`}
                  style={{ width: `${esData.overall_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#163300] mb-6 sm:mb-8 text-center">
              詳細スコア
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { score: esData.match_score, label: "求める人材とのマッチ", key: "match" },
                { score: esData.structure_score, label: "ESの構成", key: "structure" },
                { score: esData.basic_score, label: "基本チェック", key: "basic" }
              ].map((item, index) => (
                <div key={item.key} className="p-4 sm:p-6 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#163300]">
                      {item.label}
                    </h3>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl sm:text-3xl font-bold text-[#163300]">
                        {item.score}
                      </span>
                      <span className="text-sm text-gray-500 pb-1">/100</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        item.score >= 90
                          ? "bg-[#9fe870]"
                          : item.score >= 70
                          ? "bg-[#fbbf24]"
                          : "bg-[#f97316]"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Results */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#163300] mb-6 sm:mb-8 text-center">
              AI分析結果
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {feedbackSections.map((section, index) => (
                <div key={index} className="p-4 sm:p-6 bg-gray-50 rounded-xl border-l-4 border-[#9fe870]">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#163300] mb-3 sm:mb-4">
                    {section.title}
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Original Submission */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#163300] mb-6 sm:mb-8 text-center">
              提出内容
            </h2>
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#163300] mb-3 sm:mb-4">質問</h3>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 text-gray-700 text-sm sm:text-base leading-relaxed">
                  {esData.question}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#163300] mb-3 sm:mb-4">あなたの回答</h3>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {esData.answer}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 sm:mt-12 lg:mt-16 justify-center">
            <button
              onClick={() => router.push("/es-correction")}
              className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-6 text-base sm:text-lg font-semibold rounded-2xl sm:rounded-3xl min-w-0 sm:min-w-[220px] shadow-md hover:shadow-lg transition-all duration-200"
            >
              新しいES添削を始める
            </button>
            <button
              onClick={() => router.push("/es-correction/history")}
              className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-6 text-base sm:text-lg font-semibold border border-gray-300 rounded-2xl sm:rounded-3xl min-w-0 sm:min-w-[220px] hover:bg-gray-50 transition-all duration-200"
            >
              過去のES添削を見る
            </button>
          </div>
        </AutoSignIn>
      </div>
    </div>
  );
};

export default ESResultClient;