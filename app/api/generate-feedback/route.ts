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
    const { conversationHistory, workflowState, interviewId } = body;

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

**評価体系:**
1. **総合評価** - 面接全体のパフォーマンス (100点満点)
2. **チャート用5項目評価** - レーダーチャート表示用の5つの側面 (各10点満点)
3. **フェーズ別評価** - 面接の各段階での具体的評価 (各10点満点)
4. **改善・強み分析** - 具体的な改善点と強みのハイライト

**出力形式:**
以下の形式の単一のJSONオブジェクトを返してください。
{
  "overallFeedback": {
    "score": "総合点数 (1-100)",
    "feedback": "面接全体に対する包括的なフィードバック (日本語で7〜10文、具体的な強み、改善点、アドバイスを含む)"
  },
  "chartData": [
    { "criteria": "コミュニケーション力", "score": 0 },
    { "criteria": "論理的思考力", "score": 0 },
    { "criteria": "志望動機の明確さ", "score": 0 },
    { "criteria": "自己分析力", "score": 0 },
    { "criteria": "成長意欲", "score": 0 }
  ],
  "phaseAnalysis": [
    { "phase": "自己紹介", "score": 0, "feedback": "日本語3〜4文" },
    { "phase": "学生時代の取り組み", "score": 0, "feedback": "日本語3〜4文" },
    { "phase": "志望動機", "score": 0, "feedback": "日本語3〜4文" },
    { "phase": "強み・弱み", "score": 0, "feedback": "日本語3〜4文" }
  ],
  "improvements": [
    "改善すべき具体的なポイント1 (詳細な説明)",
    "改善すべき具体的なポイント2 (詳細な説明)",
    "改善すべき具体的なポイント3 (詳細な説明)"
  ],
  "strengths": [
    "評価できる強み1 (具体的な根拠)",
    "評価できる強み2 (具体的な根拠)",
    "評価できる強み3 (具体的な根拠)"
  ]
}

**面接記録:**
${conversationHistory.map((msg: { role: string; content: string }) => 
  msg.role === "user" 
    ? `【候補者】: ${msg.content}` 
    : `【面接官】: ${msg.content}`
).join('\n')}

**面接内容:**
AI面接官が応募者の情報に基づいて動的に生成した質問による面接
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
      chartData: result.chartData || [],
      phaseAnalysis: result.phaseAnalysis || [],
      improvements: result.improvements || [],
      strengths: result.strengths || [],
      // Keep legacy format for backward compatibility
      detailedFeedback: result.detailedFeedback || {},
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