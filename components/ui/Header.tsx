"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { gsap } from "gsap";
import logo from "../../constants/logo.png";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if current page is home page
  const isHomePage = pathname === "/";

  // Refs for header animations
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header animations on page load
    if (
      headerRef.current &&
      logoRef.current &&
      navRef.current &&
      buttonsRef.current
    ) {
      // Set initial states
      gsap.set([logoRef.current, navRef.current, buttonsRef.current], {
        opacity: 0,
        y: -20,
      });

      // Create timeline for staggered animation
      const tl = gsap.timeline();

      // Animate logo first
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        // Then animate navigation links
        .to(
          navRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        ) // Start slightly before logo animation ends
        // Finally animate buttons
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        ); // Start slightly before nav animation ends
    }

    // Scroll detection for enhanced glass effect
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      ref={headerRef}
      className={`z-50 transition-all duration-300 ${
        isHomePage
          ? "sticky top-5 mx-4 sm:mx-8 lg:mx-16"
          : "sticky top-0 w-full"
      }`}
    >
      {/* Conditional Container Styling */}
      <div
        className={`
          transition-all duration-300 ease-out h-16
          ${
            isHomePage
              ? `backdrop-blur-lg bg-white/30 border border-white/30 rounded-[32px] shadow-lg ${
                  isScrolled
                    ? "bg-white/30 shadow-xl border-white/40"
                    : "bg-white/30 shadow-lg"
                }`
              : "bg-white border-b border-gray-200"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left: Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div
                ref={logoRef}
                className="cursor-pointer flex items-center space-x-3"
                onClick={() => router.push(isSignedIn ? "/dashboard" : "/")}
              >
                <Image
                  src={logo}
                  alt="プロイー ロゴ"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <h1 className="text-xl sm:text-2xl -ml-2 font-bold text-[#163300]">
                  プロイー
                </h1>
              </div>

              {/* Desktop Navigation Links */}
              <nav
                ref={navRef}
                className="hidden lg:flex items-center space-x-6"
              >
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
                  href="/pricing"
                  className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium"
                >
                  料金
                </Link>
                <Link
                  href="/past"
                  className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium"
                >
                  面接履歴
                </Link>
              </nav>
            </div>

            {/* Right: Auth Buttons and Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Auth Buttons */}
              <div
                ref={buttonsRef}
                className="hidden sm:flex items-center space-x-4"
              >
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium">
                      ログイン
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-[#9fe870] text-[#163300] px-4 lg:px-6 py-2 rounded-full font-medium hover:bg-[#8fd960] transition-colors shadow-sm text-sm lg:text-base">
                      無料で始める
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-[#163300] hover:text-[#9fe870] hover:bg-white/20 transition-colors"
                aria-label="メニューを開く"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 mt-2 mx-4 sm:mx-8 lg:mx-16">
            <div
              className={`
                rounded-2xl shadow-lg border backdrop-blur-lg overflow-hidden
                ${
                  isHomePage
                    ? "bg-white/90 border-white/30"
                    : "bg-white border-gray-200"
                }
              `}
            >
              <div className="px-4 py-2">
                {/* Mobile Navigation Links */}
                <nav className="space-y-1">
                  <Link
                    href="/"
                    className="block px-4 py-3 text-[#163300] hover:text-[#9fe870] hover:bg-gray-50/50 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ホーム
                  </Link>
                  <Link
                    href="/interview/new"
                    className="block px-4 py-3 text-[#163300] hover:text-[#9fe870] hover:bg-gray-50/50 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    練習
                  </Link>
                  <Link
                    href="/pricing"
                    className="block px-4 py-3 text-[#163300] hover:text-[#9fe870] hover:bg-gray-50/50 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    料金
                  </Link>
                  <Link
                    href="/past"
                    className="block px-4 py-3 text-[#163300] hover:text-[#9fe870] hover:bg-gray-50/50 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    面接履歴
                  </Link>
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="w-full text-left px-4 py-3 text-[#163300] hover:text-[#9fe870] hover:bg-gray-50/50 rounded-lg transition-colors font-medium">
                        ログイン
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="w-full bg-[#9fe870] text-[#163300] px-4 py-3 rounded-lg font-medium hover:bg-[#8fd960] transition-colors shadow-sm">
                        無料で始める
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="px-4 py-2">
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
