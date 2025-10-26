import { createClient } from '@supabase/supabase-js'
import type { Database } from '@shared/types/supabase'

// Supabase client configuration
export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

// Create Supabase client with proper typing
export function createSupabaseClient(config: SupabaseConfig) {
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

// Create Supabase admin client (for server-side operations)
export function createSupabaseAdminClient(config: SupabaseConfig) {
  if (!config.serviceRoleKey) {
    throw new Error('Service role key is required for admin client')
  }
  
  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Default client configuration
export const defaultSupabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}
