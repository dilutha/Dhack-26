-- Add USJ BIS specific sequences, tables, and triggers
-- Safe to run multiple times

-- Sequence for BIS registration numbers (DHBIS001 ...)
create sequence if not exists public.usj_bis_reg_seq;

-- BIS registrations table (separate from common teams)
create table if not exists public.usj_bis_registrations (
  bis_id text primary key,
  team_name text not null,
  university text not null default 'University of Sri Jayewardenepura',
  created_at timestamp with time zone not null default now()
);

-- Trigger to set bis_id like DHBIS001
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

-- BIS members table (separate copy of members for USJ BIS)
create table if not exists public.usj_bis_members (
  member_id uuid primary key default gen_random_uuid(),
  bis_id text references public.usj_bis_registrations(bis_id) on delete cascade,
  full_name text not null,
  name_with_initials text not null,
  nic char(12) not null,
  university_reg_no text,
  faculty text not null,
  academic_year int not null check (academic_year between 1 and 4),
  email text not null,
  whatsapp_number text not null,
  linkedin_profile text,
  is_leader boolean not null default false
);

-- Constraints and indexes
do $$ begin
  alter table public.usj_bis_members
    add constraint usj_bis_members_nic_format
    check (nic ~ '^[0-9]{12}$');
exception when duplicate_object then null; end $$;

create index if not exists idx_usj_bis_members_bis on public.usj_bis_members(bis_id);

-- BIS Round submissions (separate)
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

-- RLS enablement (duplicated in schema.sql for idempotence)
alter table if exists public.usj_bis_registrations enable row level security;
alter table if exists public.usj_bis_members enable row level security;
alter table if exists public.usj_bis_round_submissions enable row level security;

drop policy if exists usj_bis_regs_select_public on public.usj_bis_registrations;
create policy usj_bis_regs_select_public on public.usj_bis_registrations for select using (true);

drop policy if exists usj_bis_regs_insert_public on public.usj_bis_registrations;
create policy usj_bis_regs_insert_public on public.usj_bis_registrations for insert with check (true);

drop policy if exists usj_bis_round_submissions_insert_public on public.usj_bis_round_submissions;
create policy usj_bis_round_submissions_insert_public on public.usj_bis_round_submissions for insert with check (true);

drop policy if exists usj_bis_members_insert_public on public.usj_bis_members;
create policy usj_bis_members_insert_public on public.usj_bis_members for insert with check (true);


