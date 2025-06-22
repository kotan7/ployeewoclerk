"use server"

import { auth } from "@clerk/nextjs/server"
import { CreateSupabaseClient } from "../supbase"

// Type definition based on the form schema
type CreateInterview = {
  companyName: string;
  role: string;
  jobDescription?: string;
  interviewFocus: "general" | "technical" | "product" | "leadership" | "custom";
  resume?: FileList;
}

export const createInterview = async (formData: CreateInterview) => {
    const {userId: author} = await auth()
    
    if (!author) {
        throw new Error("User not authenticated")
    }
    
    const supabase = CreateSupabaseClient()
    const {data, error} = await supabase
        .from("interviews")
        .insert({...formData, author})
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
