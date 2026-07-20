-- ReBrand: allow 3-5 BIS students per team (exactly 5 members total)

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

    if member_count = 5 and (bis_count < 3 or bis_count > 5) then
      raise exception 'ReBrand teams require between 3 and 5 BIS students.';
    end if;

    if bad_rebrand_non_bis_count > 0 then
      raise exception 'Non-BIS ReBrand members must be from another FMSC department.';
    end if;
  end if;

  return coalesce(new, old);
end; $$;
