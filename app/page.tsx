"use client";

import Orb from "../components/ui/reactbits/OrbBackground";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CardSwap, { Card } from "../components/ui/reactbits/cardSwap";
import LogoSlider from "../components/ui/LogoSlider";

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "プロイー",
  url: "https://ployee-mu.vercel.app",
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
      // Set initial states
      gsap.set(problemTextRef.current, { opacity: 0, y: 50 });
      gsap.set(problemImageRef.current, { opacity: 0, x: -50 });

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
          <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mt-16 mb-8">
                <h1
                  ref={heroTitleRef}
                  className="text-4xl text-center lg:text-6xl font-bold text-[#163300] mb-6 leading-tight"
                >
                  内定まで、何度でも叩き込む。
                  <br />
                  <span className="text-[#9fe870]">AI面接官</span>
                  、24時間フル稼働。
                </h1>
                <p
                  ref={heroSubtitleRef}
                  className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-bold text-center"
                >
                  就活の「面接」って、練習の場がなかなかない。
                  <br />
                  でも、ぶっつけ本番で挑むには、あまりにリスクが大きい。
                </p>
                <div
                  ref={heroButtonsRef}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <button
                    className="cursor-pointer bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg"
                    onClick={handleClick}
                    aria-label="AI面接練習を無料で体験する"
                  >
                    無料で体験する
                  </button>
                  <button
                    className="cursor-pointer border-2 border-[#163300] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#163300] hover:text-white transition-colors"
                    onClick={handleClick2}
                    aria-label="AI面接サービスの詳細を見る"
                  >
                    サービス詳細
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Problem Section */}
          <section
            ref={problemSectionRef}
            className="py-20 bg-gray-200/100 backdrop-blur-sm relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div ref={problemImageRef} className="flex-1 mr-20">
                <img
                  src="/soundwave.png"
                  alt="AI面接練習中の音声波形イメージ - リアルタイム対話"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div ref={problemTextRef} className="max-w-4xl text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#163300]">
                  そんなあなたのために、
                  <br />
                  私たちは<strong>AI面接官</strong>を開発しました。
                </h2>
                <p className="text-gray-600 font-bold mt-6">
                  <strong>AIとリアルタイムで対話</strong>
                  しながら、実際の面接に近い形式で練習ができます。
                  <br />
                  いつでも・何度でも挑戦可能。
                </p>
              </div>
            </div>
          </section>

          {/* Logo Slider Section */}
          <LogoSlider />

          {/* Features Section */}
          <section className="py-20 relative z-10 mt-10 -mb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="sr-only">AI面接練習サービスの特徴</h2>
              <div className="flex items-center gap-16">
                {/* Text Content - Left Side */}
                <div className="flex-1 mb-10">
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

                {/* CardSwap Component - Right Side */}
                <div
                  className="flex-1 relative mb-25"
                  style={{ marginTop: "-180px" }}
                >
                  <div style={{ height: "600px", position: "relative" }}>
                    <CardSwap
                      cardDistance={60}
                      verticalDistance={70}
                      delay={5000}
                      pauseOnHover={false}
                    >
                      {/* Lime Card */}
                      <Card customClass="!bg-[#9fe870] !border-[#9fe870]">
                        <div className="p-8 text-[#2D5016] h-full flex flex-col">
                          {/* Interview Icon */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-6">
                              <div className="w-12 h-12 bg-[#2D5016]/10 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-[#2D5016]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 leading-tight">
                              リアルタイム
                              <br />
                              面接練習
                            </h3>

                            <div className="w-12 h-0.5 bg-[#2D5016]/30 mb-4"></div>

                            <p className="text-[#2D5016]/80 text-sm leading-relaxed mb-4">
                              AIが面接官として質問し、自然な会話形式で面接の流れを体験できます。音声認識とリアルタイム応答で、実際の面接に近い環境を提供します。緊張感のある本格的な練習が可能です。
                            </p>

                            <div className="w-full h-0.5 bg-[#2D5016]/20 mb-6"></div>

                            <button className="bg-[#2D5016] text-white px-4 py-3 rounded-3xl text-sm font-medium hover:bg-[#2D5016]/90 transition-colors">
                              今すぐ試す →
                            </button>
                          </div>
                        </div>
                      </Card>

                      {/* Green Card */}
                      <Card customClass="!bg-[#163300] !border-[#163300]">
                        <div className="p-8 text-white h-full flex flex-col">
                          {/* Performance Icon */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-6">
                              <div className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center">
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
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 leading-tight">
                              面接パフォーマンス
                              <br />
                              評価
                            </h3>

                            <div className="w-12 h-0.5 bg-white/30 mb-4"></div>

                            <p className="text-gray-200 text-sm leading-relaxed mb-4">
                              多角的な視点からあなたの面接パフォーマンスを分析・評価します。話し方、表情、回答内容、論理性など細かい項目まで詳細に分析し、具体的な改善点を提示します。
                            </p>

                            <div className="w-full h-0.5 bg-white/20 mb-6"></div>

                            <button className="bg-[#9fe870] text-[#163300] px-4 py-3 rounded-3xl text-sm font-medium hover:bg-[#9fe870]/90 transition-colors">
                              評価を見る →
                            </button>
                          </div>
                        </div>
                      </Card>

                      {/* Pink Card */}
                      <Card customClass="!bg-[#f5b0ea] !border-[#f5b0ea]">
                        <div className="p-8 text-[#721C24] h-full flex flex-col">
                          {/* Feedback Icon */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-6">
                              <div className="w-12 h-12 bg-[#721C24]/10 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-[#721C24]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 leading-tight">
                              フィードバックと
                              <br />
                              強み発見
                            </h3>

                            <div className="w-12 h-0.5 bg-[#721C24]/30 mb-4"></div>

                            <p className="text-[#721C24]/80 text-sm leading-relaxed mb-4">
                              弱点の改善だけでなく、あなたの長所も発見し、より魅力的にアピールできるようサポートします。個人の特性を活かした回答パターンの提案や、自信を持って話せるポイントを明確化します。
                            </p>

                            <div className="w-full h-0.5 bg-[#721C24]/20 mb-6"></div>

                            <button className="bg-[#721C24] text-white px-4 py-3 rounded-3xl text-sm font-medium hover:bg-[#721C24]/90 transition-colors">
                              強みを発見 →
                            </button>
                          </div>
                        </div>
                      </Card>
                    </CardSwap>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Transformation Section */}
          <section className="w-full flex justify-center items-center py-32 bg-transparent mt-15">
            <div className="w-full max-w-5xl rounded-[48px] bg-[#163300] flex flex-col items-center px-8 pt-28 pb-20 relative" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.08)'}}>
              <img
                src="/interviewericon.png"
                alt="Interviewer Icon"
                className="w-80 h-80 object-contain absolute -top-40 left-1/2 -translate-x-1/2 drop-shadow-xl"
                style={{ zIndex: 2 }}
                draggable={false}
              />
              <h2 className="text-5xl md:text-6xl font-extrabold text-[#9fe870] text-center mb-6 leading-tight mt-2">
              過去問で鍛えられたAI面接官が<br />あなたの自信を引き出す
              </h2>
              <p className="text-lg md:text-xl text-white text-center mb-10 max-w-2xl">
              豊富な過去問データでAIが徹底指導。自信を持って本番に挑もう
              </p>
              <button
                className="bg-[#9fe870] text-[#163300] px-10 py-4 rounded-full font-semibold text-xl hover:bg-[#7fd950] transition-colors shadow-lg"
                onClick={() => router.push('/interview/new')}
              >
                AI面接を無料で体験する
              </button>
            </div>
          </section>
        </div>

        {/* Footer - now positioned normally after all content */}
        <footer ref={footerRef} className="bg-[#163300] text-white py-12 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">プロイー</h3>
                <p className="text-gray-300">AI面接練習で内定を掴む</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">サービス</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      AI面接練習
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      フィードバック
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      料金プラン
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">サポート</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      ヘルプセンター
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      お問い合わせ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      利用規約
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">会社情報</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      会社概要
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      プライバシーポリシー
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-[#9fe870] transition-colors"
                    >
                      採用情報
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-300">
                © 2024 プロイー. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
