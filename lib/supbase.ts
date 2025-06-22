import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

export const CreateSupabaseClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            async accessToken() {
                // get the current user's authentication data
                //.getToken() extracts the JWT token from Clerk's auth data
                return ((await auth()).getToken());
            }
        }
    )
}

{/*
User signs in with Clerk (email/password)
Clerk creates a JWT token for that user
Your app calls this function when it needs to talk to Supabase
Supabase asks for authentication ("Who are you?")
This function provides Clerk's token to Supabase
Supabase recognizes the user and allows access to their data
*/}