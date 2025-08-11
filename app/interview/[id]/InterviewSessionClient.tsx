"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewSession } from "../../../hooks/useInterviewSession";
import soundwavesAnimation from "../../../constants/soundwaves.json";

// Type definitions to match the legacy interview structure
interface Interview {
  id: string;
  name?: string;
  education?: string;
  experience?: string;
  company_name?: string;
  companyName?: string;
  role: string;
  job_description?: string;
  jobDescription?: string;
  interview_focus?:
    | "hr"
    | "case"
    | "technical"
    | "final"
    | "general"
    | "product"
    | "leadership"
    | "custom";
  interviewFocus?:
    | "hr"
    | "case"
    | "technical"
    | "final"
    | "general"
    | "product"
    | "leadership"
    | "custom";
  questions?: string[];
}

interface InterviewSessionClientProps {
  interview: Interview;
}

// Helper function to translate interview focus to Japanese
const getInterviewFocusLabel = (focus: string) => {
  const focusMap: { [key: string]: string } = {
    hr: "人事面接",
    case: "ケース面接",
    technical: "テクニカル面接",
    final: "最終面接",
    // Legacy mappings for backwards compatibility
    general: "一般的な行動面接",
    product: "プロダクト・ケース面接",
    leadership: "リーダーシップ面接",
    custom: "カスタム",
  };
  return focusMap[focus] || focus;
};

// Define interview status enum for consistency
enum InterviewStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  PROCESSING = "PROCESSING",
}

const InterviewSessionClient = ({ interview }: InterviewSessionClientProps) => {
  const router = useRouter();
  const lottieRef = useRef<HTMLDivElement>(null);

  const {
    isActive,
    isProcessing,
    isSpeaking,
    response,
    error,
    isPlayingTTS,
    currentUserTranscript,
    conversationHistory,
    isMuted,
    toggleRecording,
    toggleMute,
    generateFeedbackAndRedirect,
  } = useInterviewSession(interview.id);

  // Get status for UI display
  const getInterviewStatus = (): InterviewStatus => {
    if (isProcessing) return InterviewStatus.PROCESSING;
    if (isActive) return InterviewStatus.ACTIVE;
    return InterviewStatus.INACTIVE;
  };

  const getStatusText = () => {
    const status = getInterviewStatus();
    switch (status) {
      case InterviewStatus.INACTIVE:
        return "面接を開始してください";
      case InterviewStatus.PROCESSING:
        return "AI面接官が回答を準備中...";
      case InterviewStatus.ACTIVE:
        if (isPlayingTTS) return "AI面接官が話しています";
        if (isSpeaking) return "あなたの発言を聞いています";
        return "回答をお待ちしています";
      default:
        return "準備中...";
    }
  };

  // Get latest interviewer question for subtitles
  const getLatestInterviewerQuestion = () => {
    if (conversationHistory.length === 0) return null;
    // Find the most recent assistant (interviewer) message
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      if (conversationHistory[i].role === "assistant") {
        return conversationHistory[i];
      }
    }
    return null;
  };

  // Handle Lottie animation
  useEffect(() => {
    const loadLottie = async () => {
      if (typeof window !== "undefined") {
        const lottie = await import("lottie-web");
        if (lottieRef.current) {
          lottieRef.current.innerHTML = ""; // Clear any existing animation

          const animation = lottie.default.loadAnimation({
            container: lottieRef.current,
            renderer: "svg",
            loop: true,
            autoplay: false,
            animationData: soundwavesAnimation,
          });

          // Only play animation when user is speaking during active interview
          if (isActive && (isSpeaking || isPlayingTTS)) {
            animation.play();
          } else {
            animation.pause();
          }

          return () => animation.destroy();
        }
      }
    };

    loadLottie();
  }, [isSpeaking, isPlayingTTS, isActive]);

  const companyName =
    interview.company_name || interview.companyName || "AI面接官";
  const userName = interview.name || "候補者";

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Account for 15px navbar - using calc to ensure precise full-screen fit */}
      <div className="h-[calc(100vh-15px)] flex flex-col overflow-hidden">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 bg-white py-6">
          <div className="max-w-6xl mx-auto px-2 text-center">
            <h1 className="text-4xl font-bold text-[#163300] mb-3">
              {companyName}
            </h1>
            <p className="text-xl text-gray-600 mb-3">{interview.role}</p>
            <span className="inline-block px-4 py-2 bg-[#9fe870]/20 text-[#163300] rounded-full text-base font-medium">
              {getInterviewFocusLabel(
                interview.interview_focus || interview.interviewFocus || "hr"
              )}
            </span>
          </div>
        </div>

        {/* Main Content - Takes remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 min-h-0 overflow-hidden">
          <div className="w-full max-w-5xl h-full flex flex-col justify-center space-y-3">
            
            {/* Soundwave Animation - Fixed size */}
            <div className="flex justify-center flex-shrink-0 -mt-20">
              <div
                ref={lottieRef}
                className={`w-80 h-80 transition-opacity duration-300 ${
                  isActive && (isSpeaking || isPlayingTTS)
                    ? "opacity-100"
                    : "opacity-30"
                }`}
              />
            </div>

            {/* Status Text - Fixed height */}
            <div className="flex-shrink-0 space-y-3 text-center mb-5">
              <p className="text-2xl font-semibold text-[#163300]">
                {getStatusText()}
              </p>

              {/* Speaking Indicator - Only show during active interview */}
              {isActive && (
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      isSpeaking || isPlayingTTS
                        ? "bg-[#9fe870] animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  <p className="text-base text-gray-600">
                    {isPlayingTTS
                      ? "AI面接官が話しています..."
                      : isSpeaking
                      ? "あなたが話しています..."
                      : "聞いています..."}
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-base bg-red-50 py-3 px-6 rounded-lg max-w-2xl mx-auto">
                  {error}
                </p>
              )}
            </div>

            {/* Preset Subtitle Box - Fixed height, always present */}
            <div className="flex-shrink-0 px-1">
              <div className="h-28 w-full max-w-5xl mx-auto p-5 bg-gray-50 rounded-2xl border-2 border-transparent transition-all duration-200 overflow-y-auto">
                {isActive && getLatestInterviewerQuestion() ? (
                  <div className="text-base leading-relaxed h-full flex items-center">
                    <p className="text-gray-700 w-full">
                      <span className="font-semibold text-[#163300]">面接官:</span>{" "}
                      {getLatestInterviewerQuestion()?.content}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400 text-base">
                      {isActive ? "面接官からの質問がここに表示されます" : "面接を開始すると質問が表示されます"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls - Fixed height */}
            <div className="flex-shrink-0 flex justify-center">
              <div className="flex justify-center gap-4 flex-wrap min-h-[70px] items-center">
                {getInterviewStatus() === InterviewStatus.INACTIVE && (
                  <button
                    onClick={toggleRecording}
                    className="cursor-pointer bg-[#9fe870] text-[#163300] px-12 py-4 rounded-full font-bold text-xl hover:bg-[#8fd960] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    面接を開始
                  </button>
                )}

                {getInterviewStatus() === InterviewStatus.PROCESSING && (
                  <button
                    disabled
                    className="cursor-pointer bg-gray-300 text-gray-600 px-12 py-4 rounded-full font-bold text-xl cursor-not-allowed flex items-center gap-3"
                  >
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    処理中...
                  </button>
                )}

                {getInterviewStatus() === InterviewStatus.ACTIVE && (
                  <div className="flex gap-4">
                    <button
                      onClick={toggleMute}
                      className={`cursor-pointer px-8 py-4 rounded-full font-semibold transition-all duration-200 flex items-center gap-3 text-base ${
                        isMuted
                          ? "bg-[#9fe870] text-[#163300] hover:bg-[#8fd960]"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {isMuted ? (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.782L4.72 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.72l3.663-3.782zm7.133 2.09a1 1 0 011.414 0l2 2a1 1 0 010 1.414L18.414 10l1.516 1.516a1 1 0 01-1.414 1.414L17 11.414l-1.516 1.516a1 1 0 01-1.414-1.414L15.586 10l-1.516-1.516a1 1 0 010-1.414l2-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          ミュート中
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.782L4.72 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.72l3.663-3.782zm5.122-.827a1 1 0 011.414 0A6.169 6.169 0 0118 10a6.169 6.169 0 01-2.081 4.751 1 1 0 11-1.414-1.414A4.169 4.169 0 0016 10a4.169 4.169 0 00-1.495-3.337 1 1 0 010-1.414zM15.657 6.343a1 1 0 010 1.414A2.78 2.78 0 0116.5 10a2.78 2.78 0 01-.843 2.243 1 1 0 11-1.414-1.414A.78.78 0 0014.5 10a.78.78 0 00-.257-.757 1 1 0 011.414-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          ミュート
                        </>
                      )}
                    </button>

                    <button
                      onClick={async () => {
                        toggleRecording();
                        // Generate feedback and redirect after stopping recording
                        setTimeout(async () => {
                          await generateFeedbackAndRedirect(interview.id);
                        }, 1000);
                      }}
                      className="cursor-pointer bg-red-500 text-white px-10 py-4 rounded-full font-bold text-base hover:bg-red-600 transition-all duration-200"
                    >
                      面接を終了
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionClient;