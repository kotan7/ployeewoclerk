"use client";

import React from "react";

interface InterviewResponseProps {
  response: string;
  error: string;
}

export default function InterviewResponse({
  response,
  error,
}: InterviewResponseProps) {
  return (
    <>
      {/* Response */}
      {response && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            面接官からの質問:
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
    </>
  );
}
