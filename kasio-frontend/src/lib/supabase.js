import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Kasio: Supabase URL atau Anon Key belum disetel di file .env. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY telah diisi.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)