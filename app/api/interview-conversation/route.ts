import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { getWorkflowState, saveWorkflowState } from '../../../lib/actions/interview.actions';

// Configure runtime for Vercel
export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Initialize TTS client with proper credentials handling
let ttsClient: TextToSpeechClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Use JSON credentials for deployment (Vercel, etc.)
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  ttsClient = new TextToSpeechClient({ credentials });
} else {
  // Use file path for local development
  ttsClient = new TextToSpeechClient();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const conversationContext = formData.get('context') as string || '';
    const systemPrompt = formData.get('systemPrompt') as string || '';
    const interviewId = formData.get('interviewId') as string;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Use default interview ID for testing if none provided
    const effectiveInterviewId = interviewId || 'test-default-interview';
    
    console.log('Using interview ID:', effectiveInterviewId);

    // Convert audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer();
    
    // Initialize Gemini model - Use the more capable model for better Japanese
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });
    
    // Step 1: First, get the transcript of the audio with improved Japanese prompt
    const transcriptionPrompt = `以下の音声ファイルを日本語で正確に文字起こししてください。
話者の発言内容のみを記載し、余計なコメントや説明は一切含めないでください。
自然な日本語として聞こえるように、適切な句読点も含めてください。`;
    
    const transcriptionResult = await model.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type,
          data: Buffer.from(audioBuffer).toString('base64')
        }
      },
      transcriptionPrompt
    ]);

    const transcript = transcriptionResult.response.text().trim();
    
    // Step 2: Load workflow state from database instead of client context
    const dbWorkflowState = await getWorkflowState(effectiveInterviewId);
    
    // Use database state as primary source, fall back to context if needed
    const contextObj = JSON.parse(conversationContext || '{}');
    const history = dbWorkflowState.conversationHistory.length > 0 
      ? dbWorkflowState.conversationHistory 
      : (contextObj.history || []);

    // Improved workflow definition with more natural Japanese prompts
    const workflow = [
      {
        id: 'self_intro',
        prompt: 'まずは簡単に自己紹介をお願いいたします。',
        expected_data: ['name', 'education'],
        next_state: 'gakuchika',
      },
      {
        id: 'gakuchika',
        prompt: '学生時代に最も力を入れて取り組まれたことについて、具体的にお聞かせください。',
        expected_data: ['topic', 'actions', 'outcome'],
        next_state: 'strength',
      },
      {
        id: 'strength',
        prompt: 'ご自身の強みについて、具体的なエピソードと併せて教えていただけますでしょうか。',
        expected_data: ['strength', 'example', 'outcome'],
        next_state: 'weakness',
      },
      {
        id: 'weakness',
        prompt: 'ご自身の課題となる部分や改善点について、どのような対策を講じていらっしゃるか教えてください。',
        expected_data: ['weakness', 'coping_strategy'],
        next_state: 'industry_motivation',
      },
      {
        id: 'industry_motivation',
        prompt: '弊社の業界を志望される理由と、これまでのご経験との関連性についてお聞かせください。',
        expected_data: ['motivation', 'connection_to_experience', 'future_goal'],
        next_state: 'end',
      },
    ] as const;

    type WorkflowPhaseId = typeof workflow[number]['id'] | 'end';

    // Use database workflow state as primary source
    let currentPhaseId: WorkflowPhaseId = (dbWorkflowState.currentPhaseId as WorkflowPhaseId) || 'self_intro';
    let questionCounts: Record<string, number> = dbWorkflowState.questionCounts || {};
    let fulfilled: Record<string, Record<string, string>> = dbWorkflowState.fulfilled || {};
    let failedPhases: string[] = Array.isArray(dbWorkflowState.failedPhases) ? dbWorkflowState.failedPhases : [];
    let finished: boolean = Boolean(dbWorkflowState.finished);
    
    // Get the last 4 rounds (8 messages: 4 user + 4 assistant)
    const recentHistory = history.slice(-8);
    
    // Render readable conversation
    let readableHistory = '';
    if (recentHistory.length > 0) {
      readableHistory = recentHistory.map((msg: { role: string; content: string }) =>
        msg.role === "user"
          ? `応募者：${msg.content}`
          : `面接官：${msg.content}`
      ).join('\n');
    }
    
    // Debug: Log conversation history for verification
    console.log('Conversation History being sent to AI:', {
      totalHistory: history.length,
      recentHistoryCount: recentHistory.length,
      readableHistory: readableHistory,
      currentTranscript: transcript
    });
    
    // Two-layer LLM: 1) assessor to extract fulfillment, 2) interviewer question
    const currentPhase = workflow.find(p => p.id === currentPhaseId);
    if (!currentPhase) {
      currentPhaseId = 'self_intro';
    }

    // Initialize containers for current phase
    if (!fulfilled[currentPhaseId]) fulfilled[currentPhaseId] = {};
    if (questionCounts[currentPhaseId] == null) questionCounts[currentPhaseId] = 0;

    // 1) Improved Assessor prompt with better Japanese context understanding
    const assessorPrompt = `あなたは面接評価の専門家です。以下の面接の会話履歴と応募者の最新発言から、指定された評価項目に対応する情報が適切に回答されているかを分析してください。

【面接の会話履歴】
${readableHistory || '（面接開始前）'}

【応募者の最新発言】
${transcript}

【評価すべき項目】
${(workflow.find(p => p.id === currentPhaseId)!.expected_data).map(k => `- ${k}`).join('\n')}

【出力形式】
以下のJSON形式でのみ回答してください。他の文章は一切含めないでください。

{
  "values": {
    "項目名": "回答内容（該当する情報が見つかった場合）" または null
  },
  "isComplete": true または false,
  "missing": ["不足している項目名のリスト"]
}

【評価基準】
- 応募者が実際に述べた内容のみを抽出する
- 推測や補完は行わない
- 全項目に具体的な回答がある場合のみisComplete: trueとする
- 日本語の敬語表現や口語表現も適切に理解する`;

    let assessorJson = { values: {} as Record<string, string | null>, isComplete: false, missing: [] as string[] };
    try {
      const assessorRes = await model.generateContent([assessorPrompt]);
      const assessorText = assessorRes.response.text();
      // Robust JSON extraction in case model returns extra text or code fences
      const match = assessorText.match(/\{[\s\S]*\}/);
      const jsonText = match ? match[0] : assessorText;
      assessorJson = JSON.parse(jsonText);
    } catch (error) {
      console.error('Assessor JSON parsing failed:', error);
      // If assessor fails, proceed without updating fulfillment
    }

    // Merge new values into fulfilled state
    const expectedKeys = [
      ...(workflow.find(p => p.id === currentPhaseId)!.expected_data as readonly string[]),
    ];

    // Improved Japanese name extraction with better patterns
    const extractJapaneseName = (text: string): string | null => {
      if (!text) return null;
      const cleaned = text.replace(/\s+/g, '').trim();
      
      // Pattern 1: 私の名前は〜です/私は〜と申します
      const patterns = [
        /(?:私(?:の)?名前は|名前は)\s*([あ-んア-ン一-龯々ー・\s]{2,10})(?:です|と申します|といいます)/,
        /私は\s*([あ-んア-ン一-龯々ー・\s]{2,10})(?:と申します|といいます|です)/,
        /([あ-んア-ン一-龯々ー・\s]{2,10})(?:と申します|といいます)(?:よろしく|。|$)/,
        /([あ-んア-ン一-龯々ー・]{2,10})(?:です|と申します)(?:よろしく|。|$)/
      ];
      
      for (const pattern of patterns) {
        const match = cleaned.match(pattern);
        if (match && match[1]) {
          const name = match[1].replace(/\s+/g, '').trim();
          if (name.length >= 2 && name.length <= 10) {
            return name;
          }
        }
      }
      return null;
    };

    for (const key of expectedKeys) {
      const val = (assessorJson.values as any)?.[key];
      if (val && typeof val === 'string' && val.trim().length > 0) {
        fulfilled[currentPhaseId][key] = val.trim();
      }
    }

    // If still missing 'name' in self-intro, try deterministic extraction from latest transcript
    if (currentPhaseId === 'self_intro' && expectedKeys.includes('name')) {
      if (!fulfilled[currentPhaseId]['name']) {
        const extracted = extractJapaneseName(transcript);
        if (extracted) {
          fulfilled[currentPhaseId]['name'] = extracted;
        }
      }
    }

    // Determine if phase complete or failed by question cap
    const allKeysFulfilled = expectedKeys.every(k => Boolean(fulfilled[currentPhaseId][k]));
    let advancePhase = false;
    let markFailed = false;
    let nextPhaseId: WorkflowPhaseId = currentPhaseId;

    if (allKeysFulfilled) {
      advancePhase = true;
      nextPhaseId = (workflow.find(p => p.id === currentPhaseId)!.next_state as WorkflowPhaseId);
    } else if (questionCounts[currentPhaseId] >= 3) {
      // cap reached -> fail phase and advance
      markFailed = true;
      if (!failedPhases.includes(currentPhaseId)) failedPhases.push(currentPhaseId);
      advancePhase = true;
      nextPhaseId = (workflow.find(p => p.id === currentPhaseId)!.next_state as WorkflowPhaseId);
    }

    // Improved key labels in more natural Japanese
    const keyLabels: Record<string, string> = {
      name: 'お名前',
      education: 'ご出身校や学歴',
      topic: '取り組まれた内容',
      actions: '具体的な行動や取り組み',
      outcome: '成果や結果',
      strength: 'ご自身の強み',
      example: '具体的なエピソード',
      weakness: '課題や改善点',
      coping_strategy: '改善に向けた取り組み',
      motivation: '志望理由',
      connection_to_experience: 'これまでのご経験との関連',
      future_goal: '今後の目標',
    };

    let interviewerObjective = '';
    if (advancePhase) {
      if (nextPhaseId === 'end') {
        finished = true;
        interviewerObjective = 'お忙しい中、貴重なお時間をいただき、ありがとうございました。以上で面接を終了させていただきます。';
      } else {
        const nextPhase = workflow.find(p => p.id === nextPhaseId)!;
        interviewerObjective = nextPhase.prompt;
        // entering a new phase -> count first question for that phase
        questionCounts[nextPhaseId] = (questionCounts[nextPhaseId] || 0) + 1;
      }
      currentPhaseId = nextPhaseId;
    } else {
      // stay in phase, ask focused follow-up on first missing key
      const missing = expectedKeys.filter(k => !fulfilled[currentPhaseId][k]);
      const targetKey = missing[0];
      const jpKey = keyLabels[targetKey] || targetKey;
      
      // More natural follow-up questions based on context
      const followUpPhrases = [
        `${jpKey}について、もう少し詳しくお聞かせいただけますでしょうか。`,
        `${jpKey}の部分をもう少し具体的に教えていただけますか。`,
        `${jpKey}について、詳しく伺えますでしょうか。`
      ];
      
      interviewerObjective = followUpPhrases[Math.floor(Math.random() * followUpPhrases.length)];
      // increment question count because we will ask again for this phase
      questionCounts[currentPhaseId] = (questionCounts[currentPhaseId] || 0) + 1;
    }

    // 2) Dramatically improved interviewer response prompt with proper 敬語 context
    const responsePrompt = `あなたは日本の大手企業の人事部で働く、経験豊富で丁寧な面接官です。

【重要な人物設定】
- 10年以上の面接経験を持つプロフェッショナル
- 応募者に対して常に敬意を払い、適切な敬語を使用
- 威圧的ではなく、応募者がリラックスして話せる雰囲気作りを心がける
- 簡潔で自然な日本語を話す

【現在の面接状況】
${readableHistory || '面接が始まったばかりです。'}

【応募者の最新発言】
「${transcript}」

【あなたの次の発言目的】
${interviewerObjective}

【発言作成の重要なルール】
1. **敬語の使用**: 丁寧語（です・ます）と尊敬語を適切に使い分ける
2. **自然性**: 実際の面接官が話すような、自然で流暢な日本語
3. **簡潔性**: 1つの質問を20-30文字程度で簡潔に
4. **配慮**: 応募者にプレッシャーを与えない優しい言い回し
5. **継続性**: 過去の会話を踏まえ、重複を避ける
6. **専門性**: 面接官として適切な質問の仕方

【出力】
面接官としての次の発言を1文だけ作成してください。挨拶や前置きは不要です。質問内容のみを自然な敬語で述べてください。`;

    const responseResult = await model.generateContent([responsePrompt]);
    let responseText = responseResult.response.text().trim();
    
    // Clean up response text - remove quotes, extra formatting
    responseText = responseText.replace(/^["「『]|["」』]$/g, '').trim();
    
    // Generate TTS audio with improved voice settings for Japanese business context
    const ttsRequest = {
      input: { text: responseText },
      voice: { 
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-C', // Professional male voice - good for business context
        ssmlGender: 'MALE' as const
      },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        speakingRate: 0.95, // Slightly slower for clarity and professionalism
        pitch: -1.0, // Slightly lower pitch for authority
        volumeGainDb: 2.0 // Slight volume boost for clarity
      },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    // Update conversation history with new messages
    const updatedHistory = [
      ...history,
      { role: "user", content: transcript },
      { role: "assistant", content: responseText }
    ];

    // Save workflow state to database
    const workflowStateToSave = {
      currentPhaseId,
      questionCounts,
      fulfilled,
      failedPhases,
      finished,
    };

    try {
      await saveWorkflowState(
        effectiveInterviewId,
        workflowStateToSave,
        updatedHistory
      );
    } catch (saveError) {
      console.error("Failed to save workflow state:", saveError);
      // Continue with response even if save fails
    }
    
    // Return transcript, response text, and audio
    return NextResponse.json({
      transcript: transcript,
      userTranscript: transcript, // Add this for frontend compatibility
      text: responseText,
      audio: Buffer.from(ttsResponse.audioContent!).toString('base64'),
      mimeType: 'audio/mp3',
      workflowState: workflowStateToSave,
      interviewCompleted: finished
    });

  } catch (error) {
    console.error("Error in interview conversation:", error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to process conversation: ${error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to process conversation" 
    }, { status: 500 });
  }
}