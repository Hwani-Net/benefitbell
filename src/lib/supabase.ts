import { createClient } from '@supabase/supabase-js'

// Browser client (lazy - only created when env vars are available)
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Legacy export for backward compat (may be null if env vars missing)
export const supabase = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null

// Server-only client (uses service role key - full access, never expose to browser)
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export type PushSubscription = {
  id?: string
  endpoint: string
  p256dh: string
  auth: string
  categories: string[]
  age_group?: string
  region?: string
  created_at?: string
}

export type UserProfile = {
  id?: string
  kakao_id: string
  nickname?: string
  categories: string[]
  age_group?: string
  region?: string
  is_premium?: boolean
  updated_at?: string
}
