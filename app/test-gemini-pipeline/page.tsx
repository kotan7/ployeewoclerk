"use client";

import React from "react";
import { useInterviewSession } from "../../hooks/useInterviewSession";
import InterviewControls from "../../components/gemini/InterviewControls";
import InterviewStatus from "../../components/gemini/InterviewStatus";
import InterviewPhase from "../../components/gemini/InterviewPhase";
import InterviewResponse from "../../components/gemini/InterviewResponse";
import InterviewTranscript from "../../components/gemini/InterviewTranscript";
import InterviewInstructions from "../../components/gemini/InterviewInstructions";

export default function TestGeminiPipeline() {
  const {
    isActive,
    isProcessing,
    isSpeaking,
    response,
    error,
    silenceTimer,
    hasSpokenInCurrentSession,
    isPlayingTTS,
    fullTranscript,
    currentUserTranscript,
    conversationHistory,
    interviewPhase,
    candidateInfo,
    toggleRecording,
    downloadTranscript,
    SILENCE_DURATION,
  } = useInterviewSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI面接システム
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Recording Controls */}
          <InterviewControls
            isActive={isActive}
            isProcessing={isProcessing}
            onToggleRecording={toggleRecording}
          />

          {/* Real-time Status */}
          <InterviewStatus
            isActive={isActive}
            isSpeaking={isSpeaking}
            isPlayingTTS={isPlayingTTS}
            hasSpokenInCurrentSession={hasSpokenInCurrentSession}
            silenceTimer={silenceTimer}
            isProcessing={isProcessing}
            silenceDuration={SILENCE_DURATION}
          />

          {/* Interview Phase & Stats */}
          <InterviewPhase
            isActive={isActive}
            interviewPhase={interviewPhase}
            conversationHistory={conversationHistory}
          />

          {/* Response and Error */}
          <InterviewResponse response={response} error={error} />

          {/* Transcript Display */}
          <InterviewTranscript
            currentUserTranscript={currentUserTranscript}
            fullTranscript={fullTranscript}
            conversationHistory={conversationHistory}
            onDownloadTranscript={downloadTranscript}
          />

          {/* Instructions */}
          <InterviewInstructions silenceDuration={SILENCE_DURATION} />
        </div>
      </div>
    </div>
  );
}
