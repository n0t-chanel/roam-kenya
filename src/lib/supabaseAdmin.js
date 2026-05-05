import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client - Only use this server-side or in protected backend routes
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase service role key not configured. Admin operations will not be available.')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
