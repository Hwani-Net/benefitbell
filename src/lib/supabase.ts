import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client (uses anon key - safe for client side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-only client (uses service role key - full access, never expose to browser)
export function createServiceClient() {
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
