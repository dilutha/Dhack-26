-- Align DHACK'26 event schedule and registration constraints with the public site.

do $$ begin
  alter type public.event_category add value if not exists 'rebrand';
exception when undefined_object then null; end $$;

create unique index if not exists idx_events_unique_schedule_key
  on public.events(name, category, start_at);

insert into public.events (name, description, category, type, start_at, end_at)
values
  (
    'Registration Open',
    'Team registration opens for all DHACK 2026 competitions.',
    'innovation',
    'registration',
    '2026-06-07T00:00:00+05:30',
    '2026-06-07T23:59:59+05:30'
  ),
  (
    'Registration Closed',
    'Final day for Inter-University, InterSchool, and ReBrand registrations.',
    'innovation',
    'registration',
    '2026-07-07T00:00:00+05:30',
    '2026-07-07T23:59:59+05:30'
  ),
  (
    'First Round',
    'Initial judging round for registered DHACK 2026 teams.',
    'innovation',
    'proposal',
    '2026-07-20T00:00:00+05:30',
    '2026-07-20T23:59:59+05:30'
  ),
  (
    'Second Round',
    'Selected teams progress into the second evaluation round.',
    'innovation',
    'wireframe',
    '2026-08-07T00:00:00+05:30',
    '2026-08-07T23:59:59+05:30'
  ),
  (
    'Final Round',
    'Final competition round for top DHACK 2026 teams.',
    'innovation',
    'final',
    '2026-09-01T00:00:00+05:30',
    '2026-09-01T23:59:59+05:30'
  ),
  (
    'ReBrand Hackathon',
    'FMSC-exclusive ReBrand Hackathon. Exact September date to be announced.',
    'rebrand',
    'final',
    '2026-09-15T00:00:00+05:30',
    '2026-09-15T23:59:59+05:30'
  )
on conflict (name, category, start_at) do update set
  description = excluded.description,
  type = excluded.type,
  end_at = excluded.end_at,
  updated_at = now();

update public.competitions
set
  min_members = 3,
  max_members = 3,
  exact_members = 3,
  eligibility_rules =
    '{"eligibility":["Recognized universities"],"collect":["University","Faculty","Degree Program","Student ID"],"team_size":"exactly 3"}'::jsonb,
  updated_at = now()
where category = 'inter_university';

update public.competitions
set
  min_members = 5,
  max_members = 5,
  exact_members = 5,
  eligibility_rules =
    '{"eligibility":["FMSC, University of Sri Jayewardenepura"],"rules":["Exactly 5 members","Exactly 3 BIS students","Exactly 2 other FMSC department students"],"collect":["Department","Degree Program","CPM NO"]}'::jsonb,
  updated_at = now()
where category = 'rebrand';

create or replace function public.fn_enforce_dhack_2026_team_rules()
returns trigger language plpgsql as $$
declare
  member_count int;
  bis_count int;
  bad_rebrand_count int;
  bad_rebrand_non_bis_count int;
  team_category public.competition_category;
begin
  select category into team_category
  from public.teams
  where team_id = coalesce(new.team_id, old.team_id);

  select count(*) into member_count
  from public.team_members
  where team_id = coalesce(new.team_id, old.team_id);

  if team_category = 'inter_university' and member_count > 3 then
    raise exception 'Inter-University teams must have exactly 3 members.';
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

    select count(*) into bad_rebrand_non_bis_count
    from public.team_members
    where team_id = coalesce(new.team_id, old.team_id)
      and bis_status = false
      and coalesce(department, '') = 'Business Information Systems';

    if bad_rebrand_count > 0 then
      raise exception 'All ReBrand members must be FMSC students.';
    end if;

    if member_count = 5 and bis_count <> 3 then
      raise exception 'ReBrand teams require exactly 3 BIS students and 2 other FMSC members.';
    end if;

    if bad_rebrand_non_bis_count > 0 then
      raise exception 'Non-BIS ReBrand members must be from another FMSC department.';
    end if;
  end if;

  return coalesce(new, old);
end; $$;
