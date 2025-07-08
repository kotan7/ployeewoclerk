import React from "react";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  getTranscript,
  getFeedback,
  getQuestions,
} from "@/lib/actions/interview.actions";
import { InterviewRadarChart } from "@/components/ui/charter";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

// Interface for the feedback result
interface FeedbackItem {
  score: string;
  feedback: string;
}

interface OverallFeedback {
  score: string;
  feedback: string;
}

const FeedbackPage = async ({ params }: FeedbackPageProps) => {
  const { id } = await params;

  // Fetch the saved feedback for this interview
  let transcriptData = null;
  let feedbackData = null;
  let questionsData = null;

  try {
    // Get transcript, feedback, and questions data
    const [transcript, feedback, questions] = await Promise.all([
      getTranscript(id),
      getFeedback(id),
      getQuestions(id),
    ]);

    transcriptData = transcript;
    feedbackData = feedback;
    questionsData = questions;
  } catch (error) {
    console.error("Error fetching feedback data:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#163300] mb-3">面接結果</h1>
          <p className="text-lg text-gray-600">
            面接の詳細な記録を確認できます
          </p>
        </div>

        {/* Overall Feedback Section */}
        {(() => {
          // Parse overall feedback data
          let overallFeedback: OverallFeedback | null = null;

          // First check if overall feedback is in the dedicated column
          if (feedbackData?.overallFeedback) {
            try {
              if (typeof feedbackData.overallFeedback === "string") {
                overallFeedback = JSON.parse(feedbackData.overallFeedback);
              } else if (typeof feedbackData.overallFeedback === "object") {
                overallFeedback = feedbackData.overallFeedback;
              }
            } catch (error) {
              console.error(
                "Error parsing overall feedback from column:",
                error
              );
            }
          }

          // Fallback to parsing from main feedback JSON for backwards compatibility
          if (!overallFeedback && feedbackData?.feedback) {
            try {
              let parsedData = feedbackData.feedback;

              if (typeof feedbackData.feedback === "string") {
                parsedData = JSON.parse(feedbackData.feedback);
              }

              if (parsedData?.overallFeedback) {
                overallFeedback = parsedData.overallFeedback;
              }
            } catch (error) {
              console.error(
                "Error parsing overall feedback from main feedback:",
                error
              );
            }
          }

          return overallFeedback ? (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
              {/* Two-column layout */}
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Score and Feedback */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-semibold text-[#163300] mb-8">
                    総合評価
                  </h2>
                  {/* Clean Score Display */}
                  <div className="mb-8">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-7xl font-bold text-[#163300] tracking-tight">
                        {overallFeedback.score}
                      </span>
                      <span className="text-3xl font-medium text-gray-400">
                        /100
                      </span>
                    </div>
                  </div>

                  {/* Overall Feedback Text */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#163300] mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-[#9fe870]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      面接官からの総評
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {overallFeedback.feedback}
                    </p>
                  </div>
                </div>

                {/* Right Column: Radar Chart */}
                <div className="flex justify-center lg:justify-end mt-8">
                  <InterviewRadarChart
                    frameless={true}
                    className="w-full max-w-md"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
              <h2 className="text-2xl font-semibold text-[#163300] mb-8">
                面接結果
              </h2>
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 border border-yellow-200">
                  <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                    評価結果が見つかりません
                  </h3>
                  <p className="text-yellow-700">
                    面接が完了していないか、フィードバックが生成されていない可能性があります。
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* AI Feedback Section */}
        {(() => {
          // Parse and validate feedback data
          let parsedFeedback: FeedbackItem[] = [];

          if (feedbackData?.feedback) {
            try {
              let parsedData = feedbackData.feedback;

              // Handle different possible formats of feedback data
              if (typeof feedbackData.feedback === "string") {
                parsedData = JSON.parse(feedbackData.feedback);
              }

              // Extract feedback array from the parsed data
              if (Array.isArray(parsedData)) {
                parsedFeedback = parsedData;
              } else if (
                parsedData?.feedback &&
                Array.isArray(parsedData.feedback)
              ) {
                parsedFeedback = parsedData.feedback;
              } else if (Array.isArray(feedbackData.feedback)) {
                parsedFeedback = feedbackData.feedback;
              }
            } catch (error) {
              console.error("Error parsing feedback data:", error);
              parsedFeedback = [];
            }
          }

          return parsedFeedback.length > 0 && questionsData ? (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
              <h2 className="text-2xl font-semibold text-[#163300] mb-8">
                AI評価結果
              </h2>

              {/* Individual Question Evaluations */}
              <div className="space-y-8">
                {parsedFeedback.map((item: FeedbackItem, index: number) => {
                  const score = parseInt(item.score) || 0;
                  const hasAnswer =
                    score > 0 && item.feedback && item.feedback.trim() !== "";

                  return (
                    <div
                      key={index}
                      className={`bg-gradient-to-r ${
                        hasAnswer
                          ? "from-[#9fe870]/10 to-[#9fe870]/5"
                          : "from-gray-100 to-gray-50"
                      } rounded-2xl p-6 border-l-4 ${
                        hasAnswer ? "border-[#9fe870]" : "border-gray-300"
                      } hover:shadow-md transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              hasAnswer
                                ? "bg-[#9fe870] text-[#163300]"
                                : "bg-gray-400 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-[#163300] text-lg">
                            質問 {index + 1}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-[#163300]">
                            {score}
                          </span>
                          <span className="text-base font-medium text-gray-400">
                            /10
                          </span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                          <p className="text-gray-800 font-medium leading-relaxed">
                            {questionsData.questions[index]}
                          </p>
                        </div>
                      </div>

                      {hasAnswer ? (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#9fe870]/20">
                          <div className="flex items-center mb-4">
                            <svg
                              className="w-5 h-5 mr-2 text-[#9fe870]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <h4 className="font-semibold text-[#163300]">
                              フィードバック
                            </h4>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {item.feedback}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center mb-3">
                            <svg
                              className="w-5 h-5 mr-2 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <h4 className="font-semibold text-gray-600">
                              フィードバック
                            </h4>
                          </div>
                          <p className="text-gray-500 text-sm italic">
                            この質問に対する回答が見つかりませんでした。
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null;
        })()}

        {/* Show message if no feedback yet */}
        {transcriptData && transcriptData.transcript && !feedbackData && (
          <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
            <h2 className="text-2xl font-semibold text-[#163300] mb-8">
              AI評価結果
            </h2>
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 border border-yellow-200">
                <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  フィードバックが生成されていません
                </h3>
                <p className="text-yellow-700">
                  面接完了後に「フィードバックを生成」ボタンを押してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mt-16 justify-center">
          <Link href="/interview/new">
            <Button className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] px-10 py-6 text-lg font-semibold rounded-3xl min-w-[220px] shadow-md hover:shadow-lg transition-all duration-200">
              再度練習する
            </Button>
          </Link>
          <Link href="/past">
            <Button
              variant="outline"
              className="px-10 py-6 text-lg font-semibold border-gray-300 rounded-3xl min-w-[220px] hover:bg-gray-50 transition-all duration-200"
            >
              他の面接を見る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
