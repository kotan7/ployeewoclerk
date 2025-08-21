import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/lib/supbase";
import { notFound, redirect } from "next/navigation";
import { canStartSession } from "@/lib/actions/usage.actions";
import InterviewSessionClient from "./InterviewSessionClient";

interface InterviewSessionProps {
  params: Promise<{ id: string }>;
}

const InterviewSession = async ({ params }: InterviewSessionProps) => {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#163300] mb-4">
            ログインが必要です
          </h1>
          <p className="text-gray-600">
            この面接セッションにアクセスするにはログインしてください
          </p>
        </div>
      </div>
    );
  }

  // Fetch interview data
  let interview = null;
  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .eq("author", user.id)
      .single();

    if (error || !data) {
      return notFound();
    }

    interview = data;
  } catch (error) {
    console.error("Failed to fetch interview:", error);
    return notFound();
  }

  // Check usage limits before allowing access to interview
  try {
    const usageInfo = await canStartSession();
    if (!usageInfo.canStart) {
      // Redirect to billing page if usage limit exceeded
      redirect("/billing");
    }
  } catch (error) {
    // Check if this is a redirect error (which should be allowed to propagate)
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.includes("NEXT_REDIRECT")
    ) {
      throw error; // Re-throw redirect errors
    }
    console.error("Failed to check usage limits:", error);
    // Allow access if usage check fails (don't block users due to technical issues)
  }

  return <InterviewSessionClient interview={interview} />;
};

export default InterviewSession;
