"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CardSwap, { Card } from "../components/ui/reactbits/cardSwap";
import Cubes from "../components/ui/reactbits/cube";
import logo from "../constants/logo.png";
import Image from "next/image";

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "プロイー",
  url: "https://ployee.it.com",
  description:
    "AI面接官との実践的な面接練習で、自信を持って本番に挑めます。24時間いつでも面接練習が可能。",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
    description: "無料プランでは3回まで面接練習が可能",
  },
  creator: {
    "@type": "Organization",
    name: "プロイー開発チーム",
  },
  keywords: "面接AI, AI面接, 面接練習, 就活対策, 面接対策, AI面接官",
  inLanguage: "ja-JP",
  audience: {
    "@type": "Audience",
    audienceType: "就活生, 転職希望者",
  },
};

export default function Home() {
  const router = useRouter();

  // Refs for GSAP animations
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);

  // Refs for Problem Section animations
  const problemSectionRef = useRef<HTMLElement>(null);
  const problemTextRef = useRef<HTMLDivElement>(null);
  const problemImageRef = useRef<HTMLDivElement>(null);

  // Refs for Transformation Section animations
  const transformationSectionRef = useRef<HTMLElement>(null);
  const transformationTextRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);

  // Refs for Speed Comparison Section animations
  const speedSectionRef = useRef<HTMLElement>(null);
  const speedHeaderRef = useRef<HTMLDivElement>(null);
  const keyboardCardRef = useRef<HTMLDivElement>(null);
  const flowCardRef = useRef<HTMLDivElement>(null);

  // Refs for Post Labs-style reveal animation
  const mainContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Function to split text into individual characters
  const splitTextIntoChars = (text: string) => {
    return text.split("").map((char, index) => (
      <span key={index} className="char">
        {char}
      </span>
    ));
  };

  const handleClick = () => {
    router.push("/interview/new");
  };
  const handleClick2 = () => {
    router.push("/interview");
  };

  // GSAP animations
  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Hero section staggered fade-in
    const heroTl = gsap.timeline();

    // Set initial opacity to 0 for all hero elements
    gsap.set(
      [heroTitleRef.current, heroSubtitleRef.current, heroButtonsRef.current],
      {
        opacity: 0,
        y: 30,
      }
    );

    // Staggered animation sequence for hero
    heroTl
      .to(heroTitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      })
      .to(
        heroSubtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .to(
        heroButtonsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      );

    // Problem section scroll-triggered animations
    if (
      problemSectionRef.current &&
      problemTextRef.current &&
      problemImageRef.current
    ) {
      // Set initial states (removed x animation for image)
      gsap.set(problemTextRef.current, { opacity: 1, y: 10 });
      gsap.set(problemImageRef.current, { opacity: 1 }); // Cube always visible

      // Create scroll-triggered timeline
      const problemTl = gsap.timeline({
        scrollTrigger: {
          trigger: problemSectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // First: Grey background fills the section (this happens naturally with the section)
      // Then: Text and image fade in after more scrolling
      problemTl
        .to(
          problemTextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
          },
          0.3
        )
        .to(
          problemImageRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
          },
          0.5
        );
    }

    // Speed Comparison section scroll-triggered animations
    if (
      speedSectionRef.current &&
      speedHeaderRef.current &&
      keyboardCardRef.current &&
      flowCardRef.current
    ) {
      // Set initial states
      gsap.set(speedHeaderRef.current, { opacity: 0, y: 30 });
      gsap.set(keyboardCardRef.current, { opacity: 0, x: -30 });
      gsap.set(flowCardRef.current, { opacity: 0, x: 30 });

      // Create scroll-triggered timeline with faster animations
      const speedTl = gsap.timeline({
        scrollTrigger: {
          trigger: speedSectionRef.current,
          start: "top 90%", // Start earlier
          end: "top 50%", // End earlier for faster completion
          scrub: 0.5, // Reduce scrub for snappier animations
        },
      });

      speedTl
        .to(
          speedHeaderRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          0
        )
        .to(
          keyboardCardRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.2
        )
        .to(
          flowCardRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.3
        );
    }

    // Footer is now positioned normally after content - no special animation needed

    // Cleanup function to prevent memory leaks and scroll issues
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white relative">
        {/* Main content wrapper */}
        <div ref={mainContentRef} className="relative bg-white">
          {/* Hero Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#2F4F3F] -mt-16">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-[#142d25]"></div>

            <div className="max-w-7xl mx-auto pl-4 sm:pl-8 lg:pl-12 pr-4 sm:pr-8 lg:pr-12 relative z-10">
              <div className="text-left mb-8">
                {/* Feature badges - moved down to account for navbar */}
                <div className="flex flex-wrap gap-4 mb-8 mt-32">
                  <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 text-white/80 text-sm font-medium backdrop-blur-sm">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    24時間利用可能
                  </div>
                  <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 text-white/80 text-sm font-medium backdrop-blur-sm">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    AI面接官搭載
                  </div>
                  <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 text-white/80 text-sm font-medium backdrop-blur-sm">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    リアルタイム分析
                  </div>
                </div>
                {/* Main heading and button container */}
                <div className="mb-12">
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <div className="text-6xl lg:text-8xl font-bold text-white leading-tight text-left">
                        面接の不安
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <h1
                        ref={heroTitleRef}
                        className="text-6xl lg:text-8xl font-bold text-white mb-0 leading-tight text-left"
                      >
                        <span className="text-[#9fe870]">AI面接官</span>
                        で潰せ
                      </h1>
                    </div>

                    {/* Main CTA button positioned next to second row */}
                    <div
                      ref={heroButtonsRef}
                      className="flex-shrink-0 mb-2 ml-8"
                    >
                      <button
                        className="group relative inline-flex items-center px-8 py-4 mb-5 bg-[#9fe870] text-[#163300] rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-all duration-300 hover:scale-105 shadow-xl"
                        onClick={handleClick}
                        aria-label="AI面接練習を無料で体験する"
                      >
                        <span className="mr-3">無料で体験する</span>
                        <div className="w-8 h-8 bg-[#ff8c5a] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <p
                  ref={heroSubtitleRef}
                  className="text-xl text-white/80 mb-12 max-w-4xl leading-relaxed text-left"
                >
                  プロイーはAI面接官による実践的な面接練習で、次世代の就活・転職活動をサポートします。
                  <br />
                  詳細な分析、リアルタイムフィードバック、そして成長を実感できる環境—すべてを統合したプラットフォームです。
                </p>

                {/* Trusted by section */}
                <div className="text-left">
                  <p className="text-white/60 text-sm mb-6">
                    就活生・転職者から信頼されています
                  </p>
                  <div className="-ml-5">
                    <img
                      src="/companies.png"
                      alt="信頼される企業のロゴ - 多くの就活生と転職者に選ばれています"
                      className="w-full max-w-2xl opacity-60 hover:opacity-80 transition-opacity duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Problem Section - Campfire.ai Style */}
          <section
            ref={problemSectionRef}
            className="py-32 bg-white relative overflow-hidden -mb-18"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center ">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-[#f8f9fa] border border-gray-200 text-gray-600 text-sm font-medium mb-8">
                  <div className="w-2 h-2 bg-[#ff8c5a] rounded-full mr-3"></div>
                  問題の解決
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight max-w-4xl mx-auto">
                  面接の不安を解消する
                  <br />
                  <span className="text-[#163300]">AI面接官</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  従来の面接対策では限界がある問題を、AI技術で根本的に解決します。
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-20 items-center">
                {/* Left: Modern Cube Animation */}
                <div
                  ref={problemImageRef}
                  className="relative flex justify-center items-center min-h-[600px]"
                >
                                    <div className="relative">
                    {/* Background decorative elements */}
                    <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-[#9fe870]/40 rounded-full blur-lg"></div>

                    {/* Main image with enhanced styling */}
                    <div className="relative z-10">
                      <img
                        src="/sound.png"
                        alt="AI面接練習システム"
                        width={500}
                        height={500}
                        className="drop-shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Solution Text */}
                <div ref={problemTextRef} className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                      AIとのリアルタイム対話で
                      <br />
                      実践的な面接練習を実現
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      従来の一方向的な学習ではなく、AI面接官との双方向対話により、
                      本番に近い環境での練習が可能。詳細な分析とフィードバックで、
                      あなたの面接スキルを確実に向上させます。
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-[#9fe870]/10 rounded-2xl">
                      <div className="w-8 h-8 bg-[#9fe870] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-4 h-4 text-[#163300]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          24時間いつでも練習可能
                        </h4>
                        <p className="text-gray-600 text-sm">
                          時間や場所に制約されることなく、自分のペースで面接練習
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-[#9fe870]/10 rounded-2xl">
                      <div className="w-8 h-8 bg-[#9fe870] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-4 h-4 text-[#163300]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          リアルタイム分析・評価
                        </h4>
                        <p className="text-gray-600 text-sm">
                          音声、表情、回答内容を総合的に分析し、具体的な改善点を提示
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-[#9fe870]/10 rounded-2xl">
                      <div className="w-8 h-8 bg-[#9fe870] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-4 h-4 text-[#163300]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          個人最適化されたフィードバック
                        </h4>
                        <p className="text-gray-600 text-sm">
                          あなたの特性に合わせた改善提案と強みの発見
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 relative z-10 -mb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="sr-only">AI面接練習サービスの特徴</h2>
              <div className="flex items-center gap-16">
                {/* Text Content - Left Side */}
                <div className="flex-1 mb-10 ml-15">
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#163300] mb-8">
                    プロイーの3つの特徴
                  </h2>
                  <div className="space-y-6">
                    <p className="text-xl text-gray-600 leading-relaxed">
                      AIとの<strong>リアルタイム対話</strong>
                      で実践的な面接練習を行い、
                      <strong>詳細な分析とフィードバック</strong>を通じて、
                      あなたの面接スキルを総合的に向上させます。
                    </p>
                  </div>
                </div>

                {/* Image - Right Side */}
                <div className="flex-1 relative mb-15">
                  <img
                    src="/interview.png"
                    alt="interview"
                    width={1000}
                    height={1000}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Transformation Section */}
          <section className="w-full flex justify-center items-center py-32 bg-transparent mt-15">
            <div
              className="w-full max-w-5xl rounded-[48px] bg-[#163300] flex flex-col items-center px-8 pt-28 pb-20 relative"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
            >
              <img
                src="/interviewericon.png"
                alt="Interviewer Icon"
                className="w-80 h-80 object-contain absolute -top-40 left-1/2 -translate-x-1/2 drop-shadow-xl"
                style={{ zIndex: 2 }}
                draggable={false}
              />
              <h2 className="text-5xl md:text-6xl font-extrabold text-[#9fe870] text-center mb-6 leading-tight mt-2">
                過去問で鍛えられたAI面接官が
                <br />
                あなたの自信を引き出す
              </h2>
              <p className="text-lg md:text-xl text-white text-center mb-10 max-w-2xl">
                豊富な過去問データでAIが徹底指導。自信を持って本番に挑もう
              </p>
              <button
                className="bg-[#9fe870] text-[#163300] px-10 py-4 rounded-full font-semibold text-xl transition-colors shadow-lg"
                onClick={() => router.push("/interview/new")}
              >
                AI面接を無料で体験する
              </button>
            </div>
          </section>

          {/* Enhanced Speed Comparison Section - Campfire.ai Style */}
          <section
            ref={speedSectionRef}
            className="py-32 bg-white relative overflow-hidden -mt-24"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Main Header */}
              <div ref={speedHeaderRef} className="text-center mb-20">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-[#f8f9fa] border border-gray-200 text-gray-600 text-sm font-medium mb-8">
                  <div className="w-2 h-2 bg-[#ff8c5a] rounded-full mr-3"></div>
                  効率性の比較
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight max-w-4xl mx-auto">
                  従来の面接練習より
                  <br />
                  <span className="text-[#163300] relative">
                    5倍効率的
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#9fe870] rounded-full"></div>
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  書籍や動画での学習では限界がある。AI面接官とのリアルタイム対話で、
                  実践的なスキルを短時間で身につけることができます。
                </p>
              </div>

              {/* Comparison Cards */}
              <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
                {/* Traditional Method Card */}
                <div
                  ref={keyboardCardRef}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="p-8 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            従来の学習方法
                          </h3>
                          <p className="text-gray-500 text-sm">
                            参考書・動画学習
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#ff8c5a]">
                          週5時間
                        </div>
                        <div className="text-xs text-gray-500">
                          必要な学習時間
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          自己分析と志望動機の準備
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          想定質問の暗記と一人練習
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          本番で緊張して上手く話せない
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff8c5a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#ff8c5a] rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">
                          具体的な改善点が分からない
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#ff8c5a]/10 border border-[#ff8c5a]/30 rounded-2xl p-4">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-[#ff8c5a] flex-shrink-0"
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
                        <p className="text-[#ff8c5a] font-medium text-sm">
                          フィードバックが不十分・成長が見えにくい
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Method Card */}
                <div
                  ref={flowCardRef}
                  className="bg-white rounded-3xl border-2 border-[#9fe870] overflow-hidden relative"
                >
                  {/* Popular Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-[#9fe870] text-[#163300] px-3 py-1 rounded-full text-xs font-semibold">
                      推奨
                    </div>
                  </div>

                  {/* Card Header */}
                  <div className="p-8 border-b border-[#9fe870]/20 bg-[#9fe870]/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#9fe870]/20 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-[#163300]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#163300]">
                            AI面接練習
                          </h3>
                          <p className="text-[#163300]/70 text-sm">
                            AI面接官との対話
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#163300]">
                          週1時間
                        </div>
                        <div className="text-xs text-[#163300]/70">
                          効率的な学習時間
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          AI面接官とのリアルタイム対話
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          即座のフィードバックと分析
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          本番に近い緊張感での練習
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#9fe870] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-[#163300]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">
                          個人最適化された改善提案
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#9fe870]/10 border border-[#9fe870] rounded-2xl p-4">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-[#163300] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-[#163300] font-medium text-sm">
                          詳細な分析とパーソナライズドフィードバック
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <button
                  className="bg-[#163300] text-white px-12 py-4 rounded-full font-semibold text-lg hover:bg-[#163300]/90 transition-all duration-300 hover:scale-105 shadow-lg"
                  onClick={() => router.push("/interview/new")}
                >
                  今すぐAI面接練習を体験する
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  無料で3回まで体験可能
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Enhanced Footer - Campfire.ai Style */}
        <footer
          ref={footerRef}
          className="bg-[#163300] text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="grid grid-cols-12 gap-4 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full w-1 h-1 opacity-20"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-15 py-20">
              <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
                {/* Left: Call to Action */}
                <div className="flex flex-col justify-start h-full">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#9fe870]/20 text-[#9fe870] text-sm font-medium mb-6">
                    <div className="w-2 h-2 bg-[#9fe870] rounded-full mr-2"></div>
                    始めましょう
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    AI面接練習で
                    <br />
                    内定を掴む
                  </h2>
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    プロイーで面接スキルを向上させ、理想の企業への内定を実現しましょう。
                  </p>
                  <button
                    className="bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#9fe870]/90 transition-all duration-300 hover:scale-105 shadow-lg w-fit"
                    onClick={() => router.push("/interview/new")}
                  >
                    無料で始める
                  </button>
                </div>

                {/* Right: Navigation Menu */}
                <div className="bg-[#1a4a35] rounded-3xl p-8 h-full">
                  <div className="grid md:grid-cols-3 gap-8 mb-8">
                    {/* Products Column */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                        サービス
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            AI面接練習
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            フィードバック分析
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            料金プラン
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                        リソース
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            ヘルプセンター
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            面接対策ガイド
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            お問い合わせ
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Solutions Column */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                        ソリューション
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            就活生向け
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            転職者向け
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="text-gray-300 hover:text-[#9fe870] transition-colors text-sm"
                          >
                            企業向け
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-600 mt-auto">
                    <div className="flex items-center space-x-4">
                      <a
                        href="#"
                        className="w-8 h-8 bg-[#9fe870] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <svg
                          className="w-4 h-4 text-[#163300]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="w-8 h-8 bg-[#9fe870] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <svg
                          className="w-4 h-4 text-[#163300]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-gray-400 text-xs">
                      2025年 プロイー開発チーム
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-600">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  {/* Logo and Brand */}
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-8 h-8 bg-[#9fe870] rounded-lg flex items-center justify-center">
                      <Image src={logo} alt="logo" className="w-full h-full" />
                    </div>
                    <span className="text-white font-bold text-xl">
                      プロイー
                    </span>
                  </div>

                  {/* Legal Links */}
                  <div className="flex items-center space-x-6 text-sm">
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      利用規約
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      プライバシーポリシー
                    </a>
                    <p className="text-gray-400">
                      © 2025 プロイー. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
