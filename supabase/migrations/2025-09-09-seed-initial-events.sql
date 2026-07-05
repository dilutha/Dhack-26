-- Seed initial events based on provided timeline.
-- Idempotent: inserts only if a matching (name, category, start_at) does not already exist.
-- No destructive operations.

-- =============
-- Innovation
-- =============
insert into public.events (name, description, category, type, start_at, end_at)
select 'Registration', 'Registration window', 'innovation', 'registration',
       '2025-09-13T00:00:00+05:30', '2025-09-19T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Registration' and category = 'innovation' and start_at = '2025-09-13T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Awareness Session', null, 'innovation', 'awareness',
       '2025-09-20T00:00:00+05:30', '2025-09-20T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Awareness Session' and category = 'innovation' and start_at = '2025-09-20T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Design Thinking Workshop', null, 'innovation', 'workshop',
       '2025-09-22T00:00:00+05:30', '2025-09-22T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Design Thinking Workshop' and category = 'innovation' and start_at = '2025-09-22T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Initial Round (Proposal)', null, 'innovation', 'proposal',
       '2025-09-21T00:00:00+05:30', '2025-09-25T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Initial Round (Proposal)' and category = 'innovation' and start_at = '2025-09-21T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Judging Round', null, 'innovation', 'judging',
       '2025-09-27T00:00:00+05:30', '2025-10-03T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Judging Round' and category = 'innovation' and start_at = '2025-09-27T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'UI Tools Workshop', null, 'innovation', 'workshop',
       '2025-09-27T00:00:00+05:30', '2025-10-03T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'UI Tools Workshop' and category = 'innovation' and start_at = '2025-09-27T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Announce the winners (Initial Round)', null, 'innovation', 'announcement',
       '2025-10-04T00:00:00+05:30', '2025-10-04T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Announce the winners (Initial Round)' and category = 'innovation' and start_at = '2025-10-04T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Semi-Final Round', null, 'innovation', 'judging',
       '2025-10-05T00:00:00+05:30', '2025-10-11T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Semi-Final Round' and category = 'innovation' and start_at = '2025-10-05T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Judging Round', null, 'innovation', 'judging',
       '2025-10-13T00:00:00+05:30', '2025-10-19T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Judging Round' and category = 'innovation' and start_at = '2025-10-13T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Ideas for Reality Workshop', null, 'innovation', 'workshop',
       '2025-10-13T00:00:00+05:30', '2025-10-19T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Ideas for Reality Workshop' and category = 'innovation' and start_at = '2025-10-13T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Announce the winners (Semi-Final)', null, 'innovation', 'announcement',
       '2025-10-20T00:00:00+05:30', '2025-10-20T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Announce the winners (Semi-Final)' and category = 'innovation' and start_at = '2025-10-20T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Final Round', null, 'innovation', 'final',
       '2025-10-22T00:00:00+05:30', '2025-10-27T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Final Round' and category = 'innovation' and start_at = '2025-10-22T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Final Ceremony', null, 'innovation', 'ceremony',
       '2025-11-01T00:00:00+05:30', '2025-11-01T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Final Ceremony' and category = 'innovation' and start_at = '2025-11-01T00:00:00+05:30'
);

-- =============
-- Redesign
-- =============
insert into public.events (name, description, category, type, start_at, end_at)
select 'Redesign Meeting', null, 'redesign', 'meeting',
       '2025-10-16T00:00:00+05:30', '2025-10-16T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Redesign Meeting' and category = 'redesign' and start_at = '2025-10-16T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Redesign Proposal', null, 'redesign', 'proposal',
       '2025-10-17T00:00:00+05:30', '2025-10-22T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Redesign Proposal' and category = 'redesign' and start_at = '2025-10-17T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Redesign Proposal Judging', null, 'redesign', 'judging',
       '2025-10-23T00:00:00+05:30', '2025-10-28T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Redesign Proposal Judging' and category = 'redesign' and start_at = '2025-10-23T00:00:00+05:30'
);

insert into public.events (name, description, category, type, start_at, end_at)
select 'Hackathon', null, 'redesign', 'ceremony',
       '2025-11-01T00:00:00+05:30', '2025-11-01T23:59:59+05:30'
where not exists (
  select 1 from public.events where name = 'Hackathon' and category = 'redesign' and start_at = '2025-11-01T00:00:00+05:30'
);


