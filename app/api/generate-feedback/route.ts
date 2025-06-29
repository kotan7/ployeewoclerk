import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, questions } = body;

    // Enhanced validation
    if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Valid questions array is required" }, { status: 400 });
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json({ error: "API configuration error" }, { status: 500 });
    }

    const prompt = `
あなたは経験豊富な面接官です。以下の面接のトランスクリプトと質問リストを分析し、各質問に対する候補者の回答を評価してください。

**評価基準:**
- 回答の明確さ
- 具体的な経験やスキルの提示
- 質問への的確さ
- 自己PRの有効性

**重要:** 必ず以下の形式の有効なJSONオブジェクトのみを返してください。他のテキストは含めないでください。

**出力形式:**
{
  "feedback": [
    {
      "score": "点数 (1-10)",
      "feedback": "具体的なフィードバック (日本語で2〜3文)"
    }
  ]
}

**面接トランスクリプト:**
${transcript}

**質問リスト:**
${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

必ず上記の形式でJSONのみを返してください。`;

    console.log("Sending request to OpenAI...");
    
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたは経験豊富な面接官で、候補者の回答を的確に評価し、具体的なフィードバックを提供する専門家です。必ず有効なJSONフォーマットで回答してください。",
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

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      console.error("No response content from OpenAI");
      return NextResponse.json({ error: "No response from AI service" }, { status: 500 });
    }

    console.log("OpenAI response:", responseContent);

    let result;
    try {
      result = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response:", responseContent);
      return NextResponse.json({ error: "Invalid response format from AI service" }, { status: 500 });
    }

    // Validate the response structure
    if (!result.feedback || !Array.isArray(result.feedback)) {
      console.error("Invalid feedback structure:", result);
      
      // Provide fallback feedback
      const fallbackFeedback = [
        {
          score: "6",
          feedback: "面接の内容を分析できませんでしたが、今後の改善に向けて具体的な経験をより詳しく話すことをお勧めします。"
        }
      ];
      
      return NextResponse.json({ feedback: fallbackFeedback });
    }

    // Ensure each feedback item has required properties
    const validatedFeedback = result.feedback.map((item: any, index: number) => ({
      score: item.score?.toString() || "5",
      feedback: item.feedback || `質問${index + 1}に対するフィードバックを生成できませんでした。`
    }));

    return NextResponse.json({ feedback: validatedFeedback });

  } catch (error) {
    console.error("Error in generate-feedback route:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Check if it's an OpenAI API error
    if (error && typeof error === 'object' && 'status' in error) {
      const openAiError = error as any;
      console.error("OpenAI API error status:", openAiError.status);
      console.error("OpenAI API error details:", openAiError.error);
      
      if (openAiError.status === 401) {
        return NextResponse.json({ error: "API authentication failed" }, { status: 500 });
      } else if (openAiError.status === 429) {
        return NextResponse.json({ error: "API rate limit exceeded" }, { status: 429 });
      }
    }

    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}