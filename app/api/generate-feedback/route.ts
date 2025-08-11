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
    const { conversationHistory, questions, workflowState, interviewId } = body;

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return NextResponse.json({ error: "Conversation history is required" }, { status: 400 });
    }

    // Create detailed analysis based on workflow state
    const workflowAnalysis = workflowState ? `
**面接進行状況分析:**
- 現在のフェーズ: ${workflowState.currentPhaseId}
- 完了済み回答: ${JSON.stringify(workflowState.fulfilled, null, 2)}
- 失敗フェーズ: ${workflowState.failedPhases?.join(', ') || 'なし'}
- 面接完了状況: ${workflowState.finished ? '完了' : '未完了'}

**フェーズ別期待要素:**
- self_intro: 名前、学歴
- gakuchika: 学生時代の取り組み、行動、結果
- strength: 強み、具体例、成果
- weakness: 弱み、対処法
- industry_motivation: 志望動機、経験との関連、将来目標
` : '';

    const prompt = `
あなたは経験豊富な面接官です。以下の面接トランスクリプトと構造化されたワークフロー状況を分析し、詳細なフィードバックを提供してください。

${workflowAnalysis}

**詳細評価基準:**
1. **内容の充実度** - 各フェーズで期待される情報が含まれているか
2. **具体性** - 抽象的でなく、具体的な経験や例が示されているか
3. **論理性** - 回答が筋道立てて話されているか
4. **自己分析力** - 自分の強み・弱みを客観視できているか
5. **志望動機の明確さ** - なぜその企業・職種を選んだかが明確か
6. **成長意欲** - 向上心や学習意欲が感じられるか
7. **コミュニケーション力** - 相手に分かりやすく伝えられているか

**出力形式:**
以下の形式の単一のJSONオブジェクトを返してください。各フェーズの評価も含めてください。
{
  "overallFeedback": {
    "score": "総合点数 (1-100)",
    "feedback": "面接全体に対する包括的なフィードバック (日本語で7〜10文、具体的な強み、改善点、アドバイスを含む)"
  },
  "phaseAnalysis": [
    {
      "phase": "フェーズ名",
      "completed": "完了状況 (true/false)",
      "score": "点数 (1-10、未回答は0)",
      "feedback": "そのフェーズに対する具体的フィードバック (日本語で3〜4文)"
    }
  ],
  "detailedFeedback": {
    "strengths": ["強みとして評価できるポイント1", "強み2", "強み3"],
    "improvements": ["改善すべきポイント1", "改善点2", "改善点3"],
    "recommendations": ["今後の面接でのアドバイス1", "アドバイス2", "アドバイス3"]
  }
}

**面接記録:**
${conversationHistory.map((msg: { role: string; content: string }) => 
  msg.role === "user" 
    ? `【候補者】: ${msg.content}` 
    : `【面接官】: ${msg.content}`
).join('\n')}

**質問リスト (参考):**
${questions?.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n') || '構造化ワークフローによる面接'}
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
    }, {
        timeout: 25000, // 25 seconds timeout
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    return NextResponse.json({ 
      overallFeedback: result.overallFeedback || {},
      phaseAnalysis: result.phaseAnalysis || [],
      detailedFeedback: result.detailedFeedback || {},
      // Keep legacy format for backward compatibility
      feedback: result.feedback || []
    });

  } catch (error) {
    console.error("Error in generate-feedback route:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json({ 
          error: "Request timeout. Please try again." 
        }, { status: 408 });
      }
      
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: "API configuration error" 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: `Failed to generate feedback: ${error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to generate feedback" 
    }, { status: 500 });
  }
}