"use client";

import WaveBackground from "../components/ui/wave";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const heroBoxRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);

  // Refs for Problem Section animations
  const problemSectionRef = useRef<HTMLElement>(null);
  const problemTextRef = useRef<HTMLDivElement>(null);
  const problemImageRef = useRef<HTMLDivElement>(null);

  // Refs for Features Section animations
  const featuresSectionRef = useRef<HTMLElement>(null);
  const feature1Ref = useRef<HTMLElement>(null);
  const feature2Ref = useRef<HTMLElement>(null);
  const feature3Ref = useRef<HTMLElement>(null);

  // Refs for Transformation Section animations
  const transformationSectionRef = useRef<HTMLElement>(null);
  const transformationTextRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);

  // Refs for Post Labs-style reveal animation
  const mainContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Refs for transformation section animations
  const transformationBoxRef = useRef<HTMLDivElement>(null);
  const scrollInnerRef = useRef<HTMLDivElement>(null);

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
      [
        heroBoxRef.current,
        heroTitleRef.current,
        heroSubtitleRef.current,
        heroButtonsRef.current,
      ],
      {
        opacity: 0,
        y: 30,
      }
    );

    // Staggered animation sequence for hero
    heroTl
      .to(heroBoxRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      })
      .to(
        heroTitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      )
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
      gsap.set(problemImageRef.current, { opacity: 0, x: 50 });

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

    // Features section scroll-triggered animations
    if (
      featuresSectionRef.current &&
      feature1Ref.current &&
      feature2Ref.current &&
      feature3Ref.current
    ) {
      // Define initial and final positions for each box
      const boxPositions = {
        box1: {
          initial: {
            x: 415,
            y: 0,
            scale: 1,
            opacity: 1,
            rotation: 0,
            zIndex: 1,
          },
          final: { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, zIndex: 1 },
        },
        box2: {
          initial: { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, zIndex: 3 },
          final: { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, zIndex: 3 },
        },
        box3: {
          initial: {
            x: -415,
            y: 0,
            scale: 1,
            opacity: 1,
            rotation: 0,
            zIndex: 2,
          },
          final: { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, zIndex: 1 },
        },
      };

      // Set initial states for each box
      gsap.set(feature1Ref.current, boxPositions.box1.initial);
      gsap.set(feature2Ref.current, boxPositions.box2.initial);
      gsap.set(feature3Ref.current, boxPositions.box3.initial);

      // Create scroll-triggered timeline
      const featuresTl = gsap.timeline({
        scrollTrigger: {
          trigger: featuresSectionRef.current,
          start: "top center",
          end: "top 20%",
          scrub: 0.5,
        },
      });

      // Animate each box individually - side boxes roll as they slide
      featuresTl
        .to(
          feature1Ref.current,
          {
            x: 0,
            rotation: -360, // One full rotation counter-clockwise
            duration: 1,
            ease: "power3.out",
          },
          0
        )
        .to(
          feature2Ref.current,
          {
            ...boxPositions.box2.final,
            duration: 1,
            ease: "power3.out",
          },
          0
        )
        .to(
          feature3Ref.current,
          {
            x: 0,
            rotation: 360, // One full rotation clockwise
            duration: 1,
            ease: "power3.out",
          },
          0
        );
    }

    // Transformation section text color animation - scroll-based character reveal
    if (line1Ref.current && line2Ref.current && line3Ref.current) {
      // Line 1 character animation - scroll based
      gsap.to(line1Ref.current.querySelectorAll(".char"), {
        color: "#ffffff",
        duration: 0.1,
        stagger: 0.02,
        ease: "none",
        scrollTrigger: {
          trigger: line1Ref.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });

      // Line 2 character animation - scroll based
      gsap.to(line2Ref.current.querySelectorAll(".char"), {
        color: "#ffffff",
        duration: 0.1,
        stagger: 0.02,
        ease: "none",
        scrollTrigger: {
          trigger: line2Ref.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });

      // Line 3 character animation - scroll based
      gsap.to(line3Ref.current.querySelectorAll(".char"), {
        color: "#ffffff",
        duration: 0.1,
        stagger: 0.02,
        ease: "none",
        scrollTrigger: {
          trigger: line3Ref.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });
    }

    // Post Labs-style reveal animation - main content slides up to reveal footer
    if (mainContentRef.current && footerRef.current) {
      gsap.to(mainContentRef.current, {
        y: "-30vh",
        ease: "none",
        scrollTrigger: {
          trigger: mainContentRef.current,
          start: "bottom bottom",
          end: "+=30vh",
          scrub: 1,
        },
      });
    }

    // Transformation section box width animation
    if (transformationBoxRef.current) {
      gsap.to(transformationBoxRef.current, {
        width: "100vw",
        maxWidth: "100vw",
        x: "-25vw",
        ease: "power2.out",
        scrollTrigger: {
          trigger: transformationSectionRef.current,
          start: "top center",
          end: "center center",
          scrub: 1,
        },
      });
    }

    // Scrollable content animation - like Post Labs
    if (transformationBoxRef.current && scrollInnerRef.current) {
      ScrollTrigger.create({
        trigger: transformationSectionRef.current,
        start: "top top",
        end: "+=200%",
        pin: transformationBoxRef.current,
        anticipatePin: 1,
        scrub: true,
      });

      // Animate the scroll of the inner content manually
      gsap.to(scrollInnerRef.current, {
        yPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: transformationSectionRef.current,
          start: "top top",
          end: "+=200%",
          scrub: true,
        },
      });
    }

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
        {/* Footer positioned behind main content */}
        <footer
          ref={footerRef}
          className="bg-[#163300] text-white py-12 fixed bottom-0 left-0 right-0 z-0"
        >
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

        {/* Main content wrapper that slides up */}
        <div ref={mainContentRef} className="relative z-10 bg-white">
          {/* Hero Section */}
          <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 w-full h-full">
              <WaveBackground className="" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Hero content frame */}
              <div className="relative inline-block mb-15">
                <div
                  ref={heroBoxRef}
                  className="rounded-3xl "
                  style={{
                    backgroundColor: "rgba(197, 228, 212, 0.1)",
                    backdropFilter: "blur(3px) saturate(65%)",
                    WebkitBackdropFilter: "blur(30px) saturate(65%)",
                    border: "2px solid rgba(210, 211, 210, 0.2)",
                  }}
                >
                  <div className="px-8 pb-12 mt-28 mb-8">
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
              </div>
            </div>
          </section>

          {/* Problem Section */}
          <section
            ref={problemSectionRef}
            className="py-20 bg-gray-200/100 backdrop-blur-sm relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div ref={problemTextRef} className="max-w-4xl text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#163300] mr-10 ">
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
              <div ref={problemImageRef} className="flex-1">
                <img
                  src="/soundwave.png"
                  alt="AI面接練習中の音声波形イメージ - リアルタイム対話"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section
            ref={featuresSectionRef}
            className="py-20 relative z-10 mt-10 -mb-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="sr-only">AI面接練習サービスの特徴</h2>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <article
                  ref={feature1Ref}
                  className="bg-white shadow-sm hover:shadow-lg transition-shadow rounded-2xl border border-gray-100 p-6"
                >
                  <div
                    className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center mb-6"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-6 h-6 text-[#163300]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="チャットアイコン"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#163300] mb-4">
                    リアルタイム面接練習
                  </h3>
                  <p className="text-gray-600">
                    <strong>AIが面接官として質問</strong>
                    し、自然な会話形式で面接の流れを体験できます。
                  </p>
                </article>

                {/* Feature 2 */}
                <article
                  ref={feature2Ref}
                  className="bg-white shadow-sm hover:shadow-lg transition-shadow rounded-2xl border border-gray-100 p-6"
                >
                  <div
                    className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center mb-6"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-6 h-6 text-[#163300]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="評価チャートアイコン"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#163300] mb-4">
                    面接パフォーマンス評価
                  </h3>
                  <p className="text-gray-600">
                    多角的な視点からあなたの
                    <strong>面接パフォーマンスを分析・評価</strong>します。
                  </p>
                </article>

                {/* Feature 3 */}
                <article
                  ref={feature3Ref}
                  className="bg-white shadow-sm hover:shadow-lg transition-shadow rounded-2xl border border-gray-100 p-6"
                >
                  <div
                    className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center mb-6"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-6 h-6 text-[#163300]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="フィードバックアイコン"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#163300] mb-4">
                    フィードバックと強み発見
                  </h3>
                  <p className="text-gray-600">
                    弱点の改善だけでなく、あなたの長所も発見し、より魅力的にアピールできるよう
                    <strong>サポート</strong>します。
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* Transformation Section */}
          <section
            ref={transformationSectionRef}
            className="relative z-10 h-screen flex items-center m-0 p-0 mb-0"
            style={{ marginBottom: 0, paddingBottom: 0 }}
          >
            <div className="flex justify-center w-full m-0 p-0">
              <div
                ref={transformationBoxRef}
                className="relative overflow-hidden"
                style={{
                  width: "50vw",
                  maxWidth: "50vw",
                  height: "100vh", // ensure full viewport height
                  backgroundImage: "url('/interview_image copy.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundAttachment: "fixed",
                }}
              >
                {/* Scrollable Inner Content */}
                <div
                  ref={scrollInnerRef}
                  className="absolute inset-0 overflow-y-auto scroll-smooth"
                  style={{ height: "100%", padding: "3rem" }}
                >
                  {/* Transformation Content */}
                  <div className="text-center text-[#163300] min-h-screen flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-[#163300] rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6"
                        />
                      </svg>
                    </div>
                    <h2 className="text-5xl lg:text-5xl font-bold mb-8">
                      面接が怖い、自信がない
                    </h2>
                    <div
                      ref={transformationTextRef}
                      className="text-xl mb-8 leading-relaxed opacity-80"
                    >
                      <p ref={line1Ref} className="line-1">
                        {splitTextIntoChars(
                          "そんな不安を「準備した」という安心変えていきませんか？"
                        )}
                      </p>
                      <p ref={line2Ref} className="line-2">
                        {splitTextIntoChars(
                          "就活の不安を「可視化」し、「成長」に変える。"
                        )}
                      </p>
                      <p ref={line3Ref} className="line-3">
                        {splitTextIntoChars(
                          "あなたの本気に、本気で応えるAI面接サービス。"
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        className="cursor-pointer bg-[#163300] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#0f2a00] transition-colors shadow-lg"
                        onClick={handleClick}
                      >
                        デモを試す
                      </button>
                      <button
                        className="cursor-pointer text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:underline transition-colors border-2 border-[#163300]"
                        onClick={handleClick2}
                      >
                        詳細を見る
                      </button>
                    </div>
                  </div>

                  {/* CTA Content */}
                  <div className="text-center text-[#163300] min-h-screen flex flex-col items-center justify-center">
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-3xl lg:text-4xl font-bold mb-8">
                        まずは一度、体験してみてください。
                        <br />
                        あなたの可能性、きっと広がります。
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          className="cursor-pointer bg-[#163300] text-white px-10 py-4 rounded-full font-semibold text-xl hover:bg-[#0f2a00] transition-colors shadow-lg"
                          onClick={handleClick}
                        >
                          今すぐ無料で始める
                        </button>
                      </div>
                      <p className="text-sm mt-4 opacity-80">
                        ※ 無料プランでは3回まで面接練習が可能です
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
