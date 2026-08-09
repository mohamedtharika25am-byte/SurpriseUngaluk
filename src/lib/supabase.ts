import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access env vars directly so Vite static bundler replaces them at build time
const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) || {};
const procEnv = (typeof process !== 'undefined' ? process.env : {}) || {};

const rawUrl =
  (metaEnv.VITE_SUPABASE_URL as string) ||
  (metaEnv.NEXT_PUBLIC_SUPABASE_URL as string) ||
  (procEnv.VITE_SUPABASE_URL as string) ||
  (procEnv.SUPABASE_URL as string) ||
  (procEnv.NEXT_PUBLIC_SUPABASE_URL as string) ||
  '';

const rawKey =
  (metaEnv.VITE_SUPABASE_ANON_KEY as string) ||
  (metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  (procEnv.VITE_SUPABASE_ANON_KEY as string) ||
  (procEnv.SUPABASE_ANON_KEY as string) ||
  (procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  '';

export const supabaseUrl = rawUrl.trim();
export const supabaseAnonKey = rawKey.trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_project_url_here' &&
    !supabaseUrl.includes('your_supabase')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
