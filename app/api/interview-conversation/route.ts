import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

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

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

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
    
    // Step 2: Now use the transcript to generate a response with full context
    // Parse context and create readable conversation history
    const contextObj = JSON.parse(conversationContext || '{}');
    const history = contextObj.history || [];
    
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
    
    const responsePrompt = `${systemPrompt}

## これまでの会話履歴（必ず参照してください）:
${readableHistory}

## 候補者の最新の発言:
"${transcript}"

## 重要な指示:
1. 上記の会話履歴を必ず参照して、候補者が既に答えた内容を把握してください
2. 候補者が既に答えた内容について質問しないでください
3. 1回の応答で1つの質問のみをしてください（複数の質問は避ける）
4. 回答は簡潔にしてください（2-3文程度）
5. 候補者の回答が浅い場合は、1つの深掘り質問をしてください
6. 面接の段階に応じて次の質問に進んでください

面接官として簡潔に応答してください。`;
    
    const responseResult = await model.generateContent([responsePrompt]);
    const responseText = responseResult.response.text();
    
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
    
    // Return transcript, response text, and audio
    return NextResponse.json({
      transcript: transcript,
      userTranscript: transcript, // Add this for frontend compatibility
      text: responseText,
      audio: Buffer.from(ttsResponse.audioContent!).toString('base64'),
      mimeType: 'audio/mp3'
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