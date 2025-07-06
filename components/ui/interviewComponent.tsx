"use client";

import { useEffect, useState, useCallback } from "react";
import { vapi } from "@/lib/vapi.sdk";
import {
  saveTranscript,
  getTranscript,
  getQuestions,
  saveFeedback,
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
  companyName,
  role,
  jobDescription,
  interviewFocus,
  resume,
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

  const saveTranscriptToDatabase = useCallback(
    async (transcript: TranscriptMessage[]) => {
      if (!interviewId) return;

      try {
        // Group consecutive messages from the same speaker
        const groupedMessages: { role: string; content: string[] }[] = [];

        transcript.forEach((msg) => {
          const speakerLabel = msg.role === "user" ? "応募者" : "面接官";
          const lastGroup = groupedMessages[groupedMessages.length - 1];

          // If the last group has the same speaker, add to existing group
          if (lastGroup && lastGroup.role === speakerLabel) {
            lastGroup.content.push(msg.content);
          } else {
            // Create a new group for this speaker
            groupedMessages.push({
              role: speakerLabel,
              content: [msg.content],
            });
          }
        });

        // Format the grouped messages
        const formattedTranscript = groupedMessages
          .map((group) => `${group.role}: ${group.content.join(" ")}`)
          .join("\n\n");

        await saveTranscript(formattedTranscript, interviewId);
      } catch (error) {
        console.error("Failed to save transcript:", error);
      }
    },
    [interviewId]
  );

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

      // Save the full transcript when call ends
      if (fullTranscript.length > 0) {
        await saveTranscriptToDatabase(fullTranscript);
      }
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
    saveTranscriptToDatabase,
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
              content: `あなたは面接官です。以下の情報を元に、模擬面接を日本語で行ってください。

【応募者情報】
- 履歴書概要: ${resume ? "提出済み" : "未提出"}
- 志望企業: ${companyName || "未入力"}
- 志望職種: ${role || "未入力"}
- 職務内容: ${jobDescription || "未入力"}
- 面接フォーカス: ${interviewFocus || "general"}

【準備された面接質問】
${questionsForPrompt}

【面接の進め方ルール】
- 上記の準備された質問を参考に面接を進めてください
- 最初の質問は既に最初のメッセージとして設定されています
- 必要に応じて、回答に対する深掘り質問も行ってください
- フィードバックは行わず、リアルな面接官のように振る舞ってください
- 丁寧かつ自然な日本語で話してください
- 準備された質問をすべて消化した後は、面接を自然に終了してください`,
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
      // Get transcript and questions data
      const [transcriptData, questionsData] = await Promise.all([
        getTranscript(interviewId),
        getQuestions(interviewId),
      ]);

      if (!transcriptData?.transcript) {
        throw new Error(
          "面接の記録が見つかりません。面接を完了してから再試行してください。"
        );
      }

      if (!questionsData?.questions?.length) {
        throw new Error("面接の質問が見つかりません。");
      }

      // Call the generate-feedback API
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/generate-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: transcriptData.transcript,
            questions: questionsData.questions,
          }),
        }
      );

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
      await saveFeedback(data, interviewId, transcriptData.sessionId);

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
