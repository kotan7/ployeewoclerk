import { NextRequest, NextResponse } from 'next/server';
import { getFeedback } from '@/lib/actions/interview.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    // Check if feedback exists for this interview
    try {
      const feedbackData = await getFeedback(id);
      
      // If feedback exists and has content, it's ready
      const feedbackReady = !!(feedbackData?.feedback || feedbackData?.overallFeedback);
      
      return NextResponse.json({ 
        feedbackReady,
        hasFeedback: !!feedbackData
      });
    } catch (error) {
      // If getFeedback throws an error, it likely means no feedback exists yet
      return NextResponse.json({ 
        feedbackReady: false,
        hasFeedback: false
      });
    }

  } catch (error) {
    console.error("Error checking feedback status:", error);
    return NextResponse.json({ 
      error: "Failed to check feedback status" 
    }, { status: 500 });
  }
}
