-- DHack'26 Supabase/Postgres schema
-- Safe to run multiple times (uses IF EXISTS/IF NOT EXISTS)

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type submission_status as enum ('submitted','pending','qualified','disqualified');
exception when duplicate_object then null; end $$;

do $$ begin
  create type result_status as enum ('passed','failed','pending');
exception when duplicate_object then null; end $$;

-- Sequence for team id
create sequence if not exists team_seq;

-- Teams
create table if not exists public.teams (
  team_id text primary key,
  team_name text not null,
  university text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Team ID generator trigger
create or replace function public.fn_set_team_id()
returns trigger language plpgsql as $$
begin
  if new.team_id is null then
    new.team_id := 'DH' || lpad(nextval('team_seq')::text, 3, '0');
  end if;
  return new;
end; $$;

drop trigger if exists tr_set_team_id on public.teams;
create trigger tr_set_team_id before insert on public.teams
for each row execute function public.fn_set_team_id();

-- Updated at trigger
create or replace function public.fn_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists tr_teams_touch on public.teams;
create trigger tr_teams_touch before update on public.teams
for each row execute function public.fn_touch_updated_at();

-- Members
create table if not exists public.members (
  member_id uuid primary key default gen_random_uuid(),
  team_id text references public.teams(team_id) on delete cascade,
  full_name text not null,
  name_with_initials text not null,
  nic char(12) not null unique,
  university_reg_no text,
  faculty text not null,
  academic_year int not null check (academic_year between 1 and 4),
  email text not null unique,
  whatsapp_number text not null,
  linkedin_profile text,
  is_leader boolean not null default false
);

-- NIC format: 9 digits + V or 12 digits
do $$ begin
  alter table public.members
    add constraint members_nic_format
    check (nic ~ '^(\d{9}V|\d{12})$');
exception when duplicate_object then null; end $$;

-- Ensure max 3 members per team
create or replace function public.fn_enforce_three_members()
returns trigger language plpgsql as $$
declare
  member_count int;
begin
  select count(*) into member_count from public.members where team_id = new.team_id;
  if tg_op = 'INSERT' then
    if member_count >= 3 then
      raise exception 'A team can have exactly 3 members. Current count: %', member_count;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists tr_members_max3 on public.members;
create trigger tr_members_max3 before insert on public.members
for each row execute function public.fn_enforce_three_members();

-- Ensure single leader per team
create or replace function public.fn_enforce_single_leader()
returns trigger language plpgsql as $$
declare existing_leaders int;
begin
  if (tg_op = 'INSERT' and new.is_leader) or (tg_op = 'UPDATE' and new.is_leader and not old.is_leader) then
    select count(*) into existing_leaders from public.members where team_id = new.team_id and is_leader = true;
    if existing_leaders >= 1 then
      raise exception 'Only one leader is allowed per team.';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists tr_members_one_leader on public.members;
create trigger tr_members_one_leader before insert or update on public.members
for each row execute function public.fn_enforce_single_leader();

-- Rounds
create table if not exists public.rounds (
  round_id int primary key,
  round_name text not null,
  description text
);

insert into public.rounds(round_id, round_name, description) values
  (1, 'Round 1 – Proposal', 'Initial proposal submission'),
  (2, 'Round 2 – Wireframes + Designs', 'Design artifacts and prototypes'),
  (3, 'Round 3 – Final + Video', 'Final deliverables and video')
on conflict (round_id) do nothing;

-- Round submissions
create table if not exists public.round_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  round_id int not null references public.rounds(round_id),
  team_id text not null references public.teams(team_id) on delete cascade,
  registration_number text not null,
  google_drive_link text not null,
  youtube_link text,
  status submission_status not null default 'submitted',
  submitted_at timestamp with time zone not null default now()
);

do $$ begin
  alter table public.round_submissions
    add constraint chk_gdrive_link
    check (google_drive_link ~ '^https://drive\\.google\\.com/');
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.round_submissions
    add constraint chk_youtube_round3
    check (
      round_id <> 3 or (youtube_link is not null and youtube_link ~* '^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be)/')
    );
exception when duplicate_object then null; end $$;

-- Results table
create table if not exists public.results (
  result_id uuid primary key default gen_random_uuid(),
  team_id text not null references public.teams(team_id) on delete cascade,
  round_id int not null references public.rounds(round_id),
  status result_status not null default 'pending',
  updated_at timestamp with time zone not null default now(),
  unique(team_id, round_id)
);

-- Touch updated_at
drop trigger if exists tr_results_touch on public.results;
create trigger tr_results_touch before update on public.results
for each row execute function public.fn_touch_updated_at();

-- Admin magic tokens (one-time login)
create table if not exists public.admin_magic_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

-- Helpful indexes
create index if not exists idx_members_team on public.members(team_id);
create index if not exists idx_submissions_team_round on public.round_submissions(team_id, round_id);
create index if not exists idx_results_team_round on public.results(team_id, round_id);

-- Verified BIS students (USJ) - for CPM verification
create table if not exists public.usj_bis_students (
  cpm_number text primary key,
  full_name text,
  email text,
  created_at timestamp with time zone not null default now()
);

-- Extend BIS students with additional attributes for auto-fill (idempotent)
do $$ begin
  alter table public.usj_bis_students
    add column if not exists name_with_initials text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.usj_bis_students
    add column if not exists university_reg_no text;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.usj_bis_students
    add column if not exists academic_year int;
exception when duplicate_column then null; end $$;

-- USJ BIS registrations and members (separate from common teams/members)
create sequence if not exists public.usj_bis_reg_seq;

create table if not exists public.usj_bis_registrations (
  bis_id text primary key,
  team_name text not null,
  university text not null default 'University of Sri Jayewardenepura',
  created_at timestamp with time zone not null default now()
);

create or replace function public.fn_set_usj_bis_id()
returns trigger language plpgsql as $$
begin
  if new.bis_id is null then
    new.bis_id := 'DHBIS' || lpad(nextval('public.usj_bis_reg_seq')::text, 3, '0');
  end if;
  return new;
end; $$;

drop trigger if exists tr_set_usj_bis_id on public.usj_bis_registrations;
create trigger tr_set_usj_bis_id before insert on public.usj_bis_registrations
for each row execute function public.fn_set_usj_bis_id();

create table if not exists public.usj_bis_members (
  member_id uuid primary key default gen_random_uuid(),
  bis_id text references public.usj_bis_registrations(bis_id) on delete cascade,
  full_name text not null,
  name_with_initials text not null,
  nic char(12) not null,
  university_reg_no text,
  academic_year int not null check (academic_year between 1 and 4),
  email text not null,
  whatsapp_number text not null,
  linkedin_profile text,
  is_leader boolean not null default false
);

do $$ begin
  alter table public.usj_bis_members
    add constraint usj_bis_members_nic_format
    check (nic ~ '^(\d{9}V|\d{12})$');
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.usj_bis_members
    add constraint usj_bis_members_nic_unique unique (nic);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.usj_bis_members
    add constraint usj_bis_members_email_unique unique (email);
exception when duplicate_object then null; end $$;

create index if not exists idx_usj_bis_members_bis on public.usj_bis_members(bis_id);


-- Remove BIS faculty column; department is fixed, so column is redundant
do $$ begin
  alter table public.usj_bis_members drop column if exists faculty;
exception when undefined_column then null; end $$;


-- BIS Round submissions (separate from common submissions)
create table if not exists public.usj_bis_round_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  round_id int not null references public.rounds(round_id),
  bis_id text not null references public.usj_bis_registrations(bis_id) on delete cascade,
  registration_number text not null,
  google_drive_link text not null,
  youtube_link text,
  status submission_status not null default 'submitted',
  submitted_at timestamp with time zone not null default now()
);

do $$ begin
  alter table public.usj_bis_round_submissions
    add constraint chk_bis_gdrive_link
    check (google_drive_link ~ '^https://drive\.google\.com/');
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.usj_bis_round_submissions
    add constraint chk_bis_youtube_round3
    check (
      round_id <> 3 or (youtube_link is not null and youtube_link ~* '^(https?://)?(www\.)?(youtube\.com|youtu\.be)/')
    );
exception when duplicate_object then null; end $$;

create index if not exists idx_usj_bis_round_submissions on public.usj_bis_round_submissions(bis_id, round_id);

-- BIS Results table (separate from common results)
create table if not exists public.usj_bis_results (
  result_id uuid primary key default gen_random_uuid(),
  bis_id text not null references public.usj_bis_registrations(bis_id) on delete cascade,
  round_id int not null references public.rounds(round_id),
  status result_status not null default 'pending',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(bis_id, round_id)
);

-- Touch updated_at trigger for BIS results
drop trigger if exists tr_usj_bis_results_touch on public.usj_bis_results;
create trigger tr_usj_bis_results_touch before update on public.usj_bis_results
for each row execute function public.fn_touch_updated_at();

-- Indexes for BIS results
create index if not exists idx_usj_bis_results_bis on public.usj_bis_results(bis_id);
create index if not exists idx_usj_bis_results_round on public.usj_bis_results(round_id);
create index if not exists idx_usj_bis_results_bis_round on public.usj_bis_results(bis_id, round_id);

-- =========================
-- Row Level Security (RLS)
-- =========================

-- Enable RLS on all public tables
alter table if exists public.teams enable row level security;
alter table if exists public.members enable row level security;
alter table if exists public.rounds enable row level security;
alter table if exists public.round_submissions enable row level security;
alter table if exists public.results enable row level security;
alter table if exists public.admin_magic_tokens enable row level security;
alter table if exists public.usj_bis_students enable row level security;
alter table if exists public.usj_bis_registrations enable row level security;
alter table if exists public.usj_bis_members enable row level security;
alter table if exists public.usj_bis_round_submissions enable row level security;
alter table if exists public.usj_bis_results enable row level security;

-- Public read for non-sensitive reference tables
drop policy if exists teams_select_public on public.teams;
create policy teams_select_public on public.teams for select using (true);

drop policy if exists teams_insert_public on public.teams;
create policy teams_insert_public on public.teams for insert with check (true);

drop policy if exists rounds_select_public on public.rounds;
create policy rounds_select_public on public.rounds for select using (true);

drop policy if exists results_select_public on public.results;
create policy results_select_public on public.results for select using (true);

-- Submissions are write-only from client (no public reads)
drop policy if exists round_submissions_insert_public on public.round_submissions;
create policy round_submissions_insert_public on public.round_submissions for insert with check (true);

drop policy if exists usj_bis_round_submissions_insert_public on public.usj_bis_round_submissions;
create policy usj_bis_round_submissions_insert_public on public.usj_bis_round_submissions for insert with check (true);

-- Members are write-only from client (no public reads)
drop policy if exists members_insert_public on public.members;
create policy members_insert_public on public.members for insert with check (true);

drop policy if exists usj_bis_members_insert_public on public.usj_bis_members;
create policy usj_bis_members_insert_public on public.usj_bis_members for insert with check (true);

-- BIS registrations need public insert (for number generation) and read (for validation)
drop policy if exists usj_bis_regs_select_public on public.usj_bis_registrations;
create policy usj_bis_regs_select_public on public.usj_bis_registrations for select using (true);

drop policy if exists usj_bis_regs_insert_public on public.usj_bis_registrations;
create policy usj_bis_regs_insert_public on public.usj_bis_registrations for insert with check (true);

-- BIS results: public read for access control checks
drop policy if exists usj_bis_results_select_public on public.usj_bis_results;
create policy usj_bis_results_select_public on public.usj_bis_results for select using (true);

-- Admin tokens and BIS students: RLS enabled, no public policies (service role only)

-- =============================
-- Secure function search_path
-- =============================

create or replace function public.fn_set_team_id()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.team_id is null then
    new.team_id := 'DH' || lpad(nextval('team_seq')::text, 3, '0');
  end if;
  return new;
end; $$;

create or replace function public.fn_touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end; $$;

create or replace function public.fn_enforce_three_members()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  member_count int;
begin
  select count(*) into member_count from public.members where team_id = new.team_id;
  if tg_op = 'INSERT' then
    if member_count >= 3 then
      raise exception 'A team can have exactly 3 members. Current count: %', member_count;
    end if;
  end if;
  return new;
end; $$;

create or replace function public.fn_enforce_single_leader()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare existing_leaders int;
begin
  if (tg_op = 'INSERT' and new.is_leader) or (tg_op = 'UPDATE' and new.is_leader and not old.is_leader) then
    select count(*) into existing_leaders from public.members where team_id = new.team_id and is_leader = true;
    if existing_leaders >= 1 then
      raise exception 'Only one leader is allowed per team.';
    end if;
  end if;
  return new;
end; $$;

create or replace function public.fn_set_usj_bis_id()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.bis_id is null then
    new.bis_id := 'DHBIS' || lpad(nextval('public.usj_bis_reg_seq')::text, 3, '0');
  end if;
  return new;
end; $$;

-- =============================
-- Secure RPC for CPM verification
-- =============================

create or replace function public.verify_usj_bis_cpm(p_cpm text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  exists_row boolean;
begin
  select exists(select 1 from public.usj_bis_students where cpm_number = p_cpm) into exists_row;
  return exists_row;
end; $$;

grant execute on function public.verify_usj_bis_cpm(text) to anon;



-- RPC to fetch multiple BIS students by CPM and return details for auto-fill
create or replace function public.get_usj_bis_students(p_cpms text[])
returns table (
  cpm_number text,
  full_name text,
  name_with_initials text,
  university_reg_no text,
  email text,
  academic_year int
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select s.cpm_number, s.full_name, s.name_with_initials, s.university_reg_no, s.email, s.academic_year
  from public.usj_bis_students s
  where s.cpm_number = any(p_cpms);
end; $$;

grant execute on function public.get_usj_bis_students(text[]) to anon;
