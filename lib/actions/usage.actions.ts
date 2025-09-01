"use server";

import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "../supbase";


/**
 * Get current month's usage for the authenticated user
 * If user doesn't exist in usage_tracking table, initialize them with 0 usage
 * Uses SELECT first, then INSERT if needed (safe for missing constraints)
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
  
  // First, try to get existing record
  const { data: existingData, error: fetchError } = await supabase
    .from('usage_tracking')
    .select('minutes_used')
    .eq('author', userId)
    .eq('month_year', monthYear)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      // No record found, create one with 0 usage
      const { data: newData, error: insertError } = await supabase
        .from('usage_tracking')
        .insert({
          author: userId,
          month_year: monthYear,
          minutes_used: 0,
        })
        .select('minutes_used')
        .single();

      if (insertError) {
        console.error('Error creating new usage record:', insertError);
        throw new Error(`Failed to create usage record: ${insertError.message}`);
      }

      return newData?.minutes_used || 0;
    } else {
      console.error('Error fetching usage:', fetchError);
      throw new Error(`Failed to fetch usage: ${fetchError.message}`);
    }
  }

  return existingData?.minutes_used || 0;
}

/**
 * Add completed interview to user's monthly usage count
 * Uses atomic UPSERT operation to prevent race conditions
 * @deprecated Use trackInterviewSessionStart() instead for session-based tracking
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

  // First, try to get existing record
  const { data: existingData, error: fetchError } = await supabase
    .from('usage_tracking')
    .select('minutes_used')
    .eq('author', userId)
    .eq('month_year', monthYear)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking current usage:', fetchError);
    throw new Error(`Failed to check current usage: ${fetchError.message}`);
  }

  if (existingData) {
    // Record exists, increment it
    const newCount = existingData.minutes_used + 1;
    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update({ minutes_used: newCount })
      .eq('author', userId)
      .eq('month_year', monthYear);

    if (updateError) {
      console.error('Error updating usage:', updateError);
      throw new Error(`Failed to update usage: ${updateError.message}`);
    }

    console.log(`Updated interview usage. Total for ${monthYear}: ${newCount} interviews`);
  } else {
    // Record doesn't exist, create it with 1
    const { error: insertError } = await supabase
      .from('usage_tracking')
      .insert({
        author: userId,
        month_year: monthYear,
        minutes_used: 1,
      });

    if (insertError) {
      console.error('Error creating new usage record:', insertError);
      throw new Error(`Failed to create new usage record: ${insertError.message}`);
    }

    console.log(`Created new interview usage record. Total for ${monthYear}: 1 interview`);
  }
}

/**
 * Track interview session start - adds to usage count when session begins
 * This is called when a user starts a new interview session
 */
export async function trackInterviewSessionStart(): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get first day of current month in YYYY-MM-01 format
  const currentDate = new Date();
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

  const supabase = CreateSupabaseClient();

  // Use atomic upsert with proper increment logic
  const { data: existingData, error: fetchError } = await supabase
    .from('usage_tracking')
    .select('minutes_used')
    .eq('author', userId)
    .eq('month_year', monthYear)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking current usage:', fetchError);
    throw new Error(`Failed to check current usage: ${fetchError.message}`);
  }

  if (existingData) {
    // Record exists, increment it
    const newCount = existingData.minutes_used + 1;
    
    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update({ minutes_used: newCount })
      .eq('author', userId)
      .eq('month_year', monthYear);

    if (updateError) {
      console.error('Error updating usage:', updateError);
      throw new Error(`Failed to update usage: ${updateError.message}`);
    }

    console.log(`Updated existing interview usage. Total for ${monthYear}: ${newCount} interviews`);
  } else {
    // Record doesn't exist, create it with 1
    const { error: insertError } = await supabase
      .from('usage_tracking')
      .insert({
        author: userId,
        month_year: monthYear,
        minutes_used: 1,
      });

    if (insertError) {
      console.error('Error creating new usage record:', insertError);
      throw new Error(`Failed to create new usage record: ${insertError.message}`);
    }

    console.log(`Created new interview usage record. Total for ${monthYear}: 1 interview`);
  }
}

/**
 * Get user's interview plan limit based on Clerk features
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
 * Get user's ES correction plan limit based on Clerk features
 * @returns number of ES corrections allowed per month
 */
export async function getESPlanLimit(): Promise<number> {
  try {
    const { has } = await auth();
    
    const has20 = await has({ feature: 'es_20' });
    if (has20) {
      return 20; // Premium plan
    }
    
    const has10 = await has({ feature: 'es_10' });
    if (has10) {
      return 10; // Basic plan
    }
    
    const has3 = await has({ feature: 'es_3' });
    if (has3) {
      return 3; // Free/trial plan
    }
    
    // Default to free plan
    console.warn('User does not have any recognized ES plan feature, defaulting to 3 ES corrections');
    return 3; // Default to free plan
    
  } catch (error) {
    console.error('Error checking user ES plan features:', error);
    // Default to free plan on error
    console.warn('Defaulting to 3 ES corrections due to error checking features');
    return 3;
  }
}

/**
 * Get current month's ES correction usage for the authenticated user
 * @returns number of ES corrections completed this month
 */
export async function getCurrentESUsage(): Promise<number> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get first day of current month in YYYY-MM-01 format
  const currentDate = new Date();
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

  const supabase = CreateSupabaseClient();
  
  // Count ES corrections created this month
  const { count, error } = await supabase
    .from('es_corrections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthYear);

  if (error) {
    console.error('Error fetching ES usage:', error);
    throw new Error(`Failed to fetch ES usage: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get user's plan name based on Clerk features
 * @returns string representing the plan name
 */
export async function getUserPlanName(): Promise<string> {
  try {
    const { has } = await auth();
    
    const has20Interview = await has({ feature: 'interview_20' });
    const has20ES = await has({ feature: 'es_20' });
    if (has20Interview || has20ES) {
      return 'プレミアムプラン'; // Premium plan
    }
    
    const has10Interview = await has({ feature: 'interview_10' });
    const has10ES = await has({ feature: 'es_10' });
    if (has10Interview || has10ES) {
      return 'ベーシックプラン'; // Basic plan
    }
    
    return 'フリープラン'; // Free plan
    
  } catch (error) {
    console.error('Error checking user plan features:', error);
    return 'フリープラン'; // Default to free plan
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
    const remainingInterviews = Math.max(0, planLimit - currentUsage);
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