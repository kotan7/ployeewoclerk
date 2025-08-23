"use server";

import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "../supbase";


/**
 * Get current month's usage for the authenticated user
 * If user doesn't exist in usage_tracking table, initialize them with 0 usage
 * @returns number of interviews completed this month
 */
export async function getCurrentUsage(): Promise<number> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get first day of current month in YYYY-MM-01 format
  const currentDate = new Date();
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

  const supabase = CreateSupabaseClient();
  const { data, error } = await supabase
    .from('usage_tracking')
    .select('minutes_used')
    .eq('author', userId)
    .eq('month_year', monthYear)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found - this is a new user/month, initialize them in the table
      const { error: insertError } = await supabase
        .from('usage_tracking')
        .insert({
          author: userId,
          month_year: monthYear,
          minutes_used: 0, // Store interview count in minutes_used column
        });

      if (insertError) {
        console.error('Error initializing user in usage_tracking:', insertError);
        throw new Error(`Failed to initialize user usage: ${insertError.message}`);
      }
      return 0; // Return 0 interviews for newly initialized user
    } else {
      console.error('Error fetching current usage:', error);
      throw new Error(`Failed to fetch usage: ${error.message}`);
    }
  }

  return data?.minutes_used || 0; // This now represents interview count
}

/**
 * Add completed interview to user's monthly usage count
 */
export async function addInterviewUsage(): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get first day of current month in YYYY-MM-01 format
  const currentDate = new Date();
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

  const supabase = CreateSupabaseClient();

  // Check if record exists for this month and get current usage
  const { data: existingRecord, error: fetchError } = await supabase
    .from('usage_tracking')
    .select('minutes_used')
    .eq('author', userId)
    .eq('month_year', monthYear)
    .single();

  let error;
  if (existingRecord) {
    // Update existing record - increment interview count by 1
    const newInterviewCount = existingRecord.minutes_used + 1;
    const result = await supabase
      .from('usage_tracking')
      .update({
        minutes_used: newInterviewCount, // Store interview count in minutes_used column
      })
      .eq('author', userId)
      .eq('month_year', monthYear);
    error = result.error;
    
    console.log(`Added 1 interview to usage. Total for ${monthYear}: ${newInterviewCount} interviews`);
  } else if (fetchError?.code === 'PGRST116') {
    // Insert new record (user doesn't exist in table yet)
    const result = await supabase
      .from('usage_tracking')
      .insert({
        author: userId,
        month_year: monthYear,
        minutes_used: 1, // Start with 1 interview completed
      });
    error = result.error;
    
    console.log(`Initialized new user and added 1 interview. Total for ${monthYear}: 1 interview`);
  } else {
    // Some other error occurred during fetch
    console.error('Error fetching existing usage record:', fetchError);
    throw new Error(`Failed to fetch existing usage: ${fetchError?.message}`);
  }

  if (error) {
    console.error('Error updating usage:', error);
    throw new Error(`Failed to update usage: ${error.message}`);
  }
}

/**
 * Get user's plan limit based on Clerk features
 * @returns number of interviews allowed per month
 */
export async function getUserPlanLimit(): Promise<number> {
  try {
    const { has } = await auth();
    
    const has20 = await has({ feature: 'interview_20' });
    if (has20) {
      return 20; // Premium plan
    }
    
    const has10 = await has({ feature: 'interview_10' });
    if (has10) {
      return 10; // Basic plan
    }
    
    const has1 = await has({ feature: 'interview_1' });
    if (has1) {
      return 1; // Free/trial plan
    }
    
    // Instead of throwing an error, default to free plan
    console.warn('User does not have any recognized plan feature, defaulting to 1 interview');
    return 1; // Default to free plan instead of throwing error
    
  } catch (error) {
    console.error('Error checking user plan features:', error);
    // Default to free plan on error instead of throwing
    console.warn('Defaulting to 1 interview due to error checking features');
    return 1;
  }
}

/**
 * Check if user can start a new session (pre-session check)
 * @returns object with canStart boolean and current usage info
 */
export async function canStartSession(): Promise<{
  canStart: boolean;
  currentUsage: number;
  planLimit: number;
  remainingInterviews: number;
}> {
  try {
    const currentUsage = await getCurrentUsage();
    const planLimit = await getUserPlanLimit();
    const remainingInterviews = planLimit - currentUsage;
    // User can start if they have interviews remaining
    const canStart = remainingInterviews > 0;
    
    return {
      canStart,
      currentUsage,
      planLimit,
      remainingInterviews
    };
  } catch (error) {
    console.error('Error in canStartSession:', error);
    // Instead of throwing, return safe defaults that allow access
    return {
      canStart: true,
      currentUsage: 0,
      planLimit: 1,
      remainingInterviews: 1
    };
  }
}