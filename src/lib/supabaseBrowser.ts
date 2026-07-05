'use client';

import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as
  | string
  | undefined;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabaseUrl =
  rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
    ? rawSupabaseUrl
    : rawSupabaseUrl
      ? `https://${rawSupabaseUrl}`
      : undefined;

const browserSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const browserSupabaseAnonKey = anonKey || 'placeholder-anon-key';

export const supabase = createClient(browserSupabaseUrl, browserSupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
