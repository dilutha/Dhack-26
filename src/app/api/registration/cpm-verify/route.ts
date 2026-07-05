import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';

const schema = z.object({
  cpms: z
    .array(z.string().regex(/^\d{5}$/))
    .length(3, 'Exactly three CPM numbers required'),
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

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      (req as any).ip ||
      null;
    const rl = rateLimit('cpm_verify_POST', ip, {
      windowMs: 15 * 60 * 1000,
      max: 10,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: rl.retryAfterMs
            ? { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) }
            : {},
        }
      );
    }

    const { cpms } = parsed.data;

    // Convert 5-digit numbers to "cpm XXXXX" format for database query
    const formattedCpms = cpms.map(cpm => `cpm ${cpm}`);

    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        {
          error:
            'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
          data: [],
        },
        { status: 503 }
      );
    }

    try {
      const { data, error } = await supabaseServer.rpc('get_usj_bis_students', {
        p_cpms: formattedCpms,
      });
      if (!error) {
        return NextResponse.json({ data: data ?? [] }, { status: 200 });
      }
      // Fallback: if RPC not available, query table directly
      const { data: direct, error: directErr } = await supabaseServer
        .from('usj_bis_students')
        .select(
          'cpm_number, full_name, name_with_initials, university_reg_no, email, academic_year'
        )
        .in('cpm_number', formattedCpms);
      if (directErr) {
        return NextResponse.json({ error: directErr.message }, { status: 400 });
      }
      return NextResponse.json({ data: direct ?? [] }, { status: 200 });
    } catch (rpcErr: any) {
      console.error('CPM verify RPC failed:', rpcErr?.message || rpcErr);
      // Final fallback error
      return NextResponse.json(
        { error: rpcErr?.message || 'RPC failure' },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
