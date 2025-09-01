import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from 'openai';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ESAnalysisRequest {
  companyName: string;
  question: string;
  answer: string;
}

interface ESAnalysisResponse {
  overall_score: number;
  match_score: number;
  structure_score: number;
  basic_score: number;
  feedback: string;
}

const generateESAnalysisPrompt = (companyName: string, question: string, answer: string): string => {
  return `あなたは就活・転職のエントリーシート（ES）添削の専門家です。以下のESを詳細に分析し、指定された形式で日本語のフィードバックを提供してください。

【企業名】${companyName}
【質問】${question}
【回答】${answer}

以下の形式で分析結果を出力してください：

【ES総合点】XX点
- 求める人材とのマッチ：XX点
- ESの構成：XX点
- 基本チェック：XX点

【求める人材とのマッチ】
◯会社要件：（企業が求める人材像や能力を推測して記載）
◯ESの根拠：（回答から読み取れる具体的な経験や成果を記載）
△不足：（不足している要素や改善点を記載）

【ESの構成】
（STAR法での構成、論理性、具体性、定量性などの観点から評価）

【基本チェック】
（文法、分量、具体性、独自性などの基本的な要素を評価）

【改善提案】
（具体的な改善案や書き換え例を提示）

評価基準：
- 求める人材とのマッチ：企業の求める人材像との適合度（70-100点）
- ESの構成：論理性、STAR法の活用、具体性（70-100点）
- 基本チェック：文法、分量、独自性、読みやすさ（70-100点）
- 総合点：3項目の平均点

各項目で具体的で建設的なフィードバックを提供し、改善のための具体的なアドバイスを含めてください。`;
};

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}

export async function POST(request: NextRequest) {
  console.log("ES Analysis API called");
  
  try {
    // Check authentication
    const { userId } = await auth();
    console.log("User ID:", userId);
    
    if (!userId) {
      console.log("No user ID found");
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ESAnalysisRequest = await request.json();
    console.log("Request body:", { 
      companyName: body.companyName, 
      question: body.question?.substring(0, 50) + "...",
      answerLength: body.answer?.length 
    });
    
    const { companyName, question, answer } = body;

    // Validate input
    if (!companyName || !question || !answer) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    if (answer.length < 50) {
      return NextResponse.json(
        { error: "回答は50文字以上で入力してください" },
        { status: 400 }
      );
    }

    // Create initial database record
    const { data: esRecord, error: insertError } = await supabase
      .from("es_corrections")
      .insert({
        user_id: userId,
        company_name: companyName,
        question: question,
        answer: answer,
        status: "processing"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "データベースエラーが発生しました" },
        { status: 500 }
      );
    }

    try {
      // Call OpenAI API using the SDK
      console.log("Calling OpenAI API...");
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたは経験豊富な就活・転職コンサルタントです。エントリーシートの添削において、建設的で具体的なフィードバックを提供します。"
          },
          {
            role: "user",
            content: generateESAnalysisPrompt(companyName, question, answer)
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const feedback = completion.choices[0]?.message?.content;
      console.log("OpenAI response received, feedback length:", feedback?.length);

      if (!feedback) {
        throw new Error("OpenAI response is empty");
      }

      // Parse scores from feedback
      const scoreRegex = /【ES総合点】(\d+)点[\s\S]*?求める人材とのマッチ：(\d+)点[\s\S]*?ESの構成：(\d+)点[\s\S]*?基本チェック：(\d+)点/;
      const scoreMatch = feedback.match(scoreRegex);
      
      let overall_score = 85;
      let match_score = 85;
      let structure_score = 85;
      let basic_score = 85;

      if (scoreMatch) {
        overall_score = parseInt(scoreMatch[1]) || 85;
        match_score = parseInt(scoreMatch[2]) || 85;
        structure_score = parseInt(scoreMatch[3]) || 85;
        basic_score = parseInt(scoreMatch[4]) || 85;
      }

      // Update database record with results
      const { error: updateError } = await supabase
        .from("es_corrections")
        .update({
          ai_feedback: feedback,
          overall_score: overall_score,
          match_score: match_score,
          structure_score: structure_score,
          basic_score: basic_score,
          scores: {
            overall: overall_score,
            match: match_score,
            structure: structure_score,
            basic: basic_score
          },
          status: "completed"
        })
        .eq("id", esRecord.id);

      if (updateError) {
        console.error("Database update error:", updateError);
        // Don't return error here as we have the analysis, just log it
      }

      return NextResponse.json({
        id: esRecord.id,
        overall_score,
        match_score,
        structure_score,
        basic_score,
        feedback,
        success: true
      });

    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Update database record with error status
      await supabase
        .from("es_corrections")
        .update({ status: "failed" })
        .eq("id", esRecord.id);

      // Provide more specific error messages
      let errorMessage = "AI分析中にエラーが発生しました。しばらく時間をおいて再度お試しください。";
      
      if (openaiError instanceof Error) {
        if (openaiError.message.includes('rate_limit')) {
          errorMessage = "現在アクセスが集中しています。しばらく時間をおいて再度お試しください。";
        } else if (openaiError.message.includes('insufficient_quota')) {
          errorMessage = "サービスの利用制限に達しています。管理者にお問い合わせください。";
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("ES analysis error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}