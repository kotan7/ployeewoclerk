"use client";

import React from "react";

interface InterviewStatusProps {
  isActive: boolean;
  isSpeaking: boolean;
  isPlayingTTS: boolean;
  hasSpokenInCurrentSession: boolean;
  silenceTimer: number;
  isProcessing: boolean;
  silenceDuration: number;
}

export default function InterviewStatus({
  isActive,
  isSpeaking,
  isPlayingTTS,
  hasSpokenInCurrentSession,
  silenceTimer,
  isProcessing,
  silenceDuration,
}: InterviewStatusProps) {
  if (!isActive) return null;

  const silenceProgress = (silenceTimer / silenceDuration) * 100;

  return (
    <div className="text-center space-y-4">
      {/* Speaking Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-300"
          }`}
        ></div>
        <span
          className={`font-medium ${
            isSpeaking ? "text-green-500" : "text-gray-500"
          }`}
        >
          {isPlayingTTS
            ? "AI応答中..."
            : isSpeaking
            ? "音声検出中..."
            : hasSpokenInCurrentSession
            ? "音声待機中..."
            : "話しかけてください..."}
        </span>
      </div>

      {/* Silence Timer */}
      {silenceTimer > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-blue-600">
            送信まで: {Math.ceil((silenceDuration - silenceTimer) / 1000)}秒
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${silenceProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-500 font-medium">AI処理中...</span>
        </div>
      )}
    </div>
  );
}
