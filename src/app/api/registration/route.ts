import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import { rateLimit } from '@/lib/rateLimit';
import { sanitizeForDbString } from '@/lib/sanitize';
import { CSRFService } from '@/lib/csrf';
import {
  handleAPIError,
  createSuccessResponse,
  ValidationError,
  RateLimitError,
  DatabaseError,
} from '@/lib/errorHandler';
import {
  BIS_DEPARTMENT,
  COMPETITIONS,
  FMSC_FACULTY,
  USJ,
} from '@/lib/dhack2026';
import { getPlatformSettings } from '@/lib/platformConfig';

const memberSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  whatsapp_number: z.string().regex(/^\d{10}$/),
  faculty: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  degree_program: z.string().optional().or(z.literal('')),
  student_id: z.string().optional().or(z.literal('')),
  grade: z.string().optional().or(z.literal('')),
  is_bis: z.boolean().default(false),
  is_leader: z.boolean().default(false),
});

const schema = z.object({
  competition_category: z.enum([
    'inter_university',
    'inter_school',
    'rebrand',
  ]),
  team_name: z.string().min(2),
  institution_name: z.string().min(2),
  teacher_in_charge: z.string().optional().or(z.literal('')),
  guardian_contact: z.string().optional().or(z.literal('')),
  members: z.array(memberSchema).min(3).max(5),
  recaptchaToken: z.string().optional().or(z.literal('')),
  csrfToken: z.string().optional().or(z.literal('')),
});

function normalizeInstitution(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function formatCpmNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  return `cpm ${digits}`;
}

async function verifyRebrandBisCpms(
  members: z.infer<typeof schema>['members']
) {
  const bisMembers = members.filter(member => member.is_bis);
  const invalidMembers = bisMembers.filter(
    member => !member.student_id || !/^\d{5}$/.test(member.student_id)
  );
  if (invalidMembers.length > 0) {
    throw new ValidationError(
      'BIS students must provide a valid 5-digit CPM number.'
    );
  }

  if (bisMembers.length === 0) return;

  const formattedCpms = bisMembers.map(member =>
    formatCpmNumber(member.student_id!)
  );
  const uniqueCpms = Array.from(new Set(formattedCpms));
  if (uniqueCpms.length !== formattedCpms.length) {
    throw new ValidationError('Duplicate CPM numbers in the team.');
  }

  const { data, error } = await supabaseServer
    .from('usj_bis_students')
    .select('cpm_number')
    .in('cpm_number', uniqueCpms);

  if (error) {
    throw new DatabaseError(error.message);
  }

  const verified = new Set(
    (data ?? []).map((row: { cpm_number: string }) => row.cpm_number)
  );
  const missing = uniqueCpms.filter(cpm => !verified.has(cpm));
  if (missing.length > 0) {
    throw new ValidationError(
      'One or more CPM numbers could not be verified for BIS students.'
    );
  }
}

function validateCategory(data: z.infer<typeof schema>) {
  const category = COMPETITIONS[data.competition_category];
  if (data.members.length < category.minMembers) {
    throw new ValidationError(
      `${category.title} requires at least ${category.minMembers} members.`
    );
  }
  if (data.members.length > category.maxMembers) {
    throw new ValidationError(
      `${category.title} allows at most ${category.maxMembers} members.`
    );
  }
  if (category.exactMembers && data.members.length !== category.exactMembers) {
    throw new ValidationError(
      `${category.title} requires exactly ${category.exactMembers} members.`
    );
  }
  if (data.members.filter(member => member.is_leader).length !== 1) {
    throw new ValidationError('Exactly one team leader is required.');
  }

  if (
    data.competition_category !== 'inter_school' &&
    !data.team_name.trim()
  ) {
    throw new ValidationError('Unique team name is required.');
  }

  const emails = data.members.map(member => member.email.toLowerCase());
  if (new Set(emails).size !== emails.length) {
    throw new ValidationError('Duplicate email addresses in the team.');
  }

  if (data.competition_category === 'inter_school') {
    if (!data.teacher_in_charge) {
      throw new ValidationError('Teacher in charge is required.');
    }
    if (!data.guardian_contact || !/^\d{10}$/.test(data.guardian_contact)) {
      throw new ValidationError(
        'Parent or guardian contact must be exactly 10 digits.'
      );
    }
    if (data.members.some(member => !member.grade)) {
      throw new ValidationError('Grade is required for every school member.');
    }
  }

  if (data.competition_category === 'inter_university') {
    if (
      data.members.some(
        member =>
          !member.faculty || !member.degree_program || !member.student_id
      )
    ) {
      throw new ValidationError(
        'University, faculty, degree program, and student ID are required.'
      );
    }
  }

  if (data.competition_category === 'rebrand') {
    if (data.institution_name !== USJ) {
      throw new ValidationError(`ReBrand is restricted to ${USJ}.`);
    }
    const bisCount = data.members.filter(member => member.is_bis).length;
    if (bisCount < 3 || bisCount > 5) {
      throw new ValidationError(
        'ReBrand requires between 3 and 5 BIS students.'
      );
    }
    for (const member of data.members) {
      if (member.faculty !== FMSC_FACULTY) {
        throw new ValidationError(
          `All ReBrand members must belong to ${FMSC_FACULTY}.`
        );
      }
      if (!member.department || !member.degree_program) {
        throw new ValidationError(
          'Department and degree program are required for ReBrand.'
        );
      }
      if (!member.student_id) {
        throw new ValidationError(
          member.is_bis
            ? 'CPM number is required for BIS students.'
            : 'Registration number is required for ReBrand participants.'
        );
      }
      if (member.is_bis && member.department !== BIS_DEPARTMENT) {
        throw new ValidationError(
          `Members marked as BIS must use ${BIS_DEPARTMENT} as department.`
        );
      }
      if (!member.is_bis && member.department === BIS_DEPARTMENT) {
        throw new ValidationError(
          'Non-BIS ReBrand members must be from another FMSC department.'
        );
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const csrfValid = await CSRFService.validateCSRFToken(req);
    if (!csrfValid) {
      throw new ValidationError(
        'Invalid CSRF token. Please refresh the page and try again.'
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid request data', parsed.error.flatten());
    }

    const data = parsed.data;
    const settings = await getPlatformSettings();
    if (
      !settings.registrationEnabled ||
      Date.now() >= new Date(settings.registrationCloseAt).getTime()
    ) {
      throw new ValidationError('Registration Closed');
    }
    validateCategory(data);
    if (data.competition_category === 'rebrand') {
      await verifyRebrandBisCpms(data.members);
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      (req as any).ip ||
      null;
    const rl = rateLimit('registration_POST', ip, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });
    if (!rl.allowed) {
      throw new RateLimitError('Too many requests. Please try again later.');
    }

    if (process.env.RECAPTCHA_SECRET_KEY) {
      const recaptcha = await verifyRecaptchaToken(
        data.recaptchaToken || '',
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      );
      if (!recaptcha.ok) {
        throw new ValidationError('reCAPTCHA verification failed.');
      }
    }

    const category = COMPETITIONS[data.competition_category];
    const normalizedInstitution = normalizeInstitution(data.institution_name);

    const { data: competition, error: competitionError } = await supabaseServer
      .from('competitions')
      .select('id')
      .eq('category', data.competition_category)
      .limit(1)
      .single();
    if (competitionError || !competition) {
      throw new DatabaseError(
        competitionError?.message || 'Competition category is not configured.'
      );
    }

    if (data.competition_category === 'inter_school') {
      const { data: existingSchool, error: existingSchoolError } =
        await supabaseServer
          .from('institutions')
          .select('id, teams!inner(team_id)')
          .eq('normalized_name', normalizedInstitution)
          .eq('institution_type', 'school')
          .eq('teams.competition_id', (competition as any).id)
          .limit(1);
      if (existingSchoolError) {
        throw new DatabaseError(existingSchoolError.message);
      }
      if (existingSchool && existingSchool.length > 0) {
        throw new ValidationError(
          'A team from this school has already registered for DHACK 2026.'
        );
      }
    } else {
      const { data: existingTeam, error: existingTeamError } =
        await supabaseServer
          .from('teams')
          .select('team_id')
          .eq('competition_id', (competition as any).id)
          .ilike('team_name', data.team_name.trim())
          .limit(1);
      if (existingTeamError) {
        throw new DatabaseError(existingTeamError.message);
      }
      if (existingTeam && existingTeam.length > 0) {
        throw new ValidationError(
          'This team name has already been registered for this competition.'
        );
      }
    }

    const { data: institution, error: institutionError } = await supabaseServer
      .from('institutions')
      .upsert(
        {
          name: sanitizeForDbString(data.institution_name, 180),
          normalized_name: normalizedInstitution,
          institution_type: category.institutionType,
        },
        { onConflict: 'normalized_name,institution_type' }
      )
      .select('id')
      .single();
    if (institutionError || !institution) {
      throw new DatabaseError(
        institutionError?.message || 'Failed to save institution.'
      );
    }

    const { data: team, error: teamError } = await supabaseServer
      .from('teams')
      .insert({
        team_name: sanitizeForDbString(data.team_name, 100),
        university: sanitizeForDbString(data.institution_name, 180),
        competition_id: (competition as any).id,
        institution_id: (institution as any).id,
        institution_type: category.institutionType,
        category: data.competition_category,
        teacher_in_charge: data.teacher_in_charge
          ? sanitizeForDbString(data.teacher_in_charge, 120)
          : null,
        guardian_contact: data.guardian_contact
          ? sanitizeForDbString(data.guardian_contact, 32)
          : null,
      })
      .select('team_id')
      .single();
    if (teamError || !team) {
      throw new DatabaseError(teamError?.message || 'Failed to create team.');
    }

    const teamId = (team as any).team_id as string;
    const membersPayload = data.members.map(member => ({
      team_id: teamId,
      full_name: sanitizeForDbString(member.full_name, 120),
      email: sanitizeForDbString(member.email.toLowerCase(), 150),
      whatsapp_number: sanitizeForDbString(member.whatsapp_number, 32),
      faculty: member.faculty ? sanitizeForDbString(member.faculty, 160) : null,
      department: member.department
        ? sanitizeForDbString(member.department, 160)
        : null,
      degree_program: member.degree_program
        ? sanitizeForDbString(member.degree_program, 160)
        : null,
      student_id: member.student_id
        ? sanitizeForDbString(member.student_id, 80)
        : null,
      grade_level: member.grade ? sanitizeForDbString(member.grade, 40) : null,
      bis_status: member.is_bis,
      is_leader: member.is_leader,
    }));

    const { error: memberError } = await supabaseServer
      .from('team_members')
      .insert(membersPayload);
    if (memberError) {
      throw new DatabaseError(memberError.message);
    }

    return createSuccessResponse({ team_id: teamId });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function GET() {
  try {
    const csrfToken = CSRFService.generateToken();
    const response = NextResponse.json({ csrfToken });
    return CSRFService.setCSRFCookie(response, csrfToken);
  } catch (error) {
    return handleAPIError(error);
  }
}
