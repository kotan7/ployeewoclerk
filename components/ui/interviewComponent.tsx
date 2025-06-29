"use client";

import { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import {
  saveTranscript,
  getTranscript,
  getQuestions,
  saveFeedback,
} from "@/lib/actions/interview.actions";

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

interface Feedback {
  score: string;
  feedback: string;
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
  const [feedback, setFeedback] = useState<Feedback[] | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Use pre-generated questions or fallback questions - ensure it's always an array
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

  // Function to save transcript to database
  const saveTranscriptToDatabase = async (transcript: TranscriptMessage[]) => {
    try {
      // Group consecutive messages by speaker
      const groupedTranscript: { speaker: string; content: string[] }[] = [];

      transcript.forEach((msg) => {
        const speaker = msg.role === "assistant" ? "面接官" : "あなた";

        // Check if the last group has the same speaker
        const lastGroup = groupedTranscript[groupedTranscript.length - 1];

        if (lastGroup && lastGroup.speaker === speaker) {
          // Same speaker, add to existing group
          lastGroup.content.push(msg.content);
        } else {
          // Different speaker or first message, create new group
          groupedTranscript.push({
            speaker: speaker,
            content: [msg.content],
          });
        }
      });

      // Format the grouped transcript
      const formattedTranscript = groupedTranscript
        .map((group) => {
          const combinedContent = group.content.join(" ");
          return `${group.speaker}: ${combinedContent}`;
        })
        .join("\n\n");

      // Use the action instead of API route
      const result = await saveTranscript(formattedTranscript, interviewId);
      console.log("Transcript saved successfully:", result.sessionId);
      return result.sessionId;
    } catch (error) {
      console.error("Error saving transcript:", error);
      return null;
    }
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
      setFullTranscript([]); // Reset transcript when starting new call
      setFeedback(null);
    };

    const onCallEnd = async () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);

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
      vapi.on("error", onError as (error: any) => void);
      vapi.off("error", onError as (error: any) => void);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, [fullTranscript, interviewId]); // Add dependencies

  const startCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      const questionsForPrompt = interviewQuestions
        .map((q, i) => `${i + 1}. ${q}`)
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
      // Note: The onCallEnd event will handle saving the transcript
    } catch (error) {
      console.error("Failed to end call:", error);
      setError("通話を終了できませんでした");
    }
  };

  // Add this improved handleGenerateFeedback function to your interviewComponent.tsx

const handleGenerateFeedback = async () => {
  if (!interviewId) {
    setError("Interview ID is missing");
    return;
  }
  
  setIsGeneratingFeedback(true);
  setError(null); // Clear any previous errors
  
  try {
    console.log("Generating feedback for interview:", interviewId);
    
    // Get transcript and questions data
    const [transcriptData, questionsData] = await Promise.all([
      getTranscript(interviewId),
      getQuestions(interviewId)
    ]);

    console.log("Transcript data:", transcriptData);
    console.log("Questions data:", questionsData);

    if (!transcriptData || !transcriptData.transcript) {
      throw new Error("面接の記録が見つかりません。面接を完了してから再試行してください。");
    }

    if (!questionsData || !questionsData.questions || questionsData.questions.length === 0) {
      throw new Error("面接の質問が見つかりません。");
    }

    // Validate transcript is not empty
    if (transcriptData.transcript.trim().length === 0) {
      throw new Error("面接の記録が空です。面接を行ってから再試行してください。");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    console.log("Calling feedback API with:", {
      transcript: transcriptData.transcript.substring(0, 100) + "...", // Log first 100 chars
      questionsCount: questionsData.questions.length
    });

    // Call the generate-feedback API
    const response = await fetch(`${baseUrl}/api/generate-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript: transcriptData.transcript,
        questions: questionsData.questions,
      }),
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("API error response:", errorData);
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Feedback data received:", data);

    if (!data.feedback || !Array.isArray(data.feedback)) {
      throw new Error("Invalid feedback format received from server");
    }

    // Save feedback to database
    await saveFeedback(data.feedback, interviewId, transcriptData.sessionId);
    setFeedback(data.feedback);
    
    console.log("Feedback generated and saved successfully");

  } catch (error) {
    console.error("Error generating feedback:", error);
    
    let errorMessage = "フィードバックの生成に失敗しました。";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
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
    fullTranscript, // Expose the full transcript
    feedback,
    isGeneratingFeedback,
    handleGenerateFeedback,
  };
};
