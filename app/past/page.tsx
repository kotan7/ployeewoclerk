import React from "react";
import Link from "next/link";
import { getUserInterviews } from "@/lib/actions/interview.actions";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const InterviewHistoryPage = async () => {
  let interviews = [];

  try {
    interviews = await getUserInterviews();
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-[#163300] mb-4">面接履歴</h1>
            <p className="text-gray-600 mb-8">
              面接履歴を確認するにはログインが必要です
            </p>
            <SignInButton mode="modal">
              <button className="bg-[#9fe870] text-[#163300] px-8 py-3 rounded-full font-semibold hover:bg-[#8fd960] transition-colors">
                ログインして履歴を確認
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#163300] mb-2">面接履歴</h1>
            <p className="text-gray-600">
              これまでの面接練習履歴を確認できます
            </p>
          </div>

          {interviews.length === 0 ? (
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#163300] mb-2">
                まだ面接練習がありません
              </h3>
              <p className="text-gray-600 mb-6">
                最初の面接練習を始めてみましょう
              </p>
              <a
                href="/interview/new"
                className="inline-block bg-[#9fe870] text-[#163300] px-6 py-3 rounded-full font-semibold hover:bg-[#8fd960] transition-colors"
              >
                面接練習を始める
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview: any) => (
                <Link
                  key={interview.id}
                  href={`/interview/${interview.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer block"
                >
                  {/* Placeholder Image */}
                  <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6"
                      />
                    </svg>
                  </div>

                  {/* Interview Details */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[#163300] line-clamp-1">
                      {interview.companyName || interview.company_name}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {interview.role}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="inline-block px-2 py-1 bg-[#9fe870]/20 text-[#163300] rounded-full text-xs font-medium">
                        {interview.interviewFocus || interview.interview_focus}
                      </span>
                      <time>
                        {new Date(interview.created_at).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SignedIn>
      </div>
    </div>
  );
};

export default InterviewHistoryPage;
