import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: Request) {
  try {
    if (!(await assertAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get regular results
    const { data: regularResults, error: regularError } = await supabaseServer
      .from('results')
      .select('*')
      .order('team_id');

    if (regularError) {
      return NextResponse.json(
        { error: regularError.message },
        { status: 500 }
      );
    }

    // Get BIS results
    const { data: bisResults, error: bisError } = await supabaseServer
      .from('usj_bis_results')
      .select('*')
      .order('bis_id');

    if (bisError) {
      return NextResponse.json({ error: bisError.message }, { status: 500 });
    }

    // Combine results and format consistently
    const allResults = [
      ...(regularResults || []).map((result: any) => ({
        ...result,
        type: 'regular',
      })),
      ...(bisResults || []).map((result: any) => ({
        ...result,
        team_id: result.bis_id, // Map bis_id to team_id for consistency
        type: 'bis',
      })),
    ];

    // Ensure all submissions (regular and BIS) appear as pending results if not present
    try {
      // Fetch round submissions (regular)
      const { data: regularSubs } = await supabaseServer
        .from('round_submissions')
        .select('team_id, round_id, updated_at, created_at');

      const { data: bisSubs } = await supabaseServer
        .from('usj_bis_round_submissions')
        .select('bis_id, round_id, updated_at, created_at');

      // Build a set of existing result keys to avoid duplicates
      const existingKeys = new Set(
        allResults.map(r => `${r.team_id}::${r.round_id}`)
      );

      // Helper to choose a timestamp
      const pickTs = (row: any) =>
        row?.updated_at || row?.created_at || new Date().toISOString();

      // Add synthetic pending results for regular submissions
      (regularSubs || []).forEach((s: any) => {
        const key = `${s.team_id}::${s.round_id}`;
        if (!existingKeys.has(key)) {
          allResults.push({
            result_id: `sub-${s.team_id}-${s.round_id}`,
            team_id: s.team_id,
            round_id: s.round_id,
            status: 'pending',
            updated_at: pickTs(s),
            type: 'regular',
          } as any);
          existingKeys.add(key);
        }
      });

      // Add synthetic pending results for BIS submissions
      (bisSubs || []).forEach((s: any) => {
        const teamId = s.bis_id;
        const key = `${teamId}::${s.round_id}`;
        if (!existingKeys.has(key)) {
          allResults.push({
            result_id: `sub-${teamId}-${s.round_id}`,
            team_id: teamId,
            round_id: s.round_id,
            status: 'pending',
            updated_at: pickTs(s),
            type: 'bis',
          } as any);
          existingKeys.add(key);
        }
      });
    } catch (e) {
      // Ignore submission aggregation failures and still return existing results
    }

    return NextResponse.json({ data: allResults });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
