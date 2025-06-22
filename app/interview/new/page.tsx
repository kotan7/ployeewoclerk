import React from "react";
import { InterviewForm } from "@/components/ui/InterviewForm";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const page = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#163300] mb-6">
            AI面接の準備をしましょう
          </h1>
          <p className="text-xl text-gray-600 font-semibold max-w-2xl mx-auto">
            あなたの情報を入力して、パーソナライズされた面接練習を始めましょう
          </p>
        </div>

        <SignedOut>
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-[#163300] mb-4">
              ログインが必要です
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              AI面接練習を始めるには、まずアカウントにログインしてください
            </p>
            <SignInButton mode="modal">
              <button className="cursor-pointer bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                ログインして面接練習を始める
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <InterviewForm />
        </SignedIn>
      </div>
    </div>
  );
};

export default page;
