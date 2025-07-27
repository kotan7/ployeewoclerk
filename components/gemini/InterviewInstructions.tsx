"use client";

import React from "react";

interface InterviewInstructionsProps {
  silenceDuration: number;
}

export default function InterviewInstructions({
  silenceDuration,
}: InterviewInstructionsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-800 mb-2">
        面接システムの使い方:
      </h3>
      <ul className="text-blue-700 space-y-1 ml-4">
        <li>• 「会話開始」をクリックして面接を開始</li>
        <li>• 面接官が積極的に質問を投げかけます</li>
        <li>
          • {silenceDuration / 1000}
          秒間静かにすると自動的に次の質問が来ます
        </li>
        <li>• 自己紹介→経歴→スキル→志望動機→質疑応答の順で進みます</li>
        <li>• 具体的なエピソードや例を交えて回答してください</li>
        <li>• 浅い回答の場合は面接官が深掘り質問をします</li>
        <li>• 「会話終了」で面接を終了</li>
      </ul>
    </div>
  );
}
