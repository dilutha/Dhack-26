-- ==========================
-- DHack 2026 - Rebrand Track
-- ==========================

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Applications Open',
'Applications open for the Rebrand competition',
'redesign',
'registration',
'2026-07-08T00:00:00+05:30',
'2026-07-20T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Registration Extended',
'Extended registration period',
'redesign',
'registration',
'2026-07-25T00:00:00+05:30',
'2026-07-25T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Round 1 Opens',
'Inauguration and Round 1 begins',
'redesign',
'round1',
'2026-07-26T00:00:00+05:30',
'2026-07-26T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Round 1 Deadline',
'Round 1 submission deadline',
'redesign',
'deadline',
'2026-08-01T00:00:00+05:30',
'2026-08-01T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Round 1 Deadline Extended',
'Extended Round 1 submission deadline',
'redesign',
'deadline_extension',
'2026-08-03T00:00:00+05:30',
'2026-08-03T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Round 1 Results',
'Announcement of Round 1 results',
'redesign',
'results',
'2026-08-12T00:00:00+05:30',
'2026-08-15T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Round 2 Opens',
'Round 2 inauguration',
'redesign',
'round2',
'2026-08-16T00:00:00+05:30',
'2026-08-16T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Round 2 Deadline',
'Round 2 submission deadline',
'redesign',
'deadline',
'2026-08-23T00:00:00+05:30',
'2026-08-23T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Round 2 Deadline Extended',
'Extended Round 2 submission deadline',
'redesign',
'deadline_extension',
'2026-08-26T00:00:00+05:30',
'2026-08-26T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Finalist Announcement',
'Announcement of finalists',
'redesign',
'announcement',
'2026-09-06T00:00:00+05:30',
'2026-09-06T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Rebrand Hackathon',
'Final hackathon event',
'redesign',
'hackathon',
'2026-09-10T00:00:00+05:30',
'2026-09-10T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

INSERT INTO public.events (name, description, category, type, start_at, end_at)
VALUES
(
'Grand Finale',
'DHack 2026 Grand Finale',
'redesign',
'final',
'2026-09-11T00:00:00+05:30',
'2026-09-11T23:59:59+05:30'
)
ON CONFLICT (name, category, type)
DO UPDATE SET
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;