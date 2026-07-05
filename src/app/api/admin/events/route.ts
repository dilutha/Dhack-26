import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';
import {
  handleAPIError,
  createSuccessResponse,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
} from '@/lib/errorHandler';
import { cache, CacheKeys } from '@/lib/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

async function assertAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : undefined;
    if (!token) return false;

    if (!supabaseUrl || !anonKey) return false;

    // Validate Supabase session token and resolve user email
    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    });
    const {
      data: { user },
    } = await client.auth.getUser(token);
    const email = user?.email;
    if (!email) return false;

    // Check admin permissions via service role
    const adminClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );
    const { data: admins } = await adminClient
      .from('admins')
      .select('email')
      .eq('email', email)
      .limit(1);
    return !!(admins && admins.length > 0);
  } catch {
    return false;
  }
}

function validate(body: any) {
  const errors: string[] = [];
  const name = (body?.name ?? '').toString().trim();
  if (!name) errors.push('name is required');

  const category = body?.category;
  const type = body?.type;
  const start_at = body?.start_at;
  const end_at = body?.end_at;

  const allowedCategories = ['innovation', 'rebrand'];
  const allowedTypes = [
    'registration',
    'proposal',
    'wireframe',
    'final',
    'judging',
    'ceremony',
    'workshop',
    'awareness',
    'announcement',
    'meeting',
    'other',
  ];

  if (!category || !allowedCategories.includes(category))
    errors.push('invalid category');
  if (!type || !allowedTypes.includes(type)) errors.push('invalid type');

  const start = new Date(start_at);
  const end = new Date(end_at);
  if (!start_at || !end_at || isNaN(start.getTime()) || isNaN(end.getTime()))
    errors.push('invalid dates');
  if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end)
    errors.push('end_at must be after start_at');

  return { ok: errors.length === 0, errors };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || '';
    const rl = rateLimit('admin_events_GET', ip, {
      windowMs: 60 * 1000,
      max: 60,
    });
    if (!rl.allowed) {
      throw new AuthorizationError('Too many requests');
    }

    if (!(await assertAdmin(request))) {
      throw new AuthorizationError('Admin access required');
    }

    // Check cache first
    const cacheKey = CacheKeys.events();
    const cached = cache.get(cacheKey);
    if (cached) {
      return createSuccessResponse(cached);
    }

    const { data, error } = await supabaseServer
      .from('events')
      .select('*')
      .order('start_at');

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Cache the result for 5 minutes
    cache.set(cacheKey, data || [], 5 * 60 * 1000);

    return createSuccessResponse(data || []);
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || '';
    const rl = rateLimit('admin_events_POST', ip, {
      windowMs: 60 * 1000,
      max: 10,
    });
    if (!rl.allowed) {
      throw new AuthorizationError('Too many requests');
    }

    if (!(await assertAdmin(request))) {
      throw new AuthorizationError('Admin access required');
    }

    const body = await request.json();
    const validation = validate(body);
    if (!validation.ok) {
      throw new ValidationError('Invalid event data', validation.errors);
    }

    const { data, error } = await supabaseServer
      .from('events')
      .insert([body])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    // Invalidate events cache
    cache.delete(CacheKeys.events());

    return createSuccessResponse(data);
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || '';
    const rl = rateLimit('admin_events_PUT', ip, {
      windowMs: 60 * 1000,
      max: 10,
    });
    if (!rl.allowed) {
      throw new AuthorizationError('Too many requests');
    }

    if (!(await assertAdmin(request))) {
      throw new AuthorizationError('Admin access required');
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      throw new ValidationError('Event ID is required for updates');
    }

    const validation = validate(updateData);
    if (!validation.ok) {
      throw new ValidationError('Invalid event data', validation.errors);
    }

    const { data, error } = await supabaseServer
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    // Invalidate events cache
    cache.delete(CacheKeys.events());

    return createSuccessResponse(data);
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || '';
    const rl = rateLimit('admin_events_DELETE', ip, {
      windowMs: 60 * 1000,
      max: 10,
    });
    if (!rl.allowed) {
      throw new AuthorizationError('Too many requests');
    }

    if (!(await assertAdmin(request))) {
      throw new AuthorizationError('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ValidationError('Event ID is required for deletion');
    }

    const { error } = await supabaseServer.from('events').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }

    // Invalidate events cache
    cache.delete(CacheKeys.events());

    return createSuccessResponse({ message: 'Event deleted successfully' });
  } catch (error) {
    return handleAPIError(error);
  }
}
