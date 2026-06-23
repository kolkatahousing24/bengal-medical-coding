import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Supabase Browser Client (Client-side)
 * Uses the anon key - respects RLS policies
 * Use this in React components for client-side data access
 * 
 * IMPORTANT: This client respects Row Level Security (RLS) policies
 * Make sure to set up RLS policies in Supabase dashboard
 */
export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}
