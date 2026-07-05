-- Update NIC format constraints to accept both old (9+V) and new (12 digits) formats
-- Safe to run multiple times

-- Update members table constraint
do $$ begin
  alter table public.members
    drop constraint if exists members_nic_format;
  alter table public.members
    add constraint members_nic_format
    check (nic ~ '^(\d{9}V|\d{12})$');
exception when duplicate_object then null; end $$;

-- Update BIS members table constraint
do $$ begin
  alter table public.usj_bis_members
    drop constraint if exists usj_bis_members_nic_format;
  alter table public.usj_bis_members
    add constraint usj_bis_members_nic_format
    check (nic ~ '^(\d{9}V|\d{12})$');
exception when duplicate_object then null; end $$;
