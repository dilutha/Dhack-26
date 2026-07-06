-- Remove registration_source column safely
do $$ begin
  alter table public.teams drop column if exists registration_source;
exception when undefined_column then null; end $$;


