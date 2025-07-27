"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Configuration constants
const SILENCE_THRESHOLD = 0.05;
const SILENCE_DURATION = 1500;
const AUDIO_SAMPLE_RATE = 44100;
const ANALYSIS_INTERVAL = 100;

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface CandidateInfo {
  name?: string;
  experience?: string;
  skills?: string[];
  interests?: string[];
}

export type InterviewPhase = "introduction" | "experience" | "skills" | "motivation" | "closing";

export function useInterviewSession() {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [silenceTimer, setSilenceTimer] = useState<number>(0);
  const [hasSpokenInCurrentSession, setHasSpokenInCurrentSession] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [fullTranscript, setFullTranscript] = useState<string>("");
  const [currentUserTranscript, setCurrentUserTranscript] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [interviewPhase, setInterviewPhase] = useState<InterviewPhase>("introduction");
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({});

  // Audio references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousSpeakingStateRef = useRef<boolean>(false);
  const hasSpokenInCurrentSessionRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const isPlayingTTSRef = useRef<boolean>(false);
  const currentRecordingSessionRef = useRef<number>(0);

  // Complete cleanup function
  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    // Reset all refs
    chunksRef.current = [];
    silenceTimerRef.current = null;
    analysisIntervalRef.current = null;
    currentAudioRef.current = null;
    previousSpeakingStateRef.current = false;
    hasSpokenInCurrentSessionRef.current = false;
    isProcessingRef.current = false;
    isPlayingTTSRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Helper function to update interview phase
  const updateInterviewPhase = useCallback((history: ConversationMessage[]) => {
    const userMessageCount = history.filter((msg) => msg.role === "user").length;

    if (userMessageCount <= 2) {
      setInterviewPhase("introduction");
    } else if (userMessageCount <= 5) {
      setInterviewPhase("experience");
    } else if (userMessageCount <= 8) {
      setInterviewPhase("skills");
    } else if (userMessageCount <= 11) {
      setInterviewPhase("motivation");
    } else {
      setInterviewPhase("closing");
    }
  }, []);

  // Helper function to extract candidate info
  const updateCandidateInfo = useCallback((aiResponse: string) => {
    setCandidateInfo((prev) => ({
      ...prev,
      // Add logic to extract info from AI response if needed
    }));
  }, []);

  // Start a new recording session
  const startNewRecordingSession = useCallback(() => {
    currentRecordingSessionRef.current += 1;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    chunksRef.current = [];
    hasSpokenInCurrentSessionRef.current = false;
    setHasSpokenInCurrentSession(false);
    previousSpeakingStateRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceTimer(0);

    if (streamRef.current && audioContextRef.current) {
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: "audio/webm",
      });

      const sessionId = currentRecordingSessionRef.current;

      recorder.ondataavailable = (e) => {
        if (
          e.data.size > 0 &&
          !isProcessingRef.current &&
          !isPlayingTTSRef.current &&
          sessionId === currentRecordingSessionRef.current
        ) {
          console.log("Audio chunk received:", e.data.size, "bytes", "Session:", sessionId);
          chunksRef.current.push(e.data);
        } else {
          console.log("Audio chunk rejected:", {
            size: e.data.size,
            processing: isProcessingRef.current,
            playingTTS: isPlayingTTSRef.current,
            sessionMatch: sessionId === currentRecordingSessionRef.current,
          });
        }
      };

      recorder.onstop = () => {
        console.log("MediaRecorder stopped for session:", sessionId);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setError("音声録音エラーが発生しました");
      };

      recorder.onstart = () => {
        console.log("MediaRecorder started for session:", sessionId);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200);
    }
  }, []);

  // Audio level analysis
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || isProcessingRef.current || isPlayingTTSRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedLevel = average / 255;

    const currentlySpeaking = normalizedLevel > SILENCE_THRESHOLD;
    const previouslySpeaking = previousSpeakingStateRef.current;

    setIsSpeaking(currentlySpeaking);

    if (currentlySpeaking) {
      hasSpokenInCurrentSessionRef.current = true;
      setHasSpokenInCurrentSession(true);

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setSilenceTimer(0);
    } else {
      if (
        hasSpokenInCurrentSessionRef.current &&
        previouslySpeaking &&
        !currentlySpeaking &&
        chunksRef.current.length > 0 &&
        !silenceTimerRef.current &&
        !isProcessingRef.current &&
        !isPlayingTTSRef.current
      ) {
        console.log("Starting silence timer - transition detected", {
          hasSpoken: hasSpokenInCurrentSessionRef.current,
          previouslySpeaking,
          currentlySpeaking,
          chunksLength: chunksRef.current.length,
          timerExists: !!silenceTimerRef.current,
          isProcessing: isProcessingRef.current,
        });

        const startTime = Date.now();
        silenceTimerRef.current = setTimeout(() => {
          console.log("Silence timer fired - sending audio");
          sendCurrentAudio();
        }, SILENCE_DURATION);

        const updateTimer = () => {
          const elapsed = Date.now() - startTime;
          setSilenceTimer(Math.min(elapsed, SILENCE_DURATION));
          if (elapsed < SILENCE_DURATION && silenceTimerRef.current) {
            setTimeout(updateTimer, 50);
          }
        };
        updateTimer();
      }
    }

    previousSpeakingStateRef.current = currentlySpeaking;
  }, []);

  // Send current audio to Gemini
  const sendCurrentAudio = async () => {
    if (chunksRef.current.length === 0 || isProcessingRef.current) return;

    console.log("Sending audio to Gemini...");

    isProcessingRef.current = true;
    setIsProcessing(true);

    const audioChunks = [...chunksRef.current];

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceTimer(0);

    chunksRef.current = [];
    hasSpokenInCurrentSessionRef.current = false;
    setHasSpokenInCurrentSession(false);
    previousSpeakingStateRef.current = false;

    try {
      setError("");

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

      if (audioBlob.size === 0) {
        throw new Error("Empty audio data");
      }

      if (audioBlob.size < 1000) {
        throw new Error("Audio data too small - please speak longer");
      }

      console.log("Audio blob created:", {
        size: audioBlob.size,
        type: audioBlob.type,
        chunksCount: audioChunks.length,
      });

      const conversationContext = {
        history: conversationHistory,
        phase: interviewPhase,
        candidateInfo: candidateInfo,
        totalExchanges: conversationHistory.filter((msg) => msg.role === "user").length,
        fullTranscript: fullTranscript,
      };

      // Debug: Log what we're sending to the API
      console.log("Frontend - Conversation context being sent:", {
        historyLength: conversationHistory.length,
        phase: interviewPhase,
        totalExchanges: conversationHistory.filter((msg) => msg.role === "user").length,
        fullTranscriptLength: fullTranscript.length,
        conversationHistory: conversationHistory
      });

      const systemPrompt = `あなたは経験豊富な日本企業の面接官です。以下の指針に従って面接を進めてください：

## 面接官の役割
あなたは**積極的に質問を投げかける面接官**です。候補者の回答に反応するだけでなく、事前に準備した質問を順番に聞いていき、必要に応じて深掘り質問をしてください。

## 面接の流れと質問例

### 1. 自己紹介段階（introduction）
**メイン質問**: 「まずは自己紹介をお願いします。お名前と簡単な経歴をお聞かせください。」
**深掘り質問例**:
- 「大学では何を専攻されていましたか？」
- 「学生時代に印象に残っている経験はありますか？」

### 2. 経歴・経験段階（experience）
**メイン質問**: 「これまでの職歴やアルバイト経験について教えてください。特に印象に残っている仕事はありますか？」
**深掘り質問例**:
- 「その仕事で最も困難だったことは何ですか？」
- 「どのようにその困難を乗り越えましたか？」
- 「チームでの役割はどのようなものでしたか？」

### 3. スキル確認段階（skills）
**メイン質問**: 「当社で活かせるスキルや専門知識について教えてください。特に自信のある分野はありますか？」
**深掘り質問例**:
- 「そのスキルをどのように身につけましたか？」
- 「具体的なプロジェクトでの活用例を教えてください」
- 「今後さらに伸ばしたいスキルはありますか？」

### 4. 志望動機段階（motivation）
**メイン質問**: 「当社を志望された理由と、入社後にやりたいことを教えてください。」
**深掘り質問例**:
- 「当社のどのような点に魅力を感じましたか？」
- 「3年後、5年後のキャリアビジョンはありますか？」
- 「当社で実現したい具体的な目標はありますか？」

### 5. 質疑応答段階（closing）
**メイン質問**: 「最後に、当社や仕事について何かご質問はありますか？」
**深掘り質問例**:
- 「働く環境について気になることはありますか？」
- 「研修制度について詳しく知りたいことはありますか？」

## 面接官としての態度
- 丁寧で敬語を使った話し方
- **1回の応答で1つの質問のみ**（複数の質問は避ける）
- 回答は簡潔に（1-2文程度）
- 候補者の回答が浅い場合は1つの深掘り質問のみ
- 具体的な例やエピソードを求める
- 候補者にたくさん話してもらうよう促す

## 深掘り質問の判断基準
候補者の回答が以下の場合は深掘り質問をしてください：
- 1-2文程度の短い回答
- 具体的な例や数字がない回答
- 「頑張ります」「努力します」などの抽象的な回答
- 感情や考えが伝わってこない回答

## 記憶の活用
- **会話履歴を必ず参照して、候補者が既に答えた内容を把握する**
- 前の回答を参考にした質問をする
- 候補者の発言に一貫性があるかチェック
- **候補者が既に答えた内容は絶対に繰り返し質問しない**
- 面接の流れに沿って段階的に質問を進める
- 会話履歴に記載されている情報を活用して適切な質問をする

各回答は簡潔にまとめてください。`;

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("systemPrompt", systemPrompt);
      formData.append("context", JSON.stringify(conversationContext));

      const response = await fetch("/api/interview-conversation", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!data.text) {
        throw new Error("No text response from API");
      }

      setResponse(data.text);

      const userTranscript = data.userTranscript || "[Audio message]";
      setCurrentUserTranscript(userTranscript);

      const newUserMessage: ConversationMessage = {
        role: "user",
        content: userTranscript,
        timestamp: Date.now(),
      };

      const newAssistantMessage: ConversationMessage = {
        role: "assistant",
        content: data.text,
        timestamp: Date.now(),
      };

      const newHistory = [...conversationHistory, newUserMessage, newAssistantMessage];
      
      console.log("Frontend - Updating conversation history:", {
        previousLength: conversationHistory.length,
        newLength: newHistory.length,
        newUserMessage,
        newAssistantMessage,
        fullNewHistory: newHistory
      });
      
      setConversationHistory(newHistory);

      const newTranscriptEntry = `【候補者】: ${userTranscript}\n【面接官】: ${data.text}\n\n`;
      setFullTranscript((prev) => prev + newTranscriptEntry);

      updateInterviewPhase(newHistory);
      updateCandidateInfo(data.text);

      if (data.audio) {
        const audioData = `data:${data.mimeType};base64,${data.audio}`;
        const audio = new Audio(audioData);

        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }

        currentAudioRef.current = audio;
        isPlayingTTSRef.current = true;
        setIsPlayingTTS(true);
        chunksRef.current = [];

        audio.onended = () => {
          console.log("TTS playback ended, starting new recording session");
          currentAudioRef.current = null;
          isPlayingTTSRef.current = false;
          setIsPlayingTTS(false);
          startNewRecordingSession();
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          currentAudioRef.current = null;
          isPlayingTTSRef.current = false;
          setIsPlayingTTS(false);
          startNewRecordingSession();
        };

        await audio.play();
      } else {
        startNewRecordingSession();
      }
    } catch (err) {
      console.error("Error in sendCurrentAudio:", err);
      setError(
        `エラーが発生しました: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      startNewRecordingSession();
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  // Download transcript function
  const downloadTranscript = useCallback(() => {
    if (!fullTranscript) return;

    const blob = new Blob([fullTranscript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [fullTranscript]);

  // Start real-time recording
  const startRealTimeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: AUDIO_SAMPLE_RATE,
        },
      });

      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      setConversationHistory([]);
      setInterviewPhase("introduction");
      setCandidateInfo({});
      setResponse("");
      setError("");
      setFullTranscript("");
      setCurrentUserTranscript("");

      startNewRecordingSession();

      analysisIntervalRef.current = setInterval(analyzeAudio, ANALYSIS_INTERVAL);

      setIsActive(true);
      setError("");
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("マイクへのアクセスに失敗しました");
    }
  };

  // Stop real-time recording
  const stopRealTimeRecording = () => {
    cleanup();
    setIsActive(false);
    setIsSpeaking(false);
    setSilenceTimer(0);
    setIsPlayingTTS(false);
    setIsProcessing(false);
    currentRecordingSessionRef.current = 0;
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isActive) {
      stopRealTimeRecording();
    } else {
      startRealTimeRecording();
    }
  };

  return {
    // State
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
    
    // Functions
    toggleRecording,
    downloadTranscript,
    
    // Constants
    SILENCE_DURATION,
  };
} 