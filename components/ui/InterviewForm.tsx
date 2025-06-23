"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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
import { redirect } from "next/navigation";

const formSchema = z.object({
  resume: z
    .any()
    .optional()
    .refine((files) => {
      if (!files || !files.length) return true;
      const file = files[0];
      return file.size <= 10 * 1024 * 1024; // 10MB limit
    }, "ファイルサイズは10MB以下にしてください"),

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      role: "",
      jobDescription: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const interview = await createInterview(values);
    if (interview) {
      redirect(`/interview/${interview.id}`);
    } else {
      console.error("Failed to create interview");
      redirect("/");
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
            {/* Resume Upload Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#163300]">
                1. 履歴書のアップロード
              </h2>

              <FormField
                control={form.control}
                name="resume"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#163300]">
                      履歴書ファイル
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => onChange(e.target.files)}
                        className="h-auto py-3 file:mr-4 file:py-2 file:px-4 
                          file:rounded-full file:border-0 file:text-sm 
                          file:font-semibold file:bg-[#9fe870] file:text-[#163300]
                          hover:file:bg-[#8fd960] file:cursor-pointer cursor-pointer
                          "
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      最大ファイルサイズ: 10MB（PDF, DOC, DOCX形式対応）
                    </FormDescription>
                    <FormMessage />
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
                      職務内容・求人詳細（推奨）
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
                className="w-full h-14 bg-[#9fe870] text-[#163300] hover:bg-[#8fd960] 
                  text-lg font-semibold rounded-full shadow-lg transition-colors cursor-pointer"
              >
                AI面接を開始する
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
