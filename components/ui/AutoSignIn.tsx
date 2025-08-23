"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AutoSignInProps {
  children: React.ReactNode;
  nonClosableModal?: boolean; // New prop to make modal non-closable
}

const AutoSignIn = ({
  children,
  nonClosableModal = false,
}: AutoSignInProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const [hasTriggeredModal, setHasTriggeredModal] = useState(false);

  useEffect(() => {
    // Only proceed if Clerk has loaded and user is not signed in
    if (isLoaded && !isSignedIn && !hasTriggeredModal) {
      setHasTriggeredModal(true);

      // Automatically click the hidden sign-in button to trigger modal
      setTimeout(() => {
        signInButtonRef.current?.click();
      }, 100);
    }
  }, [isLoaded, isSignedIn, hasTriggeredModal]);

  // Add effect to make modal non-closable when the option is enabled
  useEffect(() => {
    if (nonClosableModal && hasTriggeredModal && !isSignedIn) {
      // Add CSS to hide close button and prevent ESC key
      const style = document.createElement("style");
      style.id = "autosignin-non-closable-modal-style";
      style.textContent = `
        .cl-modalCloseButton {
          display: none !important;
        }
        .cl-modalBackdrop {
          pointer-events: none !important;
        }
        .cl-modalContent {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);

      // Prevent ESC key from closing modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("keydown", handleKeyDown, true);

      return () => {
        // Cleanup when component unmounts or user signs in
        const existingStyle = document.getElementById(
          "autosignin-non-closable-modal-style"
        );
        if (existingStyle) {
          existingStyle.remove();
        }
        document.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [nonClosableModal, hasTriggeredModal, isSignedIn]);

  // Show a loading state while determining auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="md" color="#9fe870" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // If user is signed in, show the actual page content
  if (isSignedIn) {
    return <>{children}</>;
  }

  // Show loading state with hidden sign-in button that auto-triggers
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="md" color="#9fe870" />
        <p className="text-gray-600">認証中...</p>

        {/* Hidden sign-in button that gets auto-clicked */}
        <SignInButton mode="modal">
          <button
            ref={signInButtonRef}
            style={{ display: "none" }}
            aria-hidden="true"
          >
            Hidden Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
};

export default AutoSignIn;
