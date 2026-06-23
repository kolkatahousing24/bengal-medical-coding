import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

let _admin: SupabaseClient | null = null

/**
 * Supabase Admin Client (Server-side only)
 * Uses the service role key - bypasses RLS policies
 * Use this in API routes and server actions
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _admin
}

export const supabaseAdmin = getSupabaseAdmin()
