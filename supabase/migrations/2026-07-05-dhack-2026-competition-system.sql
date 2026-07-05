-- DHACK 2026 competition, institution, team member, and submission model.
-- Designed to extend the existing DHACK schema without dropping old data.

create extension if not exists pgcrypto;

do $$ begin
  alter type public.event_category add value if not exists 'rebrand';
exception when undefined_object then null; end $$;

do $$ begin
  create type public.competition_category as enum (
    'inter_university',
    'inter_school',
    'rebrand'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.institution_type as enum ('university','school','faculty');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.registration_status as enum (
    'submitted',
    'pending',
    'qualified',
    'disqualified'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  category public.competition_category not null unique,
  name text not null,
  eligibility_rules jsonb not null default '{}'::jsonb,
  min_members int not null,
  max_members int not null,
  exact_members int,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_members >= 1),
  check (max_members >= min_members),
  check (exact_members is null or exact_members between min_members and max_members)
);

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  institution_type public.institution_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name, institution_type)
);

alter table public.teams
  add column if not exists competition_id uuid references public.competitions(id),
  add column if not exists institution_id uuid references public.institutions(id),
  add column if not exists institution_type public.institution_type,
  add column if not exists category public.competition_category,
  add column if not exists teacher_in_charge text,
  add column if not exists guardian_contact text;

create table if not exists public.team_members (
  member_id uuid primary key default gen_random_uuid(),
  team_id text not null references public.teams(team_id) on delete cascade,
  full_name text not null,
  email text not null,
  whatsapp_number text not null,
  faculty text,
  department text,
  degree_program text,
  student_id text,
  grade_level text,
  bis_status boolean not null default false,
  is_leader boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create table if not exists public.submissions (
  submission_id uuid primary key default gen_random_uuid(),
  team_id text not null references public.teams(team_id) on delete cascade,
  project_title text not null,
  project_summary text not null,
  sdg_goal text not null,
  ai_usage text not null,
  status public.registration_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_teams_competition on public.teams(competition_id);
create index if not exists idx_teams_institution on public.teams(institution_id);
create index if not exists idx_teams_category on public.teams(category);
create index if not exists idx_team_members_team on public.team_members(team_id);
create index if not exists idx_team_members_student_id on public.team_members(student_id);
create index if not exists idx_submissions_team on public.submissions(team_id);

create unique index if not exists idx_one_school_team_per_competition
  on public.teams(competition_id, institution_id)
  where category = 'inter_school';

create or replace function public.fn_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists tr_competitions_touch on public.competitions;
create trigger tr_competitions_touch before update on public.competitions
for each row execute function public.fn_touch_updated_at();

drop trigger if exists tr_institutions_touch on public.institutions;
create trigger tr_institutions_touch before update on public.institutions
for each row execute function public.fn_touch_updated_at();

drop trigger if exists tr_team_members_touch on public.team_members;
create trigger tr_team_members_touch before update on public.team_members
for each row execute function public.fn_touch_updated_at();

drop trigger if exists tr_submissions_touch on public.submissions;
create trigger tr_submissions_touch before update on public.submissions
for each row execute function public.fn_touch_updated_at();

create or replace function public.fn_enforce_dhack_2026_team_rules()
returns trigger language plpgsql as $$
declare
  member_count int;
  bis_count int;
  bad_rebrand_count int;
  team_category public.competition_category;
begin
  select category into team_category
  from public.teams
  where team_id = coalesce(new.team_id, old.team_id);

  select count(*) into member_count
  from public.team_members
  where team_id = coalesce(new.team_id, old.team_id);

  if team_category = 'inter_university' and member_count > 5 then
    raise exception 'Inter-University teams can have at most 5 members.';
  end if;

  if team_category in ('inter_school', 'rebrand') and member_count > 5 then
    raise exception '% teams must have exactly 5 members.', team_category;
  end if;

  if team_category = 'rebrand' then
    select count(*) into bis_count
    from public.team_members
    where team_id = coalesce(new.team_id, old.team_id)
      and bis_status = true;

    select count(*) into bad_rebrand_count
    from public.team_members
    where team_id = coalesce(new.team_id, old.team_id)
      and coalesce(faculty, '') <> 'Faculty of Management Studies and Commerce';

    if bad_rebrand_count > 0 then
      raise exception 'All ReBrand members must be FMSC students.';
    end if;

    if member_count = 5 and bis_count < 3 then
      raise exception 'ReBrand teams require at least 3 BIS students.';
    end if;
  end if;

  return coalesce(new, old);
end; $$;

drop trigger if exists tr_team_members_dhack_2026_rules on public.team_members;
create constraint trigger tr_team_members_dhack_2026_rules
after insert or update or delete on public.team_members
deferrable initially deferred
for each row execute function public.fn_enforce_dhack_2026_team_rules();

insert into public.competitions (
  category,
  name,
  eligibility_rules,
  min_members,
  max_members,
  exact_members
) values
  (
    'inter_university',
    'Inter-University Hackathon',
    '{"eligibility":["Recognized universities"],"collect":["University","Faculty","Degree Program","Student ID"]}'::jsonb,
    3,
    5,
    null
  ),
  (
    'inter_school',
    'InterSchool Hackathon',
    '{"eligibility":["School students only"],"collect":["School Name","Grade","Teacher In Charge","Parent / Guardian Contact"],"unique_school":true}'::jsonb,
    5,
    5,
    5
  ),
  (
    'rebrand',
    'ReBrand Hackathon',
    '{"eligibility":["FMSC, University of Sri Jayewardenepura"],"rules":["Exactly 5 members","At least 3 BIS students"],"collect":["Department","Degree Program","Registration Number"]}'::jsonb,
    5,
    5,
    5
  )
on conflict (category) do update set
  name = excluded.name,
  eligibility_rules = excluded.eligibility_rules,
  min_members = excluded.min_members,
  max_members = excluded.max_members,
  exact_members = excluded.exact_members,
  updated_at = now();

alter table public.competitions enable row level security;
alter table public.institutions enable row level security;
alter table public.team_members enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "Public can read active competitions" on public.competitions;
create policy "Public can read active competitions"
on public.competitions for select
using (active = true);

drop policy if exists "Service role can manage competitions" on public.competitions;
create policy "Service role can manage competitions"
on public.competitions for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "Service role can manage institutions" on public.institutions;
create policy "Service role can manage institutions"
on public.institutions for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "Service role can manage team members" on public.team_members;
create policy "Service role can manage team members"
on public.team_members for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "Service role can manage submissions" on public.submissions;
create policy "Service role can manage submissions"
on public.submissions for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
