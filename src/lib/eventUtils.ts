export type EventCategory = 'innovation' | 'rebrand';

export type EventType =
  | 'registration'
  | 'proposal'
  | 'wireframe'
  | 'final'
  | 'judging'
  | 'ceremony'
  | 'workshop'
  | 'awareness'
  | 'announcement'
  | 'meeting'
  | 'other';

export interface HackEvent {
  id: string;
  name: string;
  description: string | null;
  category: EventCategory;
  type: EventType;
  start_at: string; // ISO
  end_at: string; // ISO
}

export type EventStatus = 'upcoming' | 'open' | 'closed';

export function getEventStatus(now: Date, event: HackEvent): EventStatus {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'open';
  return 'closed';
}

export function compareByStartThenEnd(a: HackEvent, b: HackEvent): number {
  const aStart = new Date(a.start_at).getTime();
  const bStart = new Date(b.start_at).getTime();
  if (aStart !== bStart) return aStart - bStart;
  return new Date(a.end_at).getTime() - new Date(b.end_at).getTime();
}

export function doEventsOverlap(a: HackEvent, b: HackEvent): boolean {
  const aStart = new Date(a.start_at).getTime();
  const aEnd = new Date(a.end_at).getTime();
  const bStart = new Date(b.start_at).getTime();
  const bEnd = new Date(b.end_at).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export function findActiveEventForCategory(
  events: HackEvent[],
  category: EventCategory
): HackEvent | null {
  const now = new Date();
  const filtered = events
    .filter(e => e.category === category)
    .sort(compareByStartThenEnd);
  for (const e of filtered) {
    if (getEventStatus(now, e) === 'open') return e;
  }
  return null;
}

export function findNextEventForCategory(
  events: HackEvent[],
  category: EventCategory
): HackEvent | null {
  const now = new Date();
  const filtered = events
    .filter(e => e.category === category)
    .sort(compareByStartThenEnd);
  for (const e of filtered) {
    if (getEventStatus(now, e) === 'upcoming') return e;
  }
  return null;
}

export function getCountdownTargetForCategory(
  events: HackEvent[],
  category: EventCategory
): { target: Date | null; label: string } {
  const now = new Date();
  const active = findActiveEventForCategory(events, category);
  if (active) {
    return { target: new Date(active.end_at), label: `${active.name} ends in` };
  }
  const next = findNextEventForCategory(events, category);
  if (next) {
    return { target: new Date(next.start_at), label: `${next.name} starts in` };
  }
  return { target: null, label: '' };
}

export function getCtaForEvent(event: HackEvent | null): {
  text: string;
  href: string;
} {
  if (!event) {
    return { text: 'View Schedule', href: '#timeline' };
  }
  const typeToText: Record<EventType, string> = {
    registration: 'Registration Closed',
    proposal: 'Submit Your Proposal',
    wireframe: 'Submit Your Wireframe & Prototype',
    final: 'Submit Your Presentation',
    judging: 'View Schedule',
    ceremony: 'View Ceremony Details',
    workshop: 'View Workshop Details',
    awareness: 'View Awareness Session',
    announcement: 'View Announcement',
    meeting: 'View Meeting Details',
    other: 'View Details',
  };
  const text = typeToText[event.type] || 'View Details';
  // Only allow submit page for specific event types; otherwise route to schedule
  const allowedForSubmit: EventType[] = [
    'registration',
    'proposal',
    'wireframe',
    'final',
    'announcement',
  ];
  const href = allowedForSubmit.includes(event.type)
    ? event.type === 'registration'
      ? '#timeline'
      : '/round-01-submission'
    : '#timeline';
  return { text, href };
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  const startStr = start.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endStr = end.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return sameDay ? startStr : `${startStr} – ${endStr}`;
}

export function getStatusBadge(
  now: Date,
  event: HackEvent
): {
  label: EventStatus;
  color: 'blue' | 'green' | 'gray';
} {
  const status = getEventStatus(now, event);
  if (status === 'open') return { label: 'open', color: 'green' };
  if (status === 'upcoming') return { label: 'upcoming', color: 'blue' };
  return { label: 'closed', color: 'gray' };
}

export function mapRoundToEventType(
  roundId: 1 | 2 | 3,
  category?: 'innovation' | 'rebrand'
): EventType {
  // For rebrand category: Round 1 = Wireframe, Round 2 = Final (Hackathon)
  if (category === 'rebrand') {
    if (roundId === 1) return 'wireframe';
    if (roundId === 2) return 'final';
  }

  // For innovation category: Round 1 = Proposal, Round 2 = Wireframe, Round 3 = Final
  if (roundId === 1) return 'proposal';
  if (roundId === 2) return 'wireframe';
  return 'final';
}
