import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, education, experience, companyName, role, jobDescription, interviewFocus } = body;

    const prompt = `
あなたは日本企業で20年間面接を担当してきた経験豊富な人事担当者です。以下の情報を元に、日本の面接文化に適した質問を5つ生成してください。

【応募者情報】
- 名前: ${name || "未入力"}
- 職歴・経験: ${experience || "未入力"}
- 志望企業: ${companyName || "未入力"}
- 志望職種: ${role || "未入力"}  
- 職務内容: ${jobDescription || "未入力"}
- 面接フォーカス: ${interviewFocus || "general"}

【日本の面接文化を踏まえた質問生成の条件】
- 日本語で質問を作成してください
- 応募者の職歴・経験に基づく具体的なエピソードを引き出す質問にしてください
- 志望企業・職種への理解度と本気度を確認する質問を含めてください
- 面接フォーカスに応じて技術的/一般的な質問を調整してください
- 自己紹介から始まり、徐々に深掘りする流れにしてください
- チームワーク、問題解決能力、向上心を評価できる質問を心がけてください
- 失敗経験から何を学んだかを聞く質問を含めてください
- 応募者の人柄と企業文化との適合性を見極める質問にしてください
- 「なぜ」「どのように」「具体的に」を使った深掘り質問にしてください

質問のみを番号付きリストで出力してください（説明や追加コメントは不要）。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは経験豊富な人事担当者で、効果的な面接質問を作成する専門家です。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }, {
      timeout: 25000, // 25 seconds timeout
    });

    const questionsText = completion.choices[0]?.message?.content || "";
    
    // Parse the numbered list and extract questions
    const questions = questionsText
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(question => question.length > 0);

    const finalQuestions = questions.length >= 5 ? questions.slice(0, 5) : questions;

    return NextResponse.json({ 
      questions: finalQuestions.length > 0 ? finalQuestions : [
        "まずは簡単に自己紹介をお願いします。",
        "なぜ弊社を志望されたのですか？",
        "この職種を選んだ理由を教えてください。",
        "あなたの強みと弱みを教えてください。",
        "5年後のキャリアビジョンを聞かせてください。"
      ]
    });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    
    return NextResponse.json({ 
      questions: [
        "まずは簡単に自己紹介をお願いします。",
        "なぜ弊社を志望されたのですか？",
        "この職種を選んだ理由を教えてください。",
        "あなたの強みと弱みを教えてください。",
        "5年後のキャリアビジョンを聞かせてください。"
      ]
    });
  }
} 