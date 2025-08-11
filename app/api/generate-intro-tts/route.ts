import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Configure runtime for Vercel
export const runtime = 'nodejs';

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
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Generate TTS audio using the same settings as interview conversation
    const ttsRequest = {
      input: { text },
      voice: { 
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-C', // Professional male voice (same as interview)
        ssmlGender: 'MALE' as const
      },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0,
        pitch: 0.0
      },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    // Return audio data
    return NextResponse.json({
      audio: Buffer.from(ttsResponse.audioContent!).toString('base64'),
      mimeType: 'audio/mp3',
    });

  } catch (error) {
    console.error("Error in generate-intro-tts route:", error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to generate TTS: ${error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to generate TTS" 
    }, { status: 500 });
  }
}
