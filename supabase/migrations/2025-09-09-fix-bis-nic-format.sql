-- Ensure BIS members NIC accepts 9 digits + V (uppercase) or 12 digits
-- and trim whitespace before validation using a generated column for check

do $$ begin
  alter table public.usj_bis_members
    drop constraint if exists usj_bis_members_nic_format;
exception when undefined_object then null; end $$;

-- Normalize NIC format via constraint using regexp on trimmed NIC
do $$ begin
  alter table public.usj_bis_members
    add constraint usj_bis_members_nic_format
    check (regexp_replace(nic, '\\s+', '', 'g') ~ '^(\\d{9}V|\\d{12})$');
exception when duplicate_object then null; end $$;



