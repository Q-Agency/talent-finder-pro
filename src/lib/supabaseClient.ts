import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when both URL and anon key are set (required for sign-in). */
export function isSupabaseConfigured(): boolean {
  return Boolean(url?.trim() && anonKey?.trim());
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** User-facing message when URL/anon key are missing (no secrets). */
export function getSupabaseSetupUserMessage(isDev: boolean): string {
  if (isSupabaseConfigured()) return '';
  if (isDev) {
    return 'Sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local — see .env.example.';
  }
  return 'This deployment is missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting environment and redeploy.';
}
