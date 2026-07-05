import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limit magic link requests
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || '';
    const rl = rateLimit('admin_magic_link_POST', ip, {
      windowMs: 15 * 60 * 1000,
      max: 10,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // First, check if the email is in the admins table
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: admins, error: adminError } = await adminClient
      .from('admins')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 500 });
    }

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized email address' },
        { status: 403 }
      );
    }

    // If admin email, send magic link
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // Build redirect base - prioritize production URL for Vercel deployments
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // In production, don't trust NEXT_PUBLIC_BASE_URL if it contains localhost
    if (
      process.env.NODE_ENV === 'production' &&
      baseUrl?.includes('localhost')
    ) {
      baseUrl = undefined;
    }

    if (!baseUrl) {
      // For Vercel deployments, use the deployment URL
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        // Use request host header for most reliable production URL
        const host = request.headers.get('host');
        if (host) {
          baseUrl = `https://${host.trim()}`;
        } else {
          // Final fallback
          baseUrl = `https://${new URL(request.url).host}`;
        }
      }
    }
    // Sanitize baseUrl: trim whitespace and remove trailing slash
    baseUrl = (baseUrl || '').trim().replace(/\/$/, '');

    // Use auth callback page to ensure maintenance doesn't block and hash is preserved
    // Redirect straight to /admin so Supabase appends the hash there
    let redirectTo = `${baseUrl}/admin`;
    redirectTo = encodeURI(redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Magic link sent successfully' });
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
