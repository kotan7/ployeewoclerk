"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const FeedbackLoadingPage = () => {
  const params = useParams();
  const router = useRouter();
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);

  const interviewId = params.id as string;

  // Animate dots for loading effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Simulate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Cap at 95% to avoid reaching 100% before actual completion
        return prev + Math.random() * 3;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Check if feedback is ready every 3 seconds
  useEffect(() => {
    const checkFeedback = async () => {
      try {
        const response = await fetch(
          `/api/check-feedback-status/${interviewId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.feedbackReady) {
            setProgress(100);
            setTimeout(() => {
              router.push(`/feedback/${interviewId}`);
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error checking feedback status:", error);
      }
    };

    // Check immediately, then every 3 seconds
    checkFeedback();
    const interval = setInterval(checkFeedback, 3000);

    // Fallback: redirect after 30 seconds regardless
    const fallbackTimeout = setTimeout(() => {
      router.push(`/feedback/${interviewId}`);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimeout);
    };
  }, [interviewId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        {/* Main Loading Card */}
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 text-center">
          {/* Loading Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#9fe870] to-[#7dd24a] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-[#163300] mb-4">
            フィードバック生成中{dots}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            AIが面接内容を詳細に分析し、
            <br />
            あなた専用のフィードバックを
            <br />
            作成しています
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#9fe870] to-[#7dd24a] h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round(progress)}% 完了
            </p>
          </div>

          {/* Status Messages */}
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#9fe870] rounded-full animate-pulse" />
              <span>面接内容を解析中</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span>評価レポート作成中</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span>改善提案生成中</span>
            </div>
          </div>

          {/* Note */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">
              ※ 通常1-2分で完了します
              <br />
              しばらくお待ちください
            </p>
          </div>
        </div>

        {/* Floating Elements for Visual Interest */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#9fe870] rounded-full opacity-20 animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#7dd24a] rounded-full opacity-20 animate-bounce"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-[#9fe870] rounded-full opacity-20 animate-bounce"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackLoadingPage;
