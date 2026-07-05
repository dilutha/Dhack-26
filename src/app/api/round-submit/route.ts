import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';
import { sanitizeForDbString } from '@/lib/sanitize';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import {
  getSubmissionWindows,
  getWindowStatus,
} from '@/lib/platformConfig';

const schema = z
  .object({
    competition_category: z.enum([
      'inter_university',
      'inter_school',
      'rebrand',
    ]),
    round: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    team_name: z.string().optional().or(z.literal('')),
    school_name: z.string().optional().or(z.literal('')),
    submission_link: z
      .string()
      .url('Google Drive link is required')
      .refine(
        value => /^https:\/\/drive\.google\.com\//.test(value),
        'Must be a Google Drive link'
      ),
    recaptchaToken: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.competition_category === 'inter_school') {
      if (!data.school_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['school_name'],
          message: 'School name is required.',
        });
      }
      return;
    }

    if (!data.team_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['team_name'],
        message: 'Team name is required.',
      });
    }
  });

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

async function findRegisteredTeam(data: z.infer<typeof schema>) {
  if (data.competition_category === 'inter_school') {
    const normalizedSchool = normalizeName(data.school_name || '');
    const { data: rows, error } = await supabaseServer
      .from('teams')
      .select('team_id, team_name, category, institutions!inner(normalized_name)')
      .eq('category', 'inter_school')
      .eq('institutions.normalized_name', normalizedSchool)
      .limit(1);
    if (error) throw new Error(error.message);
    return rows?.[0] || null;
  }

  const { data: rows, error } = await supabaseServer
    .from('teams')
    .select('team_id, team_name, category')
    .eq('category', data.competition_category)
    .ilike('team_name', data.team_name?.trim() || '')
    .limit(1);
  if (error) throw new Error(error.message);
  return rows?.[0] || null;
}

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

    const data = parsed.data;
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      (req as any).ip ||
      null;
    const rl = rateLimit('round_submit_POST', ip, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (process.env.RECAPTCHA_SECRET_KEY) {
      const recaptcha = await verifyRecaptchaToken(
        data.recaptchaToken || '',
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      );
      if (!recaptcha.ok) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 403 }
        );
      }
    }

    const windows = await getSubmissionWindows();
    const window = windows.find(
      item =>
        item.round === data.round &&
        (!item.competition_category ||
          item.competition_category === data.competition_category)
    );
    if (!window) {
      return NextResponse.json(
        { error: 'Submission window is not configured.' },
        { status: 400 }
      );
    }

    const status = getWindowStatus(new Date(), window.opens_at, window.closes_at);
    if (status !== 'open') {
      return NextResponse.json(
        {
          error:
            status === 'upcoming'
              ? `Submission window opens on ${new Date(window.opens_at).toLocaleString()}`
              : 'Submission closed',
        },
        { status: 400 }
      );
    }

    const team = await findRegisteredTeam(data);
    if (!team) {
      return NextResponse.json(
        {
          error:
            data.competition_category === 'inter_school'
              ? 'School registration was not found.'
              : 'Team registration was not found.',
        },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabaseServer
      .from('submissions')
      .select('id')
      .eq('team_id', (team as any).team_id)
      .eq('round', data.round)
      .limit(1);
    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'This team has already submitted for this round.' },
        { status: 400 }
      );
    }

    const { data: submission, error: insertError } = await supabaseServer
      .from('submissions')
      .insert({
        team_id: (team as any).team_id,
        competition_category: data.competition_category,
        round: data.round,
        submission_link: sanitizeForDbString(data.submission_link, 512),
        status: 'pending',
      })
      .select('id')
      .single();
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      submission_id: (submission as any).id,
      message: 'Submission received successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to submit round work',
      },
      { status: 500 }
    );
  }
}
