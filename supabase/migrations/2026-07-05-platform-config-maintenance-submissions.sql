-- Reusable DHACK platform configuration, timeline, maintenance, and submissions.

create extension if not exists pgcrypto;

do $$ begin
  create type public.submission_review_status as enum (
    'pending',
    'reviewed',
    'qualified',
    'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter type public.registration_status add value if not exists 'reviewed';
exception when undefined_object then null; end $$;

do $$ begin
  alter type public.registration_status add value if not exists 'rejected';
exception when undefined_object then null; end $$;

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category public.event_category not null default 'innovation',
  event_type public.event_type not null default 'other',
  display_date text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at >= start_at)
);

create table if not exists public.submission_windows (
  id uuid primary key default gen_random_uuid(),
  competition_category public.competition_category,
  round int not null check (round in (1, 2, 3)),
  label text not null,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (closes_at > opens_at)
);

alter table public.submissions
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists competition_category public.competition_category,
  add column if not exists round int,
  add column if not exists submission_link text,
  add column if not exists submitted_at timestamptz not null default now();

alter table public.submissions
  alter column project_title drop not null,
  alter column project_summary drop not null,
  alter column sdg_goal drop not null,
  alter column ai_usage drop not null;

do $$ begin
  alter table public.submissions add constraint submissions_id_unique unique (id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.submissions add constraint submissions_round_check check (round is null or round in (1, 2, 3));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.submissions add constraint submissions_drive_link_check
  check (submission_link is null or submission_link ~ '^https://drive\.google\.com/');
exception when duplicate_object then null; end $$;

create unique index if not exists idx_submissions_one_per_team_round
  on public.submissions(team_id, round)
  where round is not null;

create unique index if not exists idx_teams_unique_team_name_per_competition
  on public.teams(competition_id, lower(team_name))
  where category in ('inter_university', 'rebrand');

create unique index if not exists idx_timeline_events_sort_order
  on public.timeline_events(sort_order)
  where is_active = true;

create unique index if not exists idx_submission_windows_unique_active
  on public.submission_windows(coalesce(competition_category::text, 'all'), round)
  where is_active = true;

create or replace function public.fn_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists tr_settings_touch on public.settings;
create trigger tr_settings_touch before update on public.settings
for each row execute function public.fn_touch_updated_at();

drop trigger if exists tr_timeline_events_touch on public.timeline_events;
create trigger tr_timeline_events_touch before update on public.timeline_events
for each row execute function public.fn_touch_updated_at();

drop trigger if exists tr_submission_windows_touch on public.submission_windows;
create trigger tr_submission_windows_touch before update on public.submission_windows
for each row execute function public.fn_touch_updated_at();

insert into public.settings(key, value, description)
values
  ('registration_open_at', '"2026-07-08T00:00:00+05:30"', 'Registration opening timestamp'),
  ('registration_close_at', '"2026-07-20T00:00:00+05:30"', 'Registration closing timestamp'),
  ('countdown_target_at', '"2026-07-20T00:00:00+05:30"', 'Public countdown target'),
  ('current_round', '"registration"', 'Current public round label'),
  ('maintenance_mode', 'false', 'Database-controlled maintenance mode'),
  ('maintenance_message', '"We are making DHACK better. Please check back soon."', 'Maintenance page message'),
  ('maintenance_estimated_return', '""', 'Optional maintenance return estimate'),
  ('contact_email', '"info@dhack.lk"', 'Public contact email')
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  updated_at = now();

delete from public.timeline_events;

insert into public.timeline_events (
  name,
  description,
  category,
  event_type,
  display_date,
  start_at,
  end_at,
  sort_order
) values
  ('Registration Open', 'Team registration opens for all DHACK competitions.', 'innovation', 'registration', '08 July 2026', '2026-07-08T00:00:00+05:30', '2026-07-08T23:59:59+05:30', 10),
  ('Registration Closed', 'Registration closes at midnight Sri Lanka time.', 'innovation', 'registration', '20 July 2026', '2026-07-20T00:00:00+05:30', '2026-07-20T23:59:59+05:30', 20),
  ('First Round', 'Round 1 submissions and evaluation begin.', 'innovation', 'proposal', '01 August 2026', '2026-08-01T00:00:00+05:30', '2026-08-01T23:59:59+05:30', 30),
  ('Second Round', 'Round 2 submissions and evaluation begin.', 'innovation', 'wireframe', '23 August 2026', '2026-08-23T00:00:00+05:30', '2026-08-23T23:59:59+05:30', 40),
  ('Final Round', 'Final round submissions and evaluation begin.', 'innovation', 'final', '12 September 2026', '2026-09-12T00:00:00+05:30', '2026-09-12T23:59:59+05:30', 50),
  ('ReBrand Hackathon', 'FMSC-exclusive ReBrand Hackathon. Exact September date to be announced.', 'rebrand', 'final', 'September (Date TBA)', '2026-09-15T00:00:00+05:30', '2026-09-15T23:59:59+05:30', 60);

delete from public.submission_windows;

insert into public.submission_windows (
  competition_category,
  round,
  label,
  opens_at,
  closes_at
) values
  (null, 1, 'Round 1', '2026-08-01T00:00:00+05:30', '2026-08-07T23:59:59+05:30'),
  (null, 2, 'Round 2', '2026-08-23T00:00:00+05:30', '2026-08-29T23:59:59+05:30'),
  (null, 3, 'Final Round', '2026-09-12T00:00:00+05:30', '2026-09-18T23:59:59+05:30');

alter table public.settings enable row level security;
alter table public.timeline_events enable row level security;
alter table public.submission_windows enable row level security;
alter table public.submissions enable row level security;

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select using (true);

drop policy if exists settings_service_manage on public.settings;
create policy settings_service_manage on public.settings for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists timeline_events_public_read on public.timeline_events;
create policy timeline_events_public_read on public.timeline_events
for select using (is_active = true);

drop policy if exists timeline_events_service_manage on public.timeline_events;
create policy timeline_events_service_manage on public.timeline_events for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists submission_windows_public_read on public.submission_windows;
create policy submission_windows_public_read on public.submission_windows
for select using (is_active = true);

drop policy if exists submission_windows_service_manage on public.submission_windows;
create policy submission_windows_service_manage on public.submission_windows for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists submissions_service_manage on public.submissions;
create policy submissions_service_manage on public.submissions for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
