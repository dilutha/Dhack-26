-- Create admins table for admin authentication
-- Run this in your Supabase SQL editor or as a migration

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS (Row Level Security)
alter table public.admins enable row level security;

-- Create policy to allow service role to read admins table
create policy "Service role can read admins" on public.admins
  for select using (auth.role() = 'service_role');

-- Insert your admin email(s) here
-- Replace 'your-admin-email@example.com' with actual admin email
insert into public.admins (email, full_name)
values
  ('your-admin-email@example.com', 'Admin User')
on conflict (email) do nothing;

-- Create updated_at trigger
create or replace function public.fn_admins_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists tr_admins_touch on public.admins;
create trigger tr_admins_touch before update on public.admins
for each row execute function public.fn_admins_touch_updated_at();
