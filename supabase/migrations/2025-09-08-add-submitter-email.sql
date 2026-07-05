-- Add submitter_nic to submission tables (replacing submitter_email)
-- Safe to run multiple times

-- For common teams
do $$ begin
  alter table public.round_submissions
    add column submitter_nic char(12);
exception when duplicate_column then null; end $$;

-- For BIS teams
do $$ begin
  alter table public.usj_bis_round_submissions
    add column submitter_nic char(12);
exception when duplicate_column then null; end $$;
