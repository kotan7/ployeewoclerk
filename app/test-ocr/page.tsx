"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createWorker } from "tesseract.js";

interface ExtractedResult {
  text: string;
  fileName: string;
  fileSize: number;
}

interface ProcessedImage {
  processedImage: string;
  fileName: string;
  fileSize: number;
}

export default function TestOCRPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performOCR = async (processedImage: ProcessedImage) => {
    try {
      setProgress("OCRエンジンを初期化中...");

      // Initialize Tesseract worker with Japanese language
      const worker = await createWorker("jpn", 1, {
        logger: (m) => {
          console.log("OCR Progress:", m);
          if (m.status === "recognizing text") {
            setProgress(`テキストを認識中... ${Math.round(m.progress * 100)}%`);
          } else {
            setProgress(m.status || "処理中...");
          }
        },
      });

      setProgress("画像からテキストを抽出中...");

      // Perform OCR on the processed image
      const {
        data: { text },
      } = await worker.recognize(processedImage.processedImage);

      // Clean up worker
      await worker.terminate();

      setResult({
        text: text.trim(),
        fileName: processedImage.fileName,
        fileSize: processedImage.fileSize,
      });

      setProgress("");
    } catch (err) {
      console.error("OCR Error:", err);
      setError(
        err instanceof Error ? err.message : "OCR処理中にエラーが発生しました"
      );
      setProgress("");
    }
  };

  const handleFileUpload = async (file: File) => {
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      setError("画像ファイル（JPG、PNG、WEBP）のみサポートされています");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress("画像を処理中...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-pdf-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "テキストの抽出に失敗しました");
      }

      // Perform OCR on the client-side
      await performOCR(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setProgress("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      setError("画像ファイルをアップロードしてください");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#163300] mb-4">
            日本語OCRテスト
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            画像をアップロードして、Tesseract.jsを使用して日本語OCRでテキストを抽出・表示します。スキャンされた文書や画像に含まれる日本語テキストを認識できます。
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragOver
                ? "border-[#9fe870] bg-[#9fe870]/10"
                : "border-gray-300 hover:border-[#9fe870]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-[#163300] mb-2">
              画像をアップロード
            </h3>
            <p className="text-gray-600 mb-4">
              画像ファイルをここにドラッグ&ドロップするか、クリックして選択してください
            </p>
            <Button
              onClick={triggerFileInput}
              disabled={isLoading}
              className="bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] disabled:opacity-50"
            >
              {isLoading ? "処理中..." : "画像を選択"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              対応フォーマット: JPG、PNG、WEBP（最大10MB）
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">エラー: {error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#163300] mr-3"></div>
              <p className="text-[#163300] font-medium">
                {progress || "画像から日本語テキストを抽出中..."}
              </p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-[#163300] mb-4">
                ファイル情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ファイル名</p>
                  <p className="font-medium text-[#163300]">
                    {result.fileName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ファイルサイズ</p>
                  <p className="font-medium text-[#163300]">
                    {formatFileSize(result.fileSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Extracted Text */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-[#163300] mb-4">
                抽出されたテキスト
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {result.text ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {result.text}
                  </pre>
                ) : (
                  <p className="text-gray-500 italic">
                    テキストを抽出できませんでした。
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  文字数: {result.text.length}
                </p>
                {result.text && (
                  <Button
                    onClick={() => navigator.clipboard.writeText(result.text)}
                    variant="outline"
                    size="sm"
                  >
                    クリップボードにコピー
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
