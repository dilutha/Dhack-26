import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const schema = z.object({
  registration_number: z.string().min(3),
  category: z.enum(['innovation', 'rebrand']),
  round_id: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { category, round_id } = parsed.data;
    const registration_number = parsed.data.registration_number.toUpperCase();

    // Enforce category-specific registration format and check existence
    let isBisRegistration = /^DHBIS\d{3}$/.test(registration_number);
    if (category === 'rebrand') {
      if (!isBisRegistration) {
        return NextResponse.json(
          {
            hasAccess: false,
            error: 'ReBrand requires DHBIS### BIS registration.',
            teamName: null,
          },
          { status: 200 }
        );
      }
    } else {
      const isCommon = /^DH\d{3}$/.test(registration_number);
      if (!isCommon) {
        return NextResponse.json(
          {
            hasAccess: false,
            error: 'Innovation requires DH### team IDs.',
            teamName: null,
          },
          { status: 200 }
        );
      }
      // lock to non-BIS
      isBisRegistration = false;
    }
    let teamExists = false;
    let teamName = '';

    if (category === 'rebrand' || isBisRegistration) {
      const { data: bisData } = await supabaseServer
        .from('usj_bis_registrations')
        .select('bis_id, team_name')
        .eq('bis_id', registration_number)
        .maybeSingle();

      if (bisData) {
        teamExists = true;
        teamName = bisData.team_name;
      }
    } else {
      const { data: teamData } = await supabaseServer
        .from('teams')
        .select('team_id, team_name')
        .eq('team_id', registration_number)
        .maybeSingle();

      if (teamData) {
        teamExists = true;
        teamName = teamData.team_name;
      }
    }

    if (!teamExists) {
      return NextResponse.json(
        {
          hasAccess: false,
          error: 'Team not found or not registered',
          teamName: null,
        },
        { status: 200 }
      );
    }

    // Check if team has passed previous rounds
    if (round_id > 1) {
      for (let r = 1; r < round_id; r++) {
        let hasPassed = false;

        // Check regular results table
        const regularRes = await supabaseServer
          .from('results')
          .select('*')
          .eq('team_id', registration_number)
          .eq('round_id', r)
          .maybeSingle();

        if (regularRes.data && (regularRes.data as any).status === 'passed') {
          hasPassed = true;
        }

        // If not found in regular results, check BIS results for BIS registrations
        if (!hasPassed && (category === 'rebrand' || isBisRegistration)) {
          const bisRes = await supabaseServer
            .from('usj_bis_results')
            .select('*')
            .eq('bis_id', registration_number)
            .eq('round_id', r)
            .maybeSingle();

          if (bisRes.data && (bisRes.data as any).status === 'passed') {
            hasPassed = true;
          }
        }

        if (!hasPassed) {
          return NextResponse.json(
            {
              hasAccess: false,
              error: `You must pass Round ${r} before submitting for Round ${round_id}`,
              teamName,
            },
            { status: 200 }
          );
        }
      }
    }

    return NextResponse.json(
      {
        hasAccess: true,
        error: null,
        teamName,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
