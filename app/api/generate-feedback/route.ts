import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, questions } = body;

    if (!transcript || !questions) {
      return NextResponse.json({ error: "Transcript and questions are required" }, { status: 400 });
    }

    const prompt = `
あなたは経験豊富な面接官です。以下の面接のトランスクリプトと質問リストを分析し、各質問に対する候補者の回答を評価し、さらに面接全体の総合評価を提供してください。

**重要な評価ルール:**
- 質問に対する回答が見つからない場合、その質問のスコアは0、フィードバックは空文字("")にしてください
- 回答がある質問のみ適切にスコアをつけてください

**評価基準:**
- 回答の明確さ
- 具体的な経験やスキルの提示
- 質問への的確さ
- 自己PRの有効性
- コミュニケーション能力
- 論理的思考力
- 熱意・意欲

**出力形式:**
以下の形式の単一のJSONオブジェクトを返してください。質問の数と同じ数のfeedback要素を必ず含めてください。
{
  "overallFeedback": {
    "score": "総合点数 (1-100)",
    "feedback": "面接全体に対する包括的なフィードバック (日本語で5〜8文、具体的な強みと改善点を含む)"
  },
  "feedback": [
    {
      "score": "点数 (1-10、回答がない場合は0)",
      "feedback": "具体的なフィードバック (日本語で2〜3文、回答がない場合は空文字)"
    },
    {
      "score": "点数 (1-10、回答がない場合は0)",
      "feedback": "具体的なフィードバック (日本語で2〜3文、回答がない場合は空文字)"
    }
  ]
}

**面接トランスクリプト:**
${transcript}

**質問リスト:**
${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}
`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたは経験豊富な面接官で、候補者の回答を的確に評価し、具体的なフィードバックを提供する専門家です。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const feedback = result.feedback || [];
    const overallFeedback = result.overallFeedback || {};
    
    return NextResponse.json({ 
      feedback,
      overallFeedback 
    });

  } catch (error) {
    console.error("Error in generate-feedback route:", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}