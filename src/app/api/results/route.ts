import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';
import { verifyRecaptchaToken } from '@/lib/recaptcha';

const querySchema = z.object({
  id: z.string().min(3).max(16),
  nic: z.string().min(9).max(12),
  recaptcha: z.string().min(10),
});

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      (req as any).ip ||
      null;
    const rl = rateLimit('results_GET', ip, { windowMs: 60 * 1000, max: 20 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || '';
    const nic = searchParams.get('nic') || '';
    const recaptcha = searchParams.get('recaptcha') || '';
    const parsed = querySchema.safeParse({ id, nic, recaptcha });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptchaToken(recaptcha, ip);
    if (!recaptchaResult.ok) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 403 }
      );
    }

    // Normalize NIC for comparison
    const normalizeNic = (nic: string) => nic.replace(/\s+/g, '').toUpperCase();

    // First check if team exists (for DH###)
    const isCommon = /^DH\d{3}$/.test(id);
    const isBis = /^DHBIS\d{3}$/.test(id);
    if (!isCommon && !isBis) {
      return NextResponse.json(
        { error: 'Invalid registration number' },
        { status: 400 }
      );
    }

    // Verify NIC belongs to the team
    let isMember = false;
    if (isCommon) {
      const { data: member } = await supabaseServer
        .from('members')
        .select('nic')
        .eq('team_id', id)
        .eq('nic', normalizeNic(nic))
        .maybeSingle();
      isMember = !!member;
    } else if (isBis) {
      const { data: member } = await supabaseServer
        .from('usj_bis_members')
        .select('nic')
        .eq('bis_id', id)
        .eq('nic', normalizeNic(nic))
        .maybeSingle();
      isMember = !!member;
    }

    if (!isMember) {
      return NextResponse.json(
        {
          error:
            'You are not a member of this team. Please verify your NIC number and team ID.',
        },
        { status: 403 }
      );
    }

    // Fetch results - check both regular and BIS results tables
    let allResults: any[] = [];

    // Check regular results table
    const { data: regularResults, error: regularError } = await supabaseServer
      .from('results')
      .select('*')
      .eq('team_id', id)
      .order('round_id');

    if (regularError) {
      return NextResponse.json(
        { error: regularError.message },
        { status: 400 }
      );
    }

    if (regularResults) {
      allResults = [...allResults, ...regularResults];
    }

    // Check BIS results table for BIS teams
    if (isBis) {
      const { data: bisResults, error: bisError } = await supabaseServer
        .from('usj_bis_results')
        .select('*')
        .eq('bis_id', id)
        .order('round_id');

      if (bisError) {
        return NextResponse.json({ error: bisError.message }, { status: 400 });
      }

      if (bisResults) {
        // Convert BIS results to match regular results format
        const formattedBisResults = bisResults.map((result: any) => ({
          ...result,
          team_id: result.bis_id, // Map bis_id to team_id for consistency
        }));
        allResults = [...allResults, ...formattedBisResults];
      }
    }

    // Sort all results by round_id
    allResults.sort((a, b) => a.round_id - b.round_id);

    return NextResponse.json({ data: allResults }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
