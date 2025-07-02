"use server";

import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "../supbase";
import { checkUsageLimitExceeded } from "../utils";

/**
 * Get current month's usage for the authenticated user
 * @returns number of minutes used this month
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

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows found, which is fine for new users/months
    console.error('Error fetching current usage:', error);
    throw new Error(`Failed to fetch usage: ${error.message}`);
  }

  return data?.minutes_used || 0;
}

/**
 * Add session minutes to user's monthly usage
 * @param sessionMinutes - number of minutes from the completed session
 */
export async function addSessionUsage(sessionMinutes: number): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (sessionMinutes <= 0) {
    console.log('No usage to add - session was 0 minutes');
    return;
  }

  // Get first day of current month in YYYY-MM-01 format
  const currentDate = new Date();
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

  const supabase = CreateSupabaseClient();

  // Get current usage for this month
  const currentUsage = await getCurrentUsage();
  const newTotalUsage = currentUsage + sessionMinutes;

  // Check if record exists for this month
  const { data: existingRecord } = await supabase
    .from('usage_tracking')
    .select('id')
    .eq('author', userId)
    .eq('month_year', monthYear)
    .single();

  let error;
  if (existingRecord) {
    // Update existing record
    const result = await supabase
      .from('usage_tracking')
      .update({
        minutes_used: newTotalUsage,
      })
      .eq('author', userId)
      .eq('month_year', monthYear);
    error = result.error;
  } else {
    // Insert new record
    const result = await supabase
      .from('usage_tracking')
      .insert({
        author: userId,
        month_year: monthYear,
        minutes_used: newTotalUsage,
      });
    error = result.error;
  }

  if (error) {
    console.error('Error updating usage:', error);
    throw new Error(`Failed to update usage: ${error.message}`);
  }

  console.log(`Added ${sessionMinutes} minutes to usage. Total for ${monthYear}: ${newTotalUsage} minutes`);
}

/**
 * Get user's plan limit based on Clerk features
 * @returns number of minutes allowed per month
 */
export async function getUserPlanLimit(): Promise<number> {
  const { has } = await auth();
  
  if (await has({ feature: '150min_interview_credit' })) {
    return 150; // Premium plan
  }
  
  if (await has({ feature: '60min_interview_credit' })) {
    return 60; // Basic plan
  }
  
  if (await has({ feature: '3min_interview_credit' })) {
    return 3; // Free/trial plan
  }
  
  // This shouldn't happen based on requirements, but adding as fallback
  throw new Error('User does not have any recognized plan feature');
}



/**
 * Check if user can start a new session (pre-session check)
 * @returns object with canStart boolean and current usage info
 */
export async function canStartSession(): Promise<{
  canStart: boolean;
  currentUsage: number;
  planLimit: number;
  remainingMinutes: number;
}> {
  const currentUsage = await getCurrentUsage();
  const planLimit = await getUserPlanLimit();
  const canStart = !checkUsageLimitExceeded(currentUsage, planLimit);
  const remainingMinutes = Math.max(0, planLimit - currentUsage);
  
  return {
    canStart,
    currentUsage,
    planLimit,
    remainingMinutes
  };
}

 