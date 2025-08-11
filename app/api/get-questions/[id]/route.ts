import { NextRequest, NextResponse } from 'next/server';
import { getQuestions } from '@/lib/actions/interview.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    const questionsData = await getQuestions(id);
    
    return NextResponse.json(questionsData);

  } catch (error) {
    console.error("Error getting questions:", error);
    return NextResponse.json({ 
      error: "Failed to get questions" 
    }, { status: 500 });
  }
}
