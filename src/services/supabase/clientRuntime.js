import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_FY_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_FY_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      'Missing Supabase env vars: VITE_FY_SUPABASE_URL / VITE_FY_SUPABASE_ANON_KEY or VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY',
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}
