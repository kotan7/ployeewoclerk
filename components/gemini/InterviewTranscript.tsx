"use client";

import React from "react";

interface InterviewTranscriptProps {
  currentUserTranscript: string;
  fullTranscript: string;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
  onDownloadTranscript: () => void;
}

export default function InterviewTranscript({
  currentUserTranscript,
  fullTranscript,
  conversationHistory,
  onDownloadTranscript,
}: InterviewTranscriptProps) {
  return (
    <>
      {/* Current User Transcript */}
      {currentUserTranscript && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">あなたの発言:</h3>
          <p className="text-yellow-700 text-sm">{currentUserTranscript}</p>
        </div>
      )}

      {/* Transcript Download */}
      {fullTranscript && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-purple-800">
              面接記録 ({Math.floor(conversationHistory.length / 2)}
              回のやり取り)
            </h3>
            <button
              onClick={onDownloadTranscript}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              記録をダウンロード
            </button>
          </div>
          <div className="mt-2 max-h-32 overflow-y-auto text-sm text-purple-700 whitespace-pre-wrap">
            {fullTranscript}
          </div>
        </div>
      )}
    </>
  );
}
