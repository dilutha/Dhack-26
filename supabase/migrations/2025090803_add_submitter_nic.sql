-- Add submitter_nic to submission tables (replacing submitter_email)
-- Safe to run multiple times

-- For common teams
do $$ begin
  alter table public.round_submissions
    add column submitter_nic char(12);
exception when duplicate_column then null; end $$;

-- Add NIC format constraint for common teams
do $$ begin
  alter table public.round_submissions
    add constraint chk_submitter_nic_format
    check (submitter_nic ~ '^(\d{9}V|\d{12})$');
exception when duplicate_object then null; end $$;

-- For BIS teams
do $$ begin
  alter table public.usj_bis_round_submissions
    add column submitter_nic char(12);
exception when duplicate_column then null; end $$;

-- Add NIC format constraint for BIS teams
do $$ begin
  alter table public.usj_bis_round_submissions
    add constraint chk_bis_submitter_nic_format
    check (submitter_nic ~ '^(\d{9}V|\d{12})$');
exception when duplicate_object then null; end $$;
