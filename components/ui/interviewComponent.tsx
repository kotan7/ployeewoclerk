"use client";

import { useEffect, useState, useCallback } from "react";
import { vapi } from "@/lib/vapi.sdk";
import {
  saveFeedback,
  getWorkflowState,
} from "@/lib/actions/interview.actions";
import {
  addSessionUsage,
  canStartSession,
  getUserPlanLimit,
  getCurrentUsage,
} from "@/lib/actions/usage.actions";
import {
  calculateSessionMinutes,
  redirectToPricing,
  checkUsageLimitExceeded,
} from "@/lib/utils";

export enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  CONNECTING = "CONNECTING",
  FINISHED = "FINISHED",
}

interface UseInterviewProps {
  name?: string;
  education?: string;
  experience?: string;
  companyName?: string;
  role?: string;
  jobDescription?: string;
  interviewFocus?:
    | "general"
    | "technical"
    | "product"
    | "leadership"
    | "custom";
  questions?: string[]; // Pre-generated questions from database
  interviewId?: string; // Add interview ID to link transcript
}

// Interface for transcript messages
interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export const useInterview = ({
  name,
  education,
  experience,
  companyName,
  role,
  jobDescription,
  interviewFocus,
  questions = [], // Default to empty array if no questions provided
  interviewId,
}: UseInterviewProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullTranscript, setFullTranscript] = useState<TranscriptMessage[]>([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [usageMonitorInterval, setUsageMonitorInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Remove predefined questions - system prompt will generate questions dynamically

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
      setFullTranscript([]); // Reset transcript when starting new call
      setSessionStartTime(new Date()); // Track session start time for usage

      // Start monitoring usage every 60 seconds
      const interval = setInterval(async () => {
        try {
          if (!sessionStartTime) return;

          const currentUsage = await getCurrentUsage();
          const planLimit = await getUserPlanLimit();
          const currentSessionTime = Math.ceil(
            (new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60)
          );
          const totalUsage = currentUsage + currentSessionTime;

          if (checkUsageLimitExceeded(totalUsage, planLimit)) {
            console.log(
              `Usage limit exceeded: ${totalUsage}/${planLimit} minutes. Ending session.`
            );
            await vapi.stop(); // This will trigger onCallEnd
            redirectToPricing();
          }
        } catch (error) {
          console.error("Error during usage monitoring:", error);
        }
      }, 60000); // Check every 60 seconds

      setUsageMonitorInterval(interval);
    };

    const onCallEnd = async () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);

      // Clear usage monitoring interval
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
        setUsageMonitorInterval(null);
      }

      // Calculate and save session usage
      if (sessionStartTime) {
        try {
          const sessionEndTime = new Date();
          const sessionMinutes = calculateSessionMinutes(
            sessionStartTime,
            sessionEndTime
          );

          if (sessionMinutes > 0) {
            await addSessionUsage(sessionMinutes);
            console.log(
              `Session completed: ${sessionMinutes} minutes added to usage`
            );
          }
        } catch (error) {
          console.error("Failed to track session usage:", error);
          // Continue with the rest of the function even if usage tracking fails
        }
        setSessionStartTime(null);
      }

      // Note: Transcript saving removed - using conversation history instead
    };

    const onMessage = (message: any) => {
      console.log("Vapi message:", message);

      // Capture transcript messages
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage: TranscriptMessage = {
          role: message.role,
          content: message.transcript || "",
          timestamp: Date.now(),
        };

        setFullTranscript((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = async (error: Error) => {
      console.error("Vapi error:", error);
      setError(error.message);
      setCallStatus(CallStatus.INACTIVE);

      // Clear usage monitoring interval
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
        setUsageMonitorInterval(null);
      }

      // Track usage if session was active when error occurred
      if (sessionStartTime) {
        try {
          const sessionEndTime = new Date();
          const sessionMinutes = calculateSessionMinutes(
            sessionStartTime,
            sessionEndTime
          );

          if (sessionMinutes > 0) {
            await addSessionUsage(sessionMinutes);
            console.log(
              `Session ended due to error: ${sessionMinutes} minutes added to usage`
            );
          }
        } catch (usageError) {
          console.error("Failed to track session usage on error:", usageError);
        }
        setSessionStartTime(null);
      }
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
      vapi.on("error", onError as (error: any) => void);
      vapi.off("error", onError as (error: any) => void);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, [
    fullTranscript,
    interviewId,
    sessionStartTime,
    callStatus,
    usageMonitorInterval,
  ]); // Add dependencies

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
      }
    };
  }, [usageMonitorInterval]);

  const startCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      // Pre-session usage check
      const usageCheck = await canStartSession();
      if (!usageCheck.canStart) {
        setError(
          `月間利用制限に達しました (${usageCheck.currentUsage}/${usageCheck.planLimit}分)`
        );
        setCallStatus(CallStatus.INACTIVE);
        redirectToPricing();
        return;
      }

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
              content: `あなたは経験豊富なプロの面接官です。応募者の情報に基づいて、適切な面接質問を動的に生成し、深掘りしながら面接を進行してください。

【面接の進行ルール】
1. **自己紹介から開始**し、応募者の回答に基づいて自然な流れで質問を展開する
2. 応募者の回答が不十分な場合は、**最大2回までフォローアップ質問**を行い、十分な詳細を引き出す
3. 約5-7つの質問で面接を構成し、応募者の能力・適性・志望動機を総合的に評価する
4. 十分な情報が得られたら「以上で面接を終了いたします」とだけ述べて終了する

【質問生成の指針】
応募者の情報に基づいて以下の観点から質問を作成してください：
- **志望動機**: なぜこの企業・職種を選んだのか
- **経験・スキル**: 職歴や経験に基づく具体的なエピソード
- **問題解決能力**: 困難な状況への対処方法
- **成長意欲**: 学習姿勢やキャリア目標
- **企業適合性**: 企業文化との適合度
- **面接フォーカス**: 選択された面接種類（HR/ケース/技術/最終）に応じた専門的質問

【回答が不十分な判断基準】
- 話が20秒以内で終わる  
- 具体的なエピソード・成果・背景が含まれていない  
- 内容が抽象的・曖昧すぎる  
- Yes/Noだけで終わる、意図が伝わらない

【フォローアップのしかた】
- 次のような短く具体的な深掘りを使ってください：  
「具体的にはどういうことですか？」「そのとき、あなたはどうしましたか？」「成果はどうでしたか？」「背景をもう少し詳しく教えてください」など

【基本行動原則】
1. 簡潔に話す - 不要な前置きや相槌を一切避ける
2. 応募者の回答が不十分な場合は必ず深掘りする
3. 一度に一つの質問のみ行う
4. 応募者が十分に話すまで次の質問に進まない
5. 応募者の経験や志望企業・職種に関連した具体的な質問をする

【面接対象の応募者情報】
- 名前: ${name || "未入力"}
- 学歴: ${education || "未入力"}
- 職歴・経験: ${experience || "未入力"}
- 志望企業: ${companyName || "未入力"}
- 志望職種: ${role || "未入力"}
- 職務内容: ${jobDescription || "未入力"}
- 面接フォーカス: ${interviewFocus || "general"}

この情報を踏まえて、応募者に適した質問を動的に生成し、自然な面接の流れを作ってください。`,
            },
          ],
        },
        voice: {
          provider: "11labs",
          voiceId: "3JDquces8E8bkmvbh6Bc",
          model: "eleven_multilingual_v2",
        },
        transcriber: {
          provider: "deepgram",
          language: "ja",
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setError("面接を開始できませんでした");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const endCall = async () => {
    try {
      await vapi.stop();
      // Note: The onCallEnd event will handle saving the transcript and usage tracking
    } catch (error) {
      console.error("Failed to end call:", error);
      setError("通話を終了できませんでした");

      // Clear usage monitoring interval if vapi.stop() fails
      if (usageMonitorInterval) {
        clearInterval(usageMonitorInterval);
        setUsageMonitorInterval(null);
      }

      // If vapi.stop() fails, we should still track usage if session was active
      if (sessionStartTime && callStatus === CallStatus.ACTIVE) {
        try {
          const sessionEndTime = new Date();
          const sessionMinutes = calculateSessionMinutes(
            sessionStartTime,
            sessionEndTime
          );

          if (sessionMinutes > 0) {
            await addSessionUsage(sessionMinutes);
            console.log(
              `Session force-ended: ${sessionMinutes} minutes added to usage`
            );
          }
          setSessionStartTime(null);
        } catch (usageError) {
          console.error(
            "Failed to track session usage on force end:",
            usageError
          );
        }
      }
    }
  };

  // Add this improved handleGenerateFeedback function to your interviewComponent.tsx

  const handleGenerateFeedback = async () => {
    if (!interviewId) return;

    setIsGeneratingFeedback(true);
    setError(null);

    try {
      // Get workflow state data
      const workflowStateData = await getWorkflowState(interviewId);

      if (
        !workflowStateData?.conversationHistory ||
        workflowStateData.conversationHistory.length === 0
      ) {
        throw new Error(
          "面接の記録が見つかりません。面接を完了してから再試行してください。"
        );
      }

      // Call the generate-feedback API using relative URL (works in both dev and production)
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationHistory: workflowStateData.conversationHistory,
          workflowState: workflowStateData,
          interviewId: interviewId,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      // Save feedback to database - pass the entire data object which includes both feedback and overallFeedback
      await saveFeedback(data, interviewId, workflowStateData.sessionId);

      // Redirect to feedback page
      if (typeof window !== "undefined") {
        window.location.href = `/feedback/${interviewId}`;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "フィードバックの生成に失敗しました。";
      setError(errorMessage);
    } finally {
      setIsGeneratingFeedback(false);
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
    fullTranscript,
    isGeneratingFeedback,
    handleGenerateFeedback,
    sessionStartTime,
  };
};
