import React from "react";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  getTranscript,
  getFeedback,
  getQuestions,
} from "@/lib/actions/interview.actions";

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
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#163300]">面接結果</h1>
          <p className="text-gray-600 mt-2">面接の詳細な記録を確認できます</p>
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-semibold text-[#163300] mb-6">
                総合評価
              </h2>

              <div className="space-y-6">
                {/* Overall Score Display */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#9fe870] to-[#7dd141] rounded-full mb-4">
                    <span className="text-3xl font-bold text-[#163300]">
                      {overallFeedback.score}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    総合スコア (100点満点)
                  </p>
                </div>

                {/* Overall Feedback Text */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#163300] mb-3">
                    面接官からの総評
                  </h3>
                  <p className="text-gray-800 leading-relaxed text-base">
                    {overallFeedback.feedback}
                  </p>
                </div>

                {feedbackData?.createdAt && (
                  <div className="text-sm text-gray-500 text-center">
                    評価日時:{" "}
                    {new Date(feedbackData.createdAt).toLocaleString("ja-JP")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-semibold text-[#163300] mb-6">
                面接結果
              </h2>
              <div className="text-center py-12">
                <div className="bg-yellow-50 rounded-lg p-6 mb-4">
                  <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-semibold text-[#163300] mb-6">
                AI評価結果
              </h2>

              {/* Overall Score */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#9fe870] to-[#7dd141] rounded-full mb-4">
                  <span className="text-2xl font-bold text-[#163300]">
                    {Math.round(
                      parsedFeedback.reduce(
                        (acc: number, item: FeedbackItem) =>
                          acc + parseInt(item.score),
                        0
                      ) / parsedFeedback.length
                    )}
                  </span>
                </div>
                <p className="text-gray-600">総合スコア (平均)</p>
              </div>

              {/* Individual Question Evaluations */}
              <div className="space-y-6">
                {parsedFeedback.map((item: FeedbackItem, index: number) => {
                  const score = parseInt(item.score) || 0;
                  const hasAnswer =
                    score > 0 && item.feedback && item.feedback.trim() !== "";

                  return (
                    <div
                      key={index}
                      className={`border-l-4 pl-6 py-4 rounded-r-lg ${
                        hasAnswer
                          ? "border-[#9fe870] bg-gray-50"
                          : "border-gray-300 bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-[#163300] text-lg">
                          質問 {index + 1}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            hasAnswer
                              ? "bg-[#9fe870] text-[#163300]"
                              : "bg-gray-400 text-white"
                          }`}
                        >
                          {score}/10
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-700 font-medium mb-2">
                          {questionsData.questions[index]}
                        </p>
                      </div>

                      {hasAnswer ? (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">
                            フィードバック
                          </h4>
                          <p className="text-blue-700 text-sm leading-relaxed">
                            {item.feedback}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-200 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-600 mb-2">
                            フィードバック
                          </h4>
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
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold text-[#163300] mb-6">
              AI評価結果
            </h2>
            <div className="text-center py-12">
              <div className="bg-yellow-50 rounded-lg p-6 mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
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
        <div className="flex flex-col sm:flex-row gap-6 mt-12 justify-center">
          <Link href="/interview/new">
            <Button className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] px-8 py-6 text-lg font-semibold rounded-3xl min-w-[200px]">
              再度練習する
            </Button>
          </Link>
          <Link href="/past">
            <Button
              variant="outline"
              className="px-8 py-6 text-lg font-semibold border-gray-300 rounded-3xl min-w-[200px]"
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
