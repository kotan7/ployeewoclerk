"use client";

import React from "react";

interface InterviewControlsProps {
  isActive: boolean;
  isProcessing: boolean;
  onToggleRecording: () => void;
}

export default function InterviewControls({
  isActive,
  isProcessing,
  onToggleRecording,
}: InterviewControlsProps) {
  return (
    <div className="text-center">
      <button
        onClick={onToggleRecording}
        disabled={isProcessing}
        className={`px-8 py-4 rounded-full font-semibold text-lg transition-all ${
          isActive
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        {isActive ? "会話終了" : "会話開始"}
      </button>
    </div>
  );
}
