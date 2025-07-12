"use client";

import React, { useState, useRef } from "react";

export default function TestGeminiPipeline() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        chunks.current = [];

        await sendToGemini(blob);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setError("");
    } catch (err) {
      setError("マイクへのアクセスに失敗しました");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendToGemini = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append(
        "systemPrompt",
        "You are a helpful Japanese AI assistant. Please respond naturally in Japanese."
      );
      formData.append("context", "This is a test conversation.");

      const response = await fetch("/api/interview-conversation", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data.text);

      // Play the TTS audio
      if (data.audio) {
        const audioData = `data:${data.mimeType};base64,${data.audio}`;
        const audio = new Audio(audioData);
        audio.play();
      }
    } catch (err) {
      setError(
        `エラーが発生しました: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Gemini + TTS Pipeline Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Recording Controls */}
          <div className="text-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`px-8 py-4 rounded-full font-semibold text-lg transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isProcessing
                ? "処理中..."
                : isRecording
                ? "録音停止"
                : "録音開始"}
            </button>
          </div>

          {/* Status */}
          <div className="text-center">
            {isRecording && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-medium">録音中...</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-500 font-medium">
                  Gemini処理中...
                </span>
              </div>
            )}
          </div>

          {/* Response */}
          {response && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Gemini Response:
              </h3>
              <p className="text-green-700">{response}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">使い方:</h3>
            <ol className="text-blue-700 space-y-1 ml-4">
              <li>1. 「録音開始」ボタンをクリック</li>
              <li>2. 日本語で話しかけてください</li>
              <li>3. 「録音停止」ボタンをクリック</li>
              <li>4. Geminiが音声を認識し、音声で返答します</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
