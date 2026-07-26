-- Move DHACK 2026 from registration mode to Round 01 submission mode.
-- This is an operational configuration migration only; the existing
-- submissions schema already supports round submissions, Drive links,
-- timestamps, one submission per team per round, and service-role RLS.

insert into public.settings(key, value, description)
values
  ('registration_enabled', 'false', 'Whether the public registration API accepts new registrations'),
  ('registration_close_at', '"2026-07-26T00:00:00+05:30"', 'Registration closed before Round 01 submissions opened'),
  ('countdown_target_at', '"2026-08-01T23:55:55+05:30"', 'Round 01 submission deadline countdown target'),
  ('current_round', '"round_01_submission"', 'Current public round label')
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  updated_at = now();

delete from public.submission_windows
where round = 1
  and competition_category is null
  and is_active = true;

insert into public.submission_windows (
  competition_category,
  round,
  label,
  opens_at,
  closes_at,
  is_active
) values (
  null,
  1,
  'Round 01 Submission',
  '2026-07-26T00:00:00+05:30',
  '2026-08-01T23:55:55+05:30',
  true
);

delete from public.timeline_events
where sort_order in (10, 20, 30, 40, 50, 60)
  and name in (
    'Registration Open',
    'Registration Closed',
    'First Round',
    'Round 01 Submission',
    'Second Round',
    'Final Round',
    'ReBrand Hackathon'
  );

insert into public.timeline_events (
  name,
  description,
  category,
  event_type,
  display_date,
  start_at,
  end_at,
  sort_order,
  is_active
) values
  (
    'Registration Open',
    'Team registration opened for all DHACK 2026 competitions.',
    'innovation',
    'registration',
    '08 July 2026',
    '2026-07-08T00:00:00+05:30',
    '2026-07-08T23:59:59+05:30',
    10,
    true
  ),
  (
    'Registration Closed',
    'Registration has been completed for DHACK 2026.',
    'innovation',
    'registration',
    'Completed',
    '2026-07-26T00:00:00+05:30',
    '2026-07-26T00:00:00+05:30',
    20,
    true
  ),
  (
    'Round 01 Submission',
    'Registered teams submit Round 01 deliverables through the official submission portal.',
    'innovation',
    'proposal',
    '26 July - 01 August 2026',
    '2026-07-26T00:00:00+05:30',
    '2026-08-01T23:55:55+05:30',
    30,
    true
  ),
  (
    'Second Round',
    'Selected teams progress into the second evaluation round.',
    'innovation',
    'wireframe',
    '23 August 2026',
    '2026-08-23T00:00:00+05:30',
    '2026-08-23T23:59:59+05:30',
    40,
    true
  ),
  (
    'Final Round',
    'Final competition round for top DHACK 2026 teams.',
    'innovation',
    'final',
    '12 September 2026',
    '2026-09-12T00:00:00+05:30',
    '2026-09-12T23:59:59+05:30',
    50,
    true
  ),
  (
    'ReBrand Hackathon',
    'FMSC-exclusive ReBrand Hackathon. Exact September date to be announced.',
    'rebrand',
    'final',
    'September (Date TBA)',
    '2026-09-15T00:00:00+05:30',
    '2026-09-15T23:59:59+05:30',
    60,
    true
  );
