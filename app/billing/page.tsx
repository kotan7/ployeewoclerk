"use client";

import React, { useEffect } from "react";
import { PricingTable } from "@clerk/nextjs";
import Head from "next/head";
import { jaJP } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";

export default function BillingPage() {
  useEffect(() => {
    document.title = "料金プラン | プロイー - AI面接練習プラットフォーム";

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ClerkProvider localization={jaJP}>
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                料金プラン
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
                あなたの面接練習ニーズに合わせて最適なプランをお選びください
              </p>
            </div>
              <PricingTable />
          </div>
        </ClerkProvider>
      </div>
    </>
  );
}
