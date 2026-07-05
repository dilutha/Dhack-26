-- Create events-related enums and table. Idempotent and safe to re-run.
-- DO NOT RESET DATA.

-- =====================
-- Enums
-- =====================
do $$ begin
  create type public.event_category as enum ('innovation','redesign');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_type as enum (
    'registration',
    'proposal',
    'wireframe',
    'final',
    'judging',
    'ceremony',
    'workshop',
    'awareness',
    'announcement',
    'meeting',
    'other'
  );
exception when duplicate_object then null; end $$;

-- =====================
-- Table
-- =====================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category public.event_category not null,
  type public.event_type not null,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  check (end_at > start_at)
);

-- Updated at trigger
create or replace function public.fn_events_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tr_events_touch on public.events;
create trigger tr_events_touch before update on public.events
for each row execute function public.fn_events_touch_updated_at();

-- Helpful indexes
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_events_type on public.events(type);
create index if not exists idx_events_start_end on public.events(start_at, end_at);

-- =====================
-- RLS and policies
-- =====================
alter table if exists public.events enable row level security;

-- Read for all (timeline on frontend)
drop policy if exists events_select_public on public.events;
create policy events_select_public on public.events for select using (true);

-- No public inserts/updates/deletes; admin APIs should use service role
drop policy if exists events_block_dml_public on public.events;
create policy events_block_dml_public on public.events for all to public using (false) with check (false);

-- =====================
-- Optional: Seed minimal rows from existing constants (SKIPPED to avoid duplication).
-- Admin UI/API will insert as needed.


