"use client";

import React from "react";

interface InterviewPhaseProps {
  isActive: boolean;
  interviewPhase:
    | "introduction"
    | "experience"
    | "skills"
    | "motivation"
    | "closing";
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
}

export default function InterviewPhase({
  isActive,
  interviewPhase,
  conversationHistory,
}: InterviewPhaseProps) {
  if (!isActive) return null;

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case "introduction":
        return "自己紹介";
      case "experience":
        return "経歴・経験";
      case "skills":
        return "スキル確認";
      case "motivation":
        return "志望動機";
      case "closing":
        return "質疑応答";
      default:
        return phase;
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-blue-800">
          面接フェーズ: {getPhaseName(interviewPhase)}
        </h3>
        <span className="text-sm text-blue-600">
          やり取り: {Math.floor(conversationHistory.length / 2)}回
        </span>
      </div>
    </div>
  );
}
