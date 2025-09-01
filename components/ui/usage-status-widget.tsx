"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface UsageStatusWidgetProps {
  planName: string;
  remainingInterviews: number;
  remainingES: number;
  loading?: boolean;
}

export function UsageStatusWidget({
  planName,
  remainingInterviews,
  remainingES,
  loading = false
}: UsageStatusWidgetProps) {
  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#f8fffe" }}
            >
              <TrendingUp className="h-4 w-4" style={{ color: "#163300" }} />
            </div>
            <span className="font-semibold text-sm text-black">
              使用状況
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">面接回数</span>
                <span className="text-xs font-semibold text-black">読み込み中...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: "#163300",
                    width: "0%",
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">ES添削回数</span>
                <span className="text-xs font-semibold text-black">読み込み中...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: "#163300",
                    width: "0%",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max limits based on plan
  const getMaxInterviews = (planName: string) => {
    if (planName.includes("プレミアム")) return 999;
    if (planName.includes("ベーシック")) return 20;
    return 3; // Free plan
  };

  const getMaxES = (planName: string) => {
    if (planName.includes("プレミアム")) return 999;
    if (planName.includes("ベーシック")) return 10;
    return 1; // Free plan
  };

  const maxInterviews = getMaxInterviews(planName);
  const maxES = getMaxES(planName);

  // Calculate used amounts (total - remaining)
  const interviewsUsed = maxInterviews === 999 ? 0 : Math.max(0, maxInterviews - remainingInterviews);
  const esUsed = maxES === 999 ? 0 : Math.max(0, maxES - remainingES);

  // Calculate usage percentages
  const interviewUsagePercentage = maxInterviews === 999 ? 0 : Math.min((interviewsUsed / maxInterviews) * 100, 100);
  const esUsagePercentage = maxES === 999 ? 0 : Math.min((esUsed / maxES) * 100, 100);

  return (
    <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#f8fffe" }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: "#163300" }} />
          </div>
          <span className="font-semibold text-sm text-black">
            使用状況
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">面接回数</span>
              <span className="text-xs font-semibold text-black">
                {maxInterviews === 999 ? "無制限" : `${interviewsUsed} / ${maxInterviews}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#9fe870",
                  width: `${interviewUsagePercentage}%`,
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">ES添削回数</span>
              <span className="text-xs font-semibold text-black">
                {maxES === 999 ? "無制限" : `${esUsed} / ${maxES}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#9fe870",
                  width: `${esUsagePercentage}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}