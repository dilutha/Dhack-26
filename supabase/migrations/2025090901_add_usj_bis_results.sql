-- Add USJ BIS results table to track round results for BIS teams
-- This table is needed for proper round gating

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

-- Touch updated_at trigger
create or replace function public.fn_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists tr_usj_bis_results_touch on public.usj_bis_results;
create trigger tr_usj_bis_results_touch before update on public.usj_bis_results
for each row execute function public.fn_touch_updated_at();

-- Indexes
create index if not exists idx_usj_bis_results_bis on public.usj_bis_results(bis_id);
create index if not exists idx_usj_bis_results_round on public.usj_bis_results(round_id);
create index if not exists idx_usj_bis_results_bis_round on public.usj_bis_results(bis_id, round_id);

-- Enable RLS
alter table if exists public.usj_bis_results enable row level security;

-- Public read policy for results (needed for access control checks)
drop policy if exists usj_bis_results_select_public on public.usj_bis_results;
create policy usj_bis_results_select_public on public.usj_bis_results for select using (true);
