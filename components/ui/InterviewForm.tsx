"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInterview } from "@/lib/actions/interview.actions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "お名前を入力してください",
  }),

  education: z.string().min(1, {
    message: "学歴を入力してください",
  }),

  experience: z.string().optional(),

  companyName: z.string().min(1, {
    message: "会社名を入力してください",
  }),

  role: z.string().min(1, {
    message: "職種・ポジションを入力してください",
  }),

  jobDescription: z.string().optional(),

  interviewFocus: z.enum(["hr", "case", "technical", "final"], {
    required_error: "面接の種類を選択してください",
  }),
});

const interviewFocusOptions = [
  { value: "hr", label: "人事面接" },
  { value: "case", label: "ケース面接" },
  { value: "technical", label: "テクニカル面接" },
  { value: "final", label: "最終面接" },
] as const;

export function InterviewForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      education: "",
      experience: "",
      companyName: "",
      role: "",
      jobDescription: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const interview = await createInterview(values);
      if (interview) {
        router.push(`/interview/${interview.id}`);
      } else {
        console.error("Failed to create interview");
        router.push("/");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
      {/* Form Container */}
      <div
        className="rounded-3xl p-8 shadow-lg"
        style={{
          backgroundColor: "rgba(197, 228, 212, 0.1)",
          backdropFilter: "blur(3px) saturate(65%)",
          WebkitBackdropFilter: "blur(30px) saturate(65%)",
          border: "2px solid rgba(210, 211, 210, 0.2)",
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#163300]">1. 個人情報</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-[#163300]">
                        お名前 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 田中太郎"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-[#163300]">
                        学歴 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 東京大学工学部卒業"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#163300]">
                      職歴・経験
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="これまでの職歴や主な経験、スキルについて記載してください。"
                        className="min-h-[120px] text-base resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      職歴、プロジェクト経験、技術スキル、実績など具体的に記載いただくと、より個人に合わせた面接練習が可能になります。未記載の場合は一般的な質問で面接練習を行います。
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Job Information Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#163300]">2. 求人情報</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-[#163300]">
                        会社名 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 株式会社サンプル"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-[#163300]">
                        職種・ポジション <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: ソフトウェアエンジニア"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#163300]">
                      職務内容・求人詳細
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="求人票の内容や職務内容を記載してください。より具体的な面接練習が可能になります。"
                        className="min-h-[120px] text-base resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      詳細な情報を提供いただくことで、より実際の面接に近い練習が可能になります
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Interview Type Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#163300]">
                3. 面接の種類
              </h2>

              <FormField
                control={form.control}
                name="interviewFocus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#163300]">
                      面接フォーカス <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="面接の種類を選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interviewFocusOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-base"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      選択した種類に応じて、最適な質問と評価基準で面接練習を行います
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] 
                  text-lg font-semibold rounded-full shadow-lg transition-colors cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner
                      size="sm"
                      color="#163300"
                    />
                    面接を準備中...
                  </div>
                ) : (
                  "面接セッションを開始する"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
