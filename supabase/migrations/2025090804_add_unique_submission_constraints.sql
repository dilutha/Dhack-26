-- Add unique constraints to prevent multiple submissions per team per round
-- Safe to run multiple times

-- For common teams
do $$ begin
  alter table public.round_submissions
    add constraint unique_team_round_submission
    unique (team_id, round_id);
exception when duplicate_object then null; end $$;

-- For BIS teams
do $$ begin
  alter table public.usj_bis_round_submissions
    add constraint unique_bis_round_submission
    unique (bis_id, round_id);
exception when duplicate_object then null; end $$;
