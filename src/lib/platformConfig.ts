import {
  DHACK_2026_CONFIG,
  DHACK_2026_EVENTS,
  DHACK_2026_SUBMISSION_WINDOWS,
} from '@/lib/dhack2026';
import { HackEvent } from '@/lib/eventUtils';
import { supabaseServer } from '@/lib/supabaseServer';

export type PlatformSettings = {
  registrationOpenAt: string;
  registrationCloseAt: string;
  registrationEnabled: boolean;
  countdownTargetAt: string;
  currentRound: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceEstimatedReturn: string;
  contactEmail: string;
};

export type SubmissionWindow = {
  id?: string;
  competition_category?: string | null;
  round: 1 | 2 | 3;
  label: string;
  opens_at: string;
  closes_at: string;
};

export const fallbackSettings: PlatformSettings = {
  registrationOpenAt: DHACK_2026_CONFIG.registrationOpenAt,
  registrationCloseAt: DHACK_2026_CONFIG.registrationCloseAt,
  registrationEnabled: DHACK_2026_CONFIG.registrationEnabled,
  countdownTargetAt: DHACK_2026_CONFIG.countdownTargetAt,
  currentRound: DHACK_2026_CONFIG.currentRound,
  maintenanceMode: DHACK_2026_CONFIG.maintenanceMode,
  maintenanceMessage: DHACK_2026_CONFIG.maintenanceMessage,
  maintenanceEstimatedReturn: DHACK_2026_CONFIG.maintenanceEstimatedReturn,
  contactEmail: DHACK_2026_CONFIG.contactEmail,
};

export const fallbackTimelineEvents =
  DHACK_2026_EVENTS as unknown as (HackEvent & { displayDate?: string })[];

export const fallbackSubmissionWindows =
  DHACK_2026_SUBMISSION_WINDOWS as unknown as SubmissionWindow[];

function settingString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function settingBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const { data, error } = await supabaseServer
      .from('settings')
      .select('key, value');

    if (error || !data) return fallbackSettings;

    const map = new Map<string, unknown>();
    for (const row of data as { key: string; value: unknown }[]) {
      map.set(row.key, row.value);
    }

    return {
      registrationOpenAt: settingString(
        map.get('registration_open_at'),
        fallbackSettings.registrationOpenAt
      ),
      registrationCloseAt: settingString(
        map.get('registration_close_at'),
        fallbackSettings.registrationCloseAt
      ),
      registrationEnabled: settingBoolean(
        map.get('registration_enabled'),
        fallbackSettings.registrationEnabled
      ),
      countdownTargetAt: settingString(
        map.get('countdown_target_at'),
        fallbackSettings.countdownTargetAt
      ),
      currentRound: settingString(
        map.get('current_round'),
        fallbackSettings.currentRound
      ),
      maintenanceMode: settingBoolean(
        map.get('maintenance_mode'),
        fallbackSettings.maintenanceMode
      ),
      maintenanceMessage: settingString(
        map.get('maintenance_message'),
        fallbackSettings.maintenanceMessage
      ),
      maintenanceEstimatedReturn: settingString(
        map.get('maintenance_estimated_return'),
        fallbackSettings.maintenanceEstimatedReturn
      ),
      contactEmail: settingString(
        map.get('contact_email'),
        fallbackSettings.contactEmail
      ),
    };
  } catch {
    return fallbackSettings;
  }
}

export async function getTimelineEvents() {
  try {
    const { data, error } = await supabaseServer
      .from('timeline_events')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return fallbackTimelineEvents;

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      type: row.event_type,
      start_at: row.start_at,
      end_at: row.end_at,
      displayDate: row.display_date,
    })) as (HackEvent & { displayDate?: string })[];
  } catch {
    return fallbackTimelineEvents;
  }
}

export async function getSubmissionWindows(): Promise<SubmissionWindow[]> {
  try {
    const { data, error } = await supabaseServer
      .from('submission_windows')
      .select('*')
      .eq('is_active', true)
      .order('round', { ascending: true });

    if (error || !data || data.length === 0) return fallbackSubmissionWindows;

    return data.map((row: any) => ({
      id: row.id,
      competition_category: row.competition_category,
      round: row.round,
      label: row.label,
      opens_at: row.opens_at,
      closes_at: row.closes_at,
    }));
  } catch {
    return fallbackSubmissionWindows;
  }
}

export function getWindowStatus(
  now: Date,
  openAt: string,
  closeAt: string
): 'upcoming' | 'open' | 'closed' {
  const open = new Date(openAt);
  const close = new Date(closeAt);
  if (now < open) return 'upcoming';
  if (now >= open && now < close) return 'open';
  return 'closed';
}
