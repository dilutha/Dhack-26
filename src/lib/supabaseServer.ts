import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl =
  rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
    ? rawSupabaseUrl
    : rawSupabaseUrl
      ? `https://${rawSupabaseUrl}`
      : undefined;

// In production builds, avoid noisy warnings if env vars are injected at runtime

// Create a mock client when environment variables are missing
const createMockClient = () => ({
  rpc: () =>
    Promise.resolve({
      data: null,
      error: { message: 'Supabase not configured' },
    }),
  from: () => {
    const response = Promise.resolve({
      data: null,
      error: { message: 'Supabase not configured' },
    });
    const chain: any = {
      select: () => chain,
      insert: () => chain,
      update: () => chain,
      upsert: () => chain,
      eq: () => chain,
      ilike: () => chain,
      order: () => chain,
      limit: () => chain,
      single: () => response,
      maybeSingle: () => response,
      then: response.then.bind(response),
      catch: response.catch.bind(response),
    };
    return chain;
  },
});

export const supabaseServer =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : (createMockClient() as any);
