import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  addSecurityHeaders,
  sanitizeHeaders,
  validateOrigin,
} from '@/lib/security';

async function getDatabaseMaintenanceMode() {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') return true;

  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl =
    rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
      ? rawSupabaseUrl
      : rawSupabaseUrl
        ? `https://${rawSupabaseUrl}`
        : undefined;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return false;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/settings?key=eq.maintenance_mode&select=value`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        cache: 'no-store',
      }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    const value = rows?.[0]?.value;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Sanitize headers
  const sanitizedRequest = sanitizeHeaders(request);

  // Validate origin for API routes
  if (sanitizedRequest.nextUrl.pathname.startsWith('/api/')) {
    if (!validateOrigin(sanitizedRequest)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
  }

  // Check if maintenance mode is enabled
  const maintenanceMode = await getDatabaseMaintenanceMode();

  if (!maintenanceMode) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow access to maintenance page itself
  if (sanitizedRequest.nextUrl.pathname === '/maintenance') {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow access to API routes for maintenance bypass
  if (sanitizedRequest.nextUrl.pathname.startsWith('/api/maintenance-bypass')) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow access to admin routes (for enabling/disabling maintenance)
  if (sanitizedRequest.nextUrl.pathname.startsWith('/api/admin/maintenance')) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow access to admin pages (for magic link login)
  if (
    sanitizedRequest.nextUrl.pathname === '/admin' ||
    sanitizedRequest.nextUrl.pathname.startsWith('/admin/')
  ) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Allow auth callback page to process Supabase hash without being redirected
  if (
    sanitizedRequest.nextUrl.pathname === '/auth/callback' ||
    sanitizedRequest.nextUrl.pathname.startsWith('/auth/callback')
  ) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Check for bypass cookie
  const bypassCookie = sanitizedRequest.cookies.get('maintenance_bypass');
  if (bypassCookie?.value === 'true') {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Check for bypass token in URL (for direct links)
  const url = sanitizedRequest.nextUrl;
  const bypassToken = url.searchParams.get('bypass');
  if (bypassToken && bypassToken === process.env.MAINTENANCE_BYPASS_TOKEN) {
    // Set bypass cookie and redirect to clean URL
    const response = NextResponse.redirect(url.origin + url.pathname);
    response.cookies.set('maintenance_bypass', 'true', {
      path: '/',
      maxAge: 86400, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return addSecurityHeaders(response);
  }

  // Redirect to maintenance page
  const response = NextResponse.redirect(
    new URL('/maintenance', sanitizedRequest.url)
  );
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    // Exclude all Next.js internal assets and static files
    '/((?!api|_next/|favicon.ico|.*\\.).*)',
  ],
};
