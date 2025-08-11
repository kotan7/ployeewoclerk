import React from "react";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getFeedback, getWorkflowState } from "@/lib/actions/interview.actions";
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
  score: number;
  feedback: string;
}

interface PhaseAnalysis {
  phase: string;
  completed: boolean;
  score: number;
  feedback: string;
}

interface DetailedFeedback {
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

const FeedbackPage = async ({ params }: FeedbackPageProps) => {
  const { id } = await params;

  // Fetch the saved feedback for this interview
  let workflowStateData = null;
  let feedbackData = null;

  try {
    // Get workflow state and feedback data
    const [workflowState, feedback] = await Promise.all([
      getWorkflowState(id),
      getFeedback(id),
    ]);

    workflowStateData = workflowState;
    feedbackData = feedback;
  } catch (error) {
    console.error("Error fetching feedback data:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#163300] mb-6">
            面接フィードバック
          </h1>
          <p className="text-xl text-gray-600 font-semibold max-w-3xl mx-auto">
            あなたの面接パフォーマンスを詳しく分析し、
            <strong>具体的な改善点</strong>をお伝えします
          </p>
        </div>

        {/* Overall Feedback Section */}
        {(() => {
          // Check for the modern overallFeedback format first
          let overallFeedback: OverallFeedback | null = null;
          let phaseAnalysis: PhaseAnalysis[] = [];
          let detailedFeedback: DetailedFeedback | null = null;

          if (feedbackData?.overallFeedback) {
            try {
              if (typeof feedbackData.overallFeedback === "string") {
                overallFeedback = JSON.parse(feedbackData.overallFeedback);
              } else if (typeof feedbackData.overallFeedback === "object") {
                overallFeedback = feedbackData.overallFeedback;
              }

              // Also get phase analysis and detailed feedback if available
              if ((feedbackData as any).phaseAnalysis) {
                phaseAnalysis = Array.isArray(
                  (feedbackData as any).phaseAnalysis
                )
                  ? (feedbackData as any).phaseAnalysis
                  : JSON.parse((feedbackData as any).phaseAnalysis);
              }

              if ((feedbackData as any).detailedFeedback) {
                detailedFeedback =
                  typeof (feedbackData as any).detailedFeedback === "string"
                    ? JSON.parse((feedbackData as any).detailedFeedback)
                    : (feedbackData as any).detailedFeedback;
              }
            } catch (error) {
              console.error("Error parsing overallFeedback:", error);
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
              if (parsedData?.phaseAnalysis) {
                phaseAnalysis = parsedData.phaseAnalysis;
              }
              if (parsedData?.detailedFeedback) {
                detailedFeedback = parsedData.detailedFeedback;
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

                  {/* Score Display */}
                  <div className="flex items-center justify-center lg:justify-start">
                    <div className="relative">
                      <svg
                        className="w-32 h-32 transform -rotate-90"
                        viewBox="0 0 120 120"
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#9fe870"
                          strokeWidth="8"
                          strokeDasharray={`${
                            (overallFeedback.score / 100) * 314
                          } 314`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-[#163300]">
                          {overallFeedback.score}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#163300] mb-4">
                      総合フィードバック
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {overallFeedback.feedback}
                    </p>
                  </div>
                </div>

                {/* Right Column: Chart */}
                <div className="flex justify-center">
                  <InterviewRadarChart
                    data={phaseAnalysis.map((phase) => ({
                      criteria: phase.phase,
                      score: phase.score,
                    }))}
                    frameless={true}
                  />
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Phase Analysis Section */}
        {(() => {
          let phaseAnalysis: PhaseAnalysis[] = [];

          // Try to get phase analysis data
          if ((feedbackData as any)?.phaseAnalysis) {
            try {
              phaseAnalysis = Array.isArray((feedbackData as any).phaseAnalysis)
                ? (feedbackData as any).phaseAnalysis
                : JSON.parse((feedbackData as any).phaseAnalysis);
            } catch (error) {
              console.error("Error parsing phase analysis:", error);
            }
          } else if (feedbackData?.feedback) {
            // Fallback to parsing from main feedback
            try {
              const parsedData =
                typeof feedbackData.feedback === "string"
                  ? JSON.parse(feedbackData.feedback)
                  : feedbackData.feedback;

              if (parsedData?.phaseAnalysis) {
                phaseAnalysis = parsedData.phaseAnalysis;
              }
            } catch (error) {
              console.error(
                "Error parsing phase analysis from feedback:",
                error
              );
            }
          }

          return phaseAnalysis.length > 0 ? (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
              <h2 className="text-2xl font-semibold text-[#163300] mb-8">
                フェーズ別分析
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {phaseAnalysis.map((phase, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      phase.completed
                        ? "border-[#9fe870] bg-[#9fe870]/5"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-[#163300]">
                        {phase.phase}
                      </h3>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            phase.completed ? "text-[#163300]" : "text-gray-400"
                          }`}
                        >
                          {phase.score}
                        </div>
                        <span className="text-sm text-gray-500">/10</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                        phase.completed
                          ? "bg-[#9fe870] text-[#163300]"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {phase.completed ? "完了" : "未完了"}
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      {phase.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Detailed Feedback Section */}
        {(() => {
          let detailedFeedback: DetailedFeedback | null = null;

          // Try to get detailed feedback data
          if ((feedbackData as any)?.detailedFeedback) {
            try {
              detailedFeedback =
                typeof (feedbackData as any).detailedFeedback === "string"
                  ? JSON.parse((feedbackData as any).detailedFeedback)
                  : (feedbackData as any).detailedFeedback;
            } catch (error) {
              console.error("Error parsing detailed feedback:", error);
            }
          } else if (feedbackData?.feedback) {
            // Fallback to parsing from main feedback
            try {
              const parsedData =
                typeof feedbackData.feedback === "string"
                  ? JSON.parse(feedbackData.feedback)
                  : feedbackData.feedback;

              if (parsedData?.detailedFeedback) {
                detailedFeedback = parsedData.detailedFeedback;
              }
            } catch (error) {
              console.error(
                "Error parsing detailed feedback from feedback:",
                error
              );
            }
          }

          return detailedFeedback ? (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
              <h2 className="text-2xl font-semibold text-[#163300] mb-8">
                詳細フィードバック
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Strengths */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#163300] flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    強み
                  </h3>
                  <ul className="space-y-3">
                    {detailedFeedback.strengths?.map((strength, index) => (
                      <li
                        key={index}
                        className="text-gray-700 text-sm bg-green-50 p-3 rounded-lg border-l-4 border-green-400"
                      >
                        {strength}
                      </li>
                    )) || []}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#163300] flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    改善点
                  </h3>
                  <ul className="space-y-3">
                    {detailedFeedback.improvements?.map(
                      (improvement, index) => (
                        <li
                          key={index}
                          className="text-gray-700 text-sm bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400"
                        >
                          {improvement}
                        </li>
                      )
                    ) || []}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#163300] flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    アドバイス
                  </h3>
                  <ul className="space-y-3">
                    {detailedFeedback.recommendations?.map(
                      (recommendation, index) => (
                        <li
                          key={index}
                          className="text-gray-700 text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400"
                        >
                          {recommendation}
                        </li>
                      )
                    ) || []}
                  </ul>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Show message if no feedback yet */}
        {workflowStateData &&
          workflowStateData.conversationHistory &&
          workflowStateData.conversationHistory.length > 0 &&
          !feedbackData && (
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
              <h2 className="text-2xl font-semibold text-[#163300] mb-8">
                フィードバック準備中
              </h2>
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9fe870]/20 rounded-full mb-6">
                  <svg
                    className="w-8 h-8 text-[#163300] animate-spin"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  面接の分析が完了し次第、詳細なフィードバックをお届けします
                </p>
                <p className="text-sm text-gray-500">
                  通常1-2分程度でフィードバックが生成されます
                </p>
              </div>
            </div>
          )}

        {/* Show message if no interview data */}
        {(!workflowStateData ||
          !workflowStateData.conversationHistory ||
          workflowStateData.conversationHistory.length === 0) && (
          <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 mb-10">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                面接記録が見つかりません
              </h2>
              <p className="text-gray-600 mb-8">
                この面接のデータが見つからないか、まだ面接が完了していない可能性があります。
              </p>
              <Link href="/interview/new">
                <Button className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] px-8 py-3 text-lg font-semibold rounded-2xl">
                  新しい面接を開始
                </Button>
              </Link>
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
