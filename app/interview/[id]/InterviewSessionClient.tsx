"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterview, CallStatus } from "@/components/ui/interviewComponent";
import soundwavesAnimation from "@/constants/soundwaves.json";
import { vapi } from "@/lib/vapi.sdk";

// Type definitions for messages
interface Message {
  type: string;
  transcriptType?: string;
  role: "user" | "assistant";
  transcript?: string;
}

interface SavedMessage {
  role: "user" | "assistant";
  content: string;
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
    | "general"
    | "technical"
    | "product"
    | "leadership"
    | "custom";
  interviewFocus?:
    | "general"
    | "technical"
    | "product"
    | "leadership"
    | "custom";
  questions?: string[];
}

interface InterviewSessionClientProps {
  interview: Interview;
}

const InterviewSessionClient = ({ interview }: InterviewSessionClientProps) => {
  const router = useRouter();
  const lottieRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  // Get company name for subtitle display
  const name = interview.company_name || interview.companyName || "面接官";
  const userName = "あなた"; // User name for subtitles

  const {
    callStatus,
    isSpeaking,
    isMuted,
    error,
    startCall,
    endCall,
    toggleMute,
    getStatusText,
    isGeneratingFeedback,
    handleGenerateFeedback,
    questions,
  } = useInterview({
    name: interview.name,
    education: interview.education,
    experience: interview.experience,
    companyName: interview.company_name || interview.companyName,
    role: interview.role,
    jobDescription: interview.job_description || interview.jobDescription,
    interviewFocus: interview.interview_focus || interview.interviewFocus,
    questions: interview.questions,
    interviewId: interview.id,
  });

  // Redirect to feedback page when interview is finished
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      // router.push(`/feedback/${interview.id}`);
    }
  }, [callStatus, router, interview.id]);

  useEffect(() => {
    // Load and control Lottie animation based on speaking state
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

          // Only play animation when user is speaking during active call
          if (callStatus === CallStatus.ACTIVE && isSpeaking) {
            animation.play();
          } else {
            animation.pause();
          }

          return () => animation.destroy();
        }
      }
    };

    loadLottie();
  }, [isSpeaking, callStatus]);

  // Handle incoming messages for subtitles
  useEffect(() => {
    const OnMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role,
          content: message.transcript || "",
        };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };

    // Add the message listener
    vapi.on("message", OnMessage);

    // Cleanup
    return () => {
      vapi.off("message", OnMessage);
    };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-[#163300] mb-3">
            {interview.company_name || interview.companyName}
          </h1>
          <p className="text-lg text-gray-600 mb-2">{interview.role}</p>
          <span className="inline-block px-3 py-1 bg-[#9fe870]/20 text-[#163300] rounded-full text-sm font-medium">
            {getInterviewFocusLabel(
              interview.interview_focus || interview.interviewFocus || ""
            )}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-6">
        <div className="w-full max-w-2xl text-center space-y-6">
          {/* Single Soundwave Animation */}
          <div className="flex justify-center -mt-12">
            <div
              ref={lottieRef}
              className={`w-96 h-96 transition-opacity duration-300 ${
                callStatus === CallStatus.ACTIVE && isSpeaking
                  ? "opacity-100"
                  : "opacity-30"
              }`}
            />
          </div>

          {/* Status Text */}
          <div className="space-y-3">
            <p className="text-xl font-semibold text-[#163300]">
              {getStatusText()}
            </p>

            {/* Speaking Indicator - Only show during active call */}
            {callStatus === CallStatus.ACTIVE && (
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    isSpeaking ? "bg-[#9fe870] animate-pulse" : "bg-gray-400"
                  }`}
                />
                <p className="text-sm text-gray-600">
                  {isSpeaking ? "話しています..." : "聞いています..."}
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm bg-red-50 py-2 px-4 rounded-lg">
                {error}
              </p>
            )}
          </div>

          {/* Subtitles - Only show during active call when there are messages */}
          {callStatus === CallStatus.ACTIVE && messages.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg w-full max-w-4xl mx-auto">
              <div className="text-base leading-relaxed">
                {(() => {
                  const latestMessage = messages[0];
                  if (latestMessage.role === "assistant") {
                    return (
                      <p className="text-gray-700">
                        {name.split(" ")[0].replace(/[.,]/g, "")}:{" "}
                        {latestMessage.content}
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-[#163300] font-medium">
                        {userName}: {latestMessage.content}
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4 flex-wrap min-h-[60px] items-center">
            {callStatus === CallStatus.INACTIVE && (
              <button
                onClick={startCall}
                className="cursor-pointer bg-[#9fe870] text-[#163300] px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                面接を開始
              </button>
            )}

            {callStatus === CallStatus.CONNECTING && (
              <button
                disabled
                className="cursor-pointer bg-gray-300 text-gray-600 px-10 py-4 rounded-full font-semibold text-lg cursor-not-allowed flex items-center gap-2"
              >
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                接続中...
              </button>
            )}

            {callStatus === CallStatus.ACTIVE && (
              <div className="flex gap-3">
                <button
                  onClick={toggleMute}
                  className={`cursor-pointer px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                    isMuted
                      ? "bg-[#9fe870] text-[#163300] hover:bg-[#8fd960]"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {isMuted ? (
                    <>
                      <svg
                        className="w-4 h-4"
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
                        className="w-4 h-4"
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
                  onClick={endCall}
                  className="cursor-pointer bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-all duration-200"
                >
                  面接を終了
                </button>
              </div>
            )}

            {callStatus === CallStatus.FINISHED && (
              <button
                onClick={handleGenerateFeedback}
                disabled={isGeneratingFeedback}
                className="cursor-pointer bg-[#9fe870] text-[#163300] px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGeneratingFeedback
                  ? "フィードバックを生成中..."
                  : "フィードバックを生成"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionClient;
