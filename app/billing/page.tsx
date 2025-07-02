"use client";

import React, { useEffect } from "react";
import { PricingTable } from "@clerk/nextjs";
import Head from "next/head";

export default function BillingPage() {
  useEffect(() => {
    // Set document title and meta tags dynamically for client component
    document.title = "料金プラン | プロイー - AI面接練習プラットフォーム";

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "プロイーの料金プランをご確認ください。無料プランから始めて、AI面接練習で面接スキルを向上させましょう。"
      );
    }
  }, []);

  return (
    <>
      <Head>
        <title>料金プラン | プロイー - AI面接練習プラットフォーム</title>
        <meta
          name="description"
          content="プロイーの料金プランをご確認ください。無料プランから始めて、AI面接練習で面接スキルを向上させましょう。"
        />
      </Head>

      <div className="min-h-screen bg-white">

        {/* Pricing Table Section */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#163300] mb-4">
                プランを選択してください
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                あなたの面接練習ニーズに合わせて最適なプランをお選びください
              </p>
            </div>

            {/* Clerk Pricing Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <PricingTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
