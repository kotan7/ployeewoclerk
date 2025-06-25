import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, role, jobDescription, interviewFocus, resume } = body;

    const prompt = `
あなたは経験豊富な人事担当者です。以下の情報を元に、模擬面接で使用する適切な質問を5つ生成してください。

【応募者情報】
- 志望企業: ${companyName || "未入力"}
- 志望職種: ${role || "未入力"}  
- 職務内容: ${jobDescription || "未入力"}
- 面接フォーカス: ${interviewFocus || "general"}
- 履歴書: ${resume ? "提出済み" : "未提出"}

【質問生成の条件】
- 日本語で質問を作成してください
- 各質問は具体的で回答しやすいものにしてください
- 志望企業・職種・職務内容に関連した質問を含めてください
- 面接フォーカスに応じて技術的/一般的な質問を調整してください
- 自己紹介から始まり、徐々に深掘りする流れにしてください

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