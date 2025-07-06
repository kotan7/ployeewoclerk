"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { gsap } from "gsap";
import logo from "../../constants/logo.png";

const Header = () => {
  const router = useRouter();
  
  // Refs for header animations
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header animations on page load
    if (headerRef.current && logoRef.current && navRef.current && buttonsRef.current) {
      // Set initial states
      gsap.set([logoRef.current, navRef.current, buttonsRef.current], {
        opacity: 0,
        y: -20
      });

      // Create timeline for staggered animation
      const tl = gsap.timeline();

      // Animate logo first
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      })
      // Then animate navigation links
      .to(navRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3") // Start slightly before logo animation ends
      // Finally animate buttons
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3"); // Start slightly before nav animation ends
    }
  }, []);

  return (
    <header ref={headerRef} className="border-b border-gray-100/20 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center -ml-12 space-x-8">
            <div
              ref={logoRef}
              className="cursor-pointer flex items-center space-x-3"
              onClick={() => router.push("/")}
            >
              <Image
                src={logo}
                alt="プロイー ロゴ"
                width={32}
                height={32}
                className="object-contain"
              />
              <h1 className="text-2xl -ml-2 font-bold text-[#163300]">プロイー</h1>
            </div>

            {/* Navigation Links */}
            <nav ref={navRef} className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium"
              >
                ホーム
              </Link>
              <Link
                href="/interview/new"
                className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium"
              >
                練習
              </Link>
              <Link
                href="/past"
                className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium"
              >
                面接履歴
              </Link>
              <Link
                href="/interview"
                className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium"
              >
                コミュニティ
              </Link>
            </nav>
          </div>

          <div ref={buttonsRef} className="flex items-center space-x-4 -mr-6">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium">
                  ログイン
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[#9fe870] text-[#163300] px-6 py-2 rounded-full font-medium hover:bg-[#8fd960] transition-colors">
                  無料で始める
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
