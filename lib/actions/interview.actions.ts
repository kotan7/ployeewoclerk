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
    
    const supabase = CreateSupabaseClient()
    const {data, error} = await supabase
        .from("interviews")
        .insert({
            ...formData,
            author,
            questions: questions // Store the generated questions
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
