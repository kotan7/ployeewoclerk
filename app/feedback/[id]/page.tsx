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

    console.log("Feedback page data:", {
      transcriptData,
      feedbackData,
      questionsData,
    });
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

        {/* Transcript Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-[#163300] mb-6">
            面接の書き起こし
          </h2>

          {transcriptData && transcriptData.transcript ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {transcriptData.transcript}
                </div>
              </div>

              <div className="text-sm text-gray-500 text-center">
                記録日時:{" "}
                {new Date(transcriptData.createdAt).toLocaleString("ja-JP")}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-yellow-50 rounded-lg p-6 mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  書き起こしが見つかりません
                </h3>
                <p className="text-yellow-700">
                  面接が完了していないか、音声の記録に問題があった可能性があります。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Feedback Section */}
        {feedbackData &&
          feedbackData.feedback &&
          questionsData &&
          (() => {
            // Parse feedback data - it might be stored as JSON string
            let parsedFeedback: FeedbackItem[] = [];

            try {
              if (Array.isArray(feedbackData.feedback)) {
                parsedFeedback = feedbackData.feedback;
              } else if (typeof feedbackData.feedback === "string") {
                parsedFeedback = JSON.parse(feedbackData.feedback);
              } else {
                parsedFeedback = [feedbackData.feedback];
              }
            } catch (error) {
              console.error("Error parsing feedback data:", error);
              console.error("Raw feedback data:", feedbackData.feedback);
              return (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-xl font-semibold text-[#163300] mb-6">
                    AI評価結果
                  </h2>
                  <div className="text-center py-12">
                    <div className="bg-red-50 rounded-lg p-6">
                      <p className="text-red-700">
                        フィードバックデータの読み込みでエラーが発生しました。
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            const averageScore =
              parsedFeedback.length > 0
                ? Math.round(
                    parsedFeedback.reduce(
                      (acc: number, item: FeedbackItem) =>
                        acc + parseInt(item.score),
                      0
                    ) / parsedFeedback.length
                  )
                : 0;

            return (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-semibold text-[#163300] mb-6">
                  AI評価結果
                </h2>

                {/* Overall Score */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#9fe870] to-[#7dd141] rounded-full mb-4">
                    <span className="text-2xl font-bold text-[#163300]">
                      {averageScore}
                    </span>
                  </div>
                  <p className="text-gray-600">総合スコア (平均)</p>
                </div>

                {/* Individual Question Evaluations */}
                <div className="space-y-6">
                  {parsedFeedback.map((item: FeedbackItem, index: number) => (
                    <div
                      key={index}
                      className="border-l-4 border-[#9fe870] pl-6 py-4 bg-gray-50 rounded-r-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-[#163300] text-lg">
                          質問 {index + 1}
                        </h3>
                        <span className="bg-[#9fe870] text-[#163300] px-3 py-1 rounded-full text-sm font-bold">
                          {item.score}/10
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-700 font-medium mb-2">
                          {questionsData.questions[index] ||
                            `質問 ${index + 1}`}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          フィードバック
                        </h4>
                        <p className="text-blue-700 text-sm leading-relaxed">
                          {item.feedback}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
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
            <Button className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] px-12 py-4 text-lg font-semibold rounded-xl min-w-[200px]">
              再度練習する
            </Button>
          </Link>
          <Link href="/past">
            <Button
              variant="outline"
              className="px-12 py-4 text-lg font-semibold border-gray-300 rounded-xl min-w-[200px]"
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
