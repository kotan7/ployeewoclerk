import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { getTranscript } from "@/lib/actions/interview.actions";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

// Interface for the evaluation result
interface QuestionEvaluation {
  question: string;
  answer: string;
  score: number; // 0-100
  feedback: string; // 2-3 sentences in Japanese
}

interface InterviewEvaluation {
  overallScore: number;
  questionEvaluations: QuestionEvaluation[];
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-green-50";
  if (score >= 60) return "bg-yellow-50";
  return "bg-red-50";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "good":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "warning":
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    case "poor":
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return null;
  }
};

const getStatusBorder = (status: string) => {
  switch (status) {
    case "good":
      return "border-l-green-400";
    case "warning":
      return "border-l-yellow-400";
    case "poor":
      return "border-l-red-400";
    default:
      return "border-l-gray-300";
  }
};

const FeedbackPage = async ({ params }: FeedbackPageProps) => {
  const { id } = await params;

  // Fetch the transcript for this interview using the action
  let transcriptData = null;
  let evaluationData: InterviewEvaluation | null = null;

  try {
    transcriptData = await getTranscript(id);

    // If transcript exists, get AI evaluation from API
    if (transcriptData && transcriptData.transcript) {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/qna-pairs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ interviewId: id }),
        }
      );

      if (response.ok) {
        evaluationData = await response.json();
      } else {
        console.error("Failed to get evaluation:", response.status);
      }
    }
  } catch (error) {
    console.error("Error fetching transcript or evaluation:", error);
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

        {/* AI Evaluation Section */}
        {evaluationData && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold text-[#163300] mb-6">
              AI評価結果
            </h2>

            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#9fe870] to-[#7dd141] rounded-full mb-4">
                <span className="text-2xl font-bold text-[#163300]">
                  {evaluationData.overallScore}
                </span>
              </div>
              <p className="text-gray-600">総合スコア</p>
            </div>

            {/* Individual Question Evaluations */}
            <div className="space-y-6">
              {evaluationData.questionEvaluations.map(
                (evaluation: QuestionEvaluation, index: number) => (
                  <div
                    key={index}
                    className="border-l-4 border-[#9fe870] pl-6 py-4 bg-gray-50 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-[#163300] text-lg">
                        質問 {index + 1}
                      </h3>
                      <span className="bg-[#9fe870] text-[#163300] px-3 py-1 rounded-full text-sm font-bold">
                        {evaluation.score}点
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-700 font-medium mb-2">
                        {evaluation.question}
                      </p>
                      <p className="text-gray-600 text-sm bg-white p-3 rounded-lg">
                        {evaluation.answer}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        フィードバック
                      </h4>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        {evaluation.feedback}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Show message if no evaluation yet */}
        {transcriptData && transcriptData.transcript && !evaluationData && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold text-[#163300] mb-6">
              AI評価結果
            </h2>
            <div className="text-center py-12">
              <div className="bg-yellow-50 rounded-lg p-6 mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  評価を生成中...
                </h3>
                <p className="text-yellow-700">
                  AI評価機能を使用するには、環境変数の設定が必要です。
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
