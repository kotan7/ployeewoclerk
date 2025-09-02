import React from "react";
import { Metadata } from "next";
import { InterviewForm } from "@/components/ui/InterviewForm";

export const metadata: Metadata = {
  title: "新しい面接練習を始める | AI面接官との実践練習 - プロイー",
  description:
    "AI面接官との実践的な面接練習を今すぐ開始。無料で1回まで利用可能。就活・転職の面接対策に最適な練習環境をご提供します。",
  keywords: [
    "面接練習開始",
    "AI面接練習",
    "面接対策",
    "就活面接",
    "転職面接",
    "面接シミュレーション",
    "無料面接練習",
    "AI面接官",
    "面接準備",
  ],
  openGraph: {
    title: "新しい面接練習を始める | AI面接官との実践練習",
    description:
      "AI面接官との実践的な面接練習を今すぐ開始。無料で3回まで利用可能。",
    url: "https://www.ployee.net/interview/new",
    images: [
      {
        url: "https://www.ployee.net/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "プロイー - 新しい面接練習を始める",
      },
    ],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "新しい面接練習を始める",
  url: "https://www.ployee.net/interview/new",
  description: "AI面接官との実践的な面接練習を開始するページ",
  isPartOf: {
    "@type": "WebSite",
    name: "プロイー",
    url: "https://www.ployee.net",
  },
  potentialAction: {
    "@type": "Action",
    name: "面接練習を開始",
    description: "AI面接官との実践的な面接練習を開始する",
  },
};

const page = async () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#163300] mb-4 sm:mb-6">
              AI面接の準備をしましょう
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-semibold max-w-2xl mx-auto leading-relaxed">
              あなたの情報を入力して、パーソナライズされた
              <strong>面接練習</strong>を始めましょう
            </p>
          </div>

          <InterviewForm />
        </div>
      </div>
    </>
  );
};

export default page;
