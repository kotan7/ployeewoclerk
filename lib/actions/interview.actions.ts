"use server"

import { auth } from "@clerk/nextjs/server"
import { CreateSupabaseClient } from "../supbase"

// Type definition based on the form schema
type CreateInterview = {
  companyName: string;
  role: string;
  jobDescription?: string;
  interviewFocus: "hr" | "case" | "technical" | "final";
  resume?: FileList;
}

async function generateInterviewQuestions({
  companyName,
  role,
  jobDescription,
  interviewFocus,
  resume,
}: {
  companyName: string;
  role: string;
  jobDescription?: string;
  interviewFocus: string;
  resume?: string;
}): Promise<string[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName,
        role,
        jobDescription,
        interviewFocus,
        resume,
      }),
    });

    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error('Error calling question generation API:', error);
    return [
      "まずは簡単に自己紹介をお願いします。",
      "なぜ弊社を志望されたのですか？",
      "この職種を選んだ理由を教えてください。",
      "あなたの強みと弱みを教えてください。",
      "5年後のキャリアビジョンを聞かせてください。"
    ];
  }
}

export const createInterview = async (formData: CreateInterview) => {
    const {userId: author} = await auth()
    
    if (!author) {
        throw new Error("User not authenticated")
    }
    
    // Generate questions using OpenAI
    const questions = await generateInterviewQuestions({
        companyName: formData.companyName,
        role: formData.role,
        jobDescription: formData.jobDescription,
        interviewFocus: formData.interviewFocus,
        resume: formData.resume ? "提出済み" : undefined,
    });

    console.log("Generated questions:", questions);
    
    const supabase = CreateSupabaseClient()
    const {data, error} = await supabase
        .from("interviews")
        .insert({
            ...formData,
            author,
            questions: JSON.stringify(questions) // Explicitly stringify for storage
        })
        .select();

    if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
    }
    
    if (!data) {
        throw new Error("No data returned from database")
    }

    return data[0];
}

export const getUserInterviews = async () => {
    const {userId: author} = await auth()
    
    const supabase = CreateSupabaseClient()
    const {data, error} = await supabase
        .from("interviews")
        .select("*")
        .eq("author", author)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
    }

    return data || [];
}

export const getAllInterviews = async (
    page: number = 1, 
    limit: number = 12, 
    filter?: string, 
    sortBy: string = 'newest'
) => {
    const supabase = CreateSupabaseClient()
    const offset = (page - 1) * limit;
    
    let query = supabase
        .from("interviews")
        .select("*", { count: 'exact' });
    
    // Apply filter
    if (filter && filter !== 'all') {
        query = query.eq('interviewFocus', filter);
    }
    
    // Apply sorting
    switch (sortBy) {
        case 'oldest':
            query = query.order("created_at", { ascending: true });
            break;
        case 'popularity':
            // For now, we'll use creation date as a proxy for popularity
            // In the future, you could add a views or interactions column
            query = query.order("created_at", { ascending: false });
            break;
        case 'newest':
        default:
            query = query.order("created_at", { ascending: false });
            break;
    }
    
    query = query.range(offset, offset + limit - 1);

    const {data, error, count} = await query;

    if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
    }

    return {
        interviews: data || [],
        total: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: offset + limit < (count || 0),
        hasPrevPage: page > 1
    };
}

export const saveTranscript = async (transcript: string, interviewId?: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    if (!transcript) {
        throw new Error("Transcript is required");
    }

    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .insert({
            transcript: transcript,
            user_id: userId,
            interview_id: interviewId,
            created_at: new Date().toISOString()
        })
        .select();

    if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to save transcript: ${error.message}`);
    }

    return {
        success: true,
        sessionId: data[0].id,
        message: "Transcript saved successfully"
    };
}

export const getTranscript = async (interviewId: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select('*')
        .eq('user_id', userId)
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No transcript found
            return null;
        }
        console.error("Database error:", error);
        throw new Error(`Failed to fetch transcript: ${error.message}`);
    }

    return {
        transcript: data.transcript,
        sessionId: data.id,
        createdAt: data.created_at
    };
}

export const getQuestions = async (interviewId: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const supabase = CreateSupabaseClient();

  const { data, error } = await supabase
    .from('interviews')
    .select('questions')
    .eq('id', interviewId)
    .eq('author', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No interview found
      return null;
    }
    console.error("Database error:", error);
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  // Parse the questions if they're stored as JSON string
  let parsedQuestions: string[] = [];
  
  if (data.questions) {
    try {
      // If questions is already an array, use it directly
      if (Array.isArray(data.questions)) {
        parsedQuestions = data.questions;
      } 
      // If questions is a string, try to parse it as JSON
      else if (typeof data.questions === 'string') {
        parsedQuestions = JSON.parse(data.questions);
      }
      else {
        console.error("Unexpected questions format:", typeof data.questions, data.questions);
        // Fallback to default questions
        parsedQuestions = [
          "まずは簡単に自己紹介をお願いします。",
          "なぜ弊社を志望されたのですか？",
          "この職種を選んだ理由を教えてください。",
          "あなたの強みと弱みを教えてください。",
          "5年後のキャリアビジョンを聞かせてください。"
        ];
      }
    } catch (parseError) {
      console.error("Error parsing questions JSON:", parseError);
      console.error("Raw questions data:", data.questions);
      
      // Fallback to default questions if parsing fails
      parsedQuestions = [
        "まずは簡単に自己紹介をお願いします。",
        "なぜ弊社を志望されたのですか？",
        "この職種を選んだ理由を教えてください。",
        "あなたの強みと弱みを教えてください。",
        "5年後のキャリアビジョンを聞かせてください。"
      ];
    }
  }

  console.log("Parsed questions:", parsedQuestions);

  return {
    questions: parsedQuestions,
    interviewId: interviewId
  };
}

export const getFeedback = async (interviewId: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select('feedback, id, created_at')
        .eq('user_id', userId)
        .eq('interview_id', interviewId)
        .not('feedback', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No feedback found
            return null;
        }
        console.error("Database error:", error);
        throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return {
        feedback: data.feedback,
        sessionId: data.id,
        createdAt: data.created_at
    };
}

export const saveFeedback = async (feedback: object, interviewId?: string, sessionId?: string) => {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not authenticated");
    }

    if (!feedback) {
        throw new Error("Feedback is required");
    }

    const supabase = CreateSupabaseClient();
    
    // If sessionId is provided, update existing session_history record
    if (sessionId) {
        const { data, error } = await supabase
            .from('session_history')
            .update({
                feedback: feedback
            })
            .eq('id', sessionId)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error("Database error:", error);
            throw new Error(`Failed to update feedback: ${error.message}`);
        }

        return {
            success: true,
            sessionId: sessionId,
            message: "Feedback updated successfully"
        };
    } else {
        // Create new session_history record with feedback
        const { data, error } = await supabase
            .from('session_history')
            .insert({
                feedback: feedback,
                user_id: userId,
                interview_id: interviewId,
                created_at: new Date().toISOString()
            })
            .select();

        if (error) {
            console.error("Database error:", error);
            throw new Error(`Failed to save feedback: ${error.message}`);
        }

        return {
            success: true,
            sessionId: data[0].id,
            message: "Feedback saved successfully"
        };
    }
}