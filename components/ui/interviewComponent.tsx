"use client";

import { useEffect, useState, useCallback } from "react";
import { vapi } from "@/lib/vapi.sdk";
import {
  getQuestions,
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

  const interviewQuestions =
    Array.isArray(questions) && questions.length > 0
      ? questions
      : [
          "まずは簡単に自己紹介をお願いします。",
          "なぜ弊社を志望されたのですか？",
          "この職種を選んだ理由を教えてください。",
          "あなたの強みと弱みを教えてください。",
          "5年後のキャリアビジョンを聞かせてください。",
        ];

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

      const questionsForPrompt = interviewQuestions
        .map((q: string, i: number) => `${i + 1}. ${q}`)
        .join("\n");

      await vapi.start({
        name: "AI Interview Assistant",
        firstMessage:
          interviewQuestions[0] ||
          "こんにちは。本日はもぎ面接にご参加いただきありがとうございます。まずは簡単に自己紹介をお願いします。",
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `あなたはプロの面接官です。あなたの任務は以下の5つの質問に基づいて面接を行い、各質問に対して応募者の詳細な情報を引き出すことです。

【面接の進行ルール】
1. 「面接質問リスト」にある質問を **一つずつ順番に出す**
2. 応募者の回答が不十分な場合は、**最大2回までフォローアップ質問**を行い、十分な詳細を引き出す
3. 回答が十分であれば、次の質問に進む
4. すべての質問が完了したら「以上で面接を終了いたします」とだけ述べて終了する

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

【面接対象の応募者情報】
- 名前: ${name || "未入力"}
- 職歴・経験: ${experience || "未入力"}
- 志望企業: ${companyName || "未入力"}
- 志望職種: ${role || "未入力"}
- 職務内容: ${jobDescription || "未入力"}
- 面接フォーカス: ${interviewFocus || "general"}

【面接質問リスト】
${questionsForPrompt}

上記5つの質問に基づき、順番に1つずつ丁寧にヒアリングしてください。`,
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
      // Get questions and workflow state data
      const [questionsData, workflowStateData] = await Promise.all([
        getQuestions(interviewId),
        getWorkflowState(interviewId),
      ]);

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
          questions: questionsData?.questions || [],
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
    questions: interviewQuestions,
    fullTranscript,
    isGeneratingFeedback,
    handleGenerateFeedback,
    sessionStartTime,
  };
};
