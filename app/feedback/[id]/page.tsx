import React from "react";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

const FeedbackPage = async ({ params }: FeedbackPageProps) => {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#163300] mb-6">
            面接フィードバック
          </h1>
          <div className="bg-gray-100 rounded-xl p-8">
            <p className="text-gray-600 mb-4">面接ID: {id}</p>
            <p className="text-gray-600">
              フィードバック機能は現在開発中です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
