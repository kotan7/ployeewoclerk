"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AutoSignInProps {
  children: React.ReactNode;
}

const AutoSignIn = ({ children }: AutoSignInProps) => {
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

  // Show a loading state while determining auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner
            size="md"
            color="#9fe870"
          />
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
        <LoadingSpinner
          size="md"
          color="#9fe870"
        />
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
