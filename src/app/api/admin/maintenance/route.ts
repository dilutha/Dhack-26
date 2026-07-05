import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getPlatformSettings } from '@/lib/platformConfig';
import { createClient } from '@supabase/supabase-js';

// Simple admin authentication - in production, use proper authentication
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dhack-admin-2026';

async function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.substring(7);
  if (token === ADMIN_TOKEN) return true;

  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseUrl =
    rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
      ? rawSupabaseUrl
      : rawSupabaseUrl
        ? `https://${rawSupabaseUrl}`
        : '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!supabaseUrl || !anonKey || !serviceKey) return false;

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await client.auth.getUser(token);
  if (!user?.email) return false;

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: admins } = await adminClient
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .limit(1);
  return !!(admins && admins.length > 0);
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled, message, estimatedReturn } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled must be a boolean' },
        { status: 400 }
      );
    }

    const updates = [
      { key: 'maintenance_mode', value: enabled },
      ...(typeof message === 'string'
        ? [{ key: 'maintenance_message', value: message }]
        : []),
      ...(typeof estimatedReturn === 'string'
        ? [{ key: 'maintenance_estimated_return', value: estimatedReturn }]
        : []),
    ];

    const { error } = await supabaseServer.from('settings').upsert(updates, {
      onConflict: 'key',
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      enabled,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin maintenance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Count all bypass codes (both formats)
  let bypassCodesCount =
    process.env.MAINTENANCE_BYPASS_CODES?.split(',').length || 0;
  if (process.env.MAINTENANCE_BYPASS_CODE) bypassCodesCount++;
  if (process.env.NEXT_PUBLIC_MAINTENANCE_BYPASS_CODE) bypassCodesCount++;

  const settings = await getPlatformSettings();

  return NextResponse.json({
    enabled:
      process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' ||
      settings.maintenanceMode,
    message: settings.maintenanceMessage,
    estimatedReturn: settings.maintenanceEstimatedReturn,
    bypassToken: process.env.MAINTENANCE_BYPASS_TOKEN,
    bypassCodesCount,
  });
}
