import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';

const updateResultSchema = z.object({
  team_id: z.string(),
  round_id: z.number(),
  status: z.enum(['passed', 'failed', 'pending']),
  type: z.enum(['regular', 'bis']).optional().default('regular'),
});

async function assertAdmin(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !anonKey) return false;

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : undefined;
  if (!token) return false;

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await client.auth.getUser(token);
  if (!user?.email) return false;

  const adminClient = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } }
  );
  const { data: admins } = await adminClient
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .limit(1);
  return !!(admins && admins.length > 0);
}

export async function PATCH(req: NextRequest) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || '';
    const rl = rateLimit('admin_results_PATCH', ip, {
      windowMs: 60 * 1000,
      max: 30,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    if (!(await assertAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateResultSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { team_id, round_id, status, type } = parsed.data;

    // Update the appropriate results table based on type
    let data, error;

    if (type === 'bis') {
      // Update BIS results table
      ({ data, error } = await supabaseServer
        .from('usj_bis_results')
        .upsert(
          {
            bis_id: team_id,
            round_id,
            status,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'bis_id,round_id',
          }
        )
        .select());
    } else {
      // Update regular results table
      ({ data, error } = await supabaseServer
        .from('results')
        .upsert(
          {
            team_id,
            round_id,
            status,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'team_id,round_id',
          }
        )
        .select());
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: `Result updated to ${status} for ${team_id} Round ${round_id}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update result' },
      { status: 500 }
    );
  }
}
