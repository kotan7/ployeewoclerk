"use client";

import { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";

export enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  CONNECTING = "CONNECTING",
  FINISHED = "FINISHED",
}

interface UseInterviewProps {
  companyName?: string;
  role?: string;
  jobDescription?: string;
  interviewFocus?:
    | "general"
    | "technical"
    | "product"
    | "leadership"
    | "custom";
  resume?: FileList;
}

export const useInterview = ({
  companyName,
  role,
  jobDescription,
  resume,
}: UseInterviewProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
    };

    const onMessage = (message: any) => {
      console.log("Vapi message:", message);
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => {
      console.error("Vapi error:", error);
      setError(error.message);
      setCallStatus(CallStatus.INACTIVE);
    };

    // Add event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    // Cleanup function
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);

  const startCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      await vapi.start({
        name: "AI Interview Assistant",
        firstMessage:
          "こんにちは。本日はもぎ面接にご参加いただきありがとうございます。まずは簡単に自己紹介をお願いします。",
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `あなたは面接官です。以下の情報を元に、模擬面接を日本語で行ってください。

【応募者情報】
- 履歴書概要: ${resume ? "提出済み" : "未提出"}
- 志望企業: ${companyName || "未入力"}
- 志望職種: ${role || "未入力"}
- 職務内容: ${jobDescription || "未入力"}

【面接の進め方ルール】
- 1回につき1つの質問をしてください。
- ユーザーの回答に応じて深掘り質問をしてください。
- フィードバックは行わず、リアルな面接官のように振る舞ってください。
- 丁寧かつ自然な日本語で話してください。`,
            },
          ],
        },
        voice: {
          provider: "vapi",
          voiceId: "Hana",
        },
        transcriber: {
          provider: "deepgram",
          language: "ja",
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setError("通話を開始できませんでした");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const endCall = async () => {
    try {
      await vapi.stop();
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
    } catch (error) {
      console.error("Failed to end call:", error);
      setError("通話を終了できませんでした");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    vapi.setMuted(!isMuted);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CallStatus.INACTIVE:
        return "面接を開始する準備ができました";
      case CallStatus.CONNECTING:
        return "接続中...";
      case CallStatus.ACTIVE:
        return "面接中";
      case CallStatus.FINISHED:
        return "面接が終了しました";
      default:
        return "";
    }
  };

  return {
    callStatus,
    isSpeaking,
    isMuted,
    error,
    startCall,
    endCall,
    toggleMute,
    getStatusText,
    setCallStatus,
  };
};
