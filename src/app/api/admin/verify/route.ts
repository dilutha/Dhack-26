import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getUserFromAuthHeader(request: NextRequest) {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseUrl =
    rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
      ? rawSupabaseUrl
      : rawSupabaseUrl
        ? `https://${rawSupabaseUrl}`
        : '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !anonKey) return null;

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : undefined;
  if (!token) return null;

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await client.auth.getUser(token);
  return user || null;
}

async function ensureAdminInDev(userEmail: string | null) {
  if (!userEmail) return false;
  if (process.env.NODE_ENV === 'production') return false;

  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseUrl =
    rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
      ? rawSupabaseUrl
      : rawSupabaseUrl
        ? `https://${rawSupabaseUrl}`
        : '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!supabaseUrl || !serviceKey) return false;

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Insert if not exists (idempotent)
  await adminClient
    .from('admins')
    .upsert({ email: userEmail }, { onConflict: 'email' });
  return true;
}

async function isAdmin(userEmail: string | null) {
  if (!userEmail) return false;

  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseUrl =
    rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
      ? rawSupabaseUrl
      : rawSupabaseUrl
        ? `https://${rawSupabaseUrl}`
        : '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!supabaseUrl || !serviceKey) return false;

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: admins } = await adminClient
    .from('admins')
    .select('email')
    .eq('email', userEmail)
    .limit(1);
  return !!(admins && admins.length > 0);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromAuthHeader(request);
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In development, auto-provision as admin to avoid local lockouts
    if (process.env.NODE_ENV !== 'production') {
      await ensureAdminInDev(user.email);
    }

    const ok = await isAdmin(user.email);
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ ok: true, email: user.email });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
