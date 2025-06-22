import React from "react";
import { InterviewForm } from "@/components/ui/InterviewForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const page = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Header Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#163300] mb-6">
            AI面接の準備をしましょう
          </h1>
          <p className="text-xl text-gray-600 font-semibold max-w-2xl mx-auto">
            あなたの情報を入力して、パーソナライズされた面接練習を始めましょう
          </p>
        </div>

        <InterviewForm />
      </div>
    </div>
  );
};

export default page;
