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
    
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Step 1: First, get the transcript of the audio
    const transcriptionPrompt = `Please transcribe the following audio in Japanese. Only return the transcription text, nothing else.`;
    
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

    // Workflow definition (normalized from workflow.MD)
    const workflow = [
      {
        id: 'self_intro',
        prompt: 'まずは自己紹介をお願いします。',
        expected_data: ['name', 'education'],
        next_state: 'gakuchika',
      },
      {
        id: 'gakuchika',
        prompt:
          '学生時代に力を入れたこと（ガクチカ）について教えてください。何をしたのか、結果どうだったのかも含めて話してください。',
        expected_data: ['topic', 'actions', 'outcome'],
        next_state: 'strength',
      },
      {
        id: 'strength',
        prompt:
          'あなたの強みについて教えてください。どのような経験を通してその強みを発揮したか、結果どうだったかも教えてください。',
        expected_data: ['strength', 'example', 'outcome'],
        next_state: 'weakness',
      },
      {
        id: 'weakness',
        prompt:
          'あなたの弱みは何だと思いますか？また、その弱みにどう対応しているかも教えてください。',
        expected_data: ['weakness', 'coping_strategy'],
        next_state: 'industry_motivation',
      },
      {
        id: 'industry_motivation',
        prompt:
          'なぜこの業界を志望しているのか教えてください。ご自身の経験やスキルとどう関係しているかも含めて教えてください。',
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
          ? `【候補者】: ${msg.content}`
          : `【面接官】: ${msg.content}`
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

    // 1) Assessor: check which expected fields are answered in transcript/history
    const assessorPrompt = `以下の会話履歴と候補者の最新の発言から、指定されたキーに対応する情報が含まれるか抽出してください。JSONのみを返し、余計な文章は一切書かないでください。

【会話履歴（最新から最大4往復分）】
${readableHistory || '(履歴なし)'}

【抽出するキー】
${(workflow.find(p => p.id === currentPhaseId)!.expected_data).map(k => `- ${k}`).join('\n')}

【出力JSONスキーマ】
{
  "values": { "<key>": "テキスト(見つかった場合)" | null },
  "isComplete": true | false,
  "missing": ["<key>", ...]
}

ルール:
- 厳密にJSONのみを返す
- キーが見つからない場合はnull
- 完了判定は全キーに非null値がある場合のみtrue
`;

    let assessorJson = { values: {} as Record<string, string | null>, isComplete: false, missing: [] as string[] };
    try {
      const assessorRes = await model.generateContent([assessorPrompt]);
      const assessorText = assessorRes.response.text();
      // Robust JSON extraction in case model returns extra text or code fences
      const match = assessorText.match(/\{[\s\S]*\}/);
      const jsonText = match ? match[0] : assessorText;
      assessorJson = JSON.parse(jsonText);
    } catch (_e) {
      // If assessor fails, proceed without updating fulfillment
    }

    // Merge new values into fulfilled state
    const expectedKeys = [
      ...(workflow.find(p => p.id === currentPhaseId)!.expected_data as readonly string[]),
    ];

    // Heuristic extraction for 'name' in Japanese to avoid repeated asking when LLM misses it
    const extractJapaneseName = (text: string): string | null => {
      if (!text) return null;
      const cleaned = text.replace(/\s+/g, ' ').trim();
      // Pattern 1: 「名前は◯◯です/と申します」
      const p1 = /(?:私(?:の)?名前は|名前は)\s*([A-Za-z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF66-\uFF9D・々ー\s]{1,30}?)(?:です|と申します)?[。,.？?！!]?/u;
      const m1 = cleaned.match(p1);
      if (m1 && m1[1]) return m1[1].replace(/\s+/g, '').trim();
      // Pattern 2: 「◯◯と申します」
      const p2 = /([A-Za-z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF66-\uFF9D・々ー\s]{1,30})と申します/u;
      const m2 = cleaned.match(p2);
      if (m2 && m2[1]) return m2[1].replace(/\s+/g, '').trim();
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

    // Compose the interviewer message objective
    const keyLabels: Record<string, string> = {
      name: 'お名前',
      education: '学歴',
      topic: '取り組んだテーマ',
      actions: '具体的な行動',
      outcome: '結果',
      strength: '強み',
      example: '具体例',
      weakness: '弱み',
      coping_strategy: '対応方法',
      motivation: '志望動機',
      connection_to_experience: 'ご経験との関係',
      future_goal: '将来の目標',
    };
    let interviewerObjective = '';
    if (advancePhase) {
      if (nextPhaseId === 'end') {
        finished = true;
        interviewerObjective = '以上で面接を終了いたします。お時間をいただきありがとうございました。最後に何かご質問はありますか？';
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
      interviewerObjective = `先ほどのお話について、${jpKey} について、もう少し具体的に教えていただけますか？`;
      // increment question count because we will ask again for this phase
      questionCounts[currentPhaseId] = (questionCounts[currentPhaseId] || 0) + 1;
    }

    // 2) Generate the interviewer response text concisely and naturally
    const responsePrompt = `あなたは日本企業のプロフェッショナルな面接官です。以下の会話履歴と目的を考慮して、自然で丁寧な日本語の質問を1文で作成してください。

【会話履歴】
${readableHistory || '(面接開始)'}

【重要な指示】
- これは継続中の面接です
- 会話履歴を必ず確認して、既に聞いた内容は繰り返さない
- 「面接を始めましょう」などの開始挨拶は絶対にしない
- 1つの質問のみを簡潔に（10-15文字程度）
- です/ます調で自然な口語表現を使う
- 相手に圧をかけず、配慮のある言い回しにする

【目的】
${interviewerObjective}
`;
    const responseResult = await model.generateContent([responsePrompt]);
    const responseText = responseResult.response.text().trim();
    
    // Generate TTS audio
    const ttsRequest = {
      input: { text: responseText },
      voice: { 
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-C', // Professional male voice
        ssmlGender: 'MALE' as const
      },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0,
        pitch: 0.0
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