-- ==========================================================
-- Create Events Table
-- DHACK Event & Submission Window Management
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    description TEXT,

    category TEXT NOT NULL,

    type TEXT NOT NULL,

    start_at TIMESTAMPTZ NOT NULL,

    end_at TIMESTAMPTZ NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- Indexes
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_events_category
ON public.events(category);

CREATE INDEX IF NOT EXISTS idx_events_type
ON public.events(type);

CREATE INDEX IF NOT EXISTS idx_events_active
ON public.events(is_active);

CREATE INDEX IF NOT EXISTS idx_events_dates
ON public.events(start_at, end_at);

-- Prevent duplicate event definitions
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique
ON public.events(name, category, type);

-- ==========================================================
-- Enable RLS
-- ==========================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- Public Read Access
-- ==========================================================

DROP POLICY IF EXISTS "Public can view events"
ON public.events;

CREATE POLICY "Public can view events"
ON public.events
FOR SELECT
USING (true);

-- ==========================================================
-- Authenticated users can manage events
-- (Adjust later if you introduce admin roles)
-- ==========================================================

DROP POLICY IF EXISTS "Authenticated users manage events"
ON public.events;

CREATE POLICY "Authenticated users manage events"
ON public.events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==========================================================
-- Auto update updated_at
-- ==========================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at
ON public.events;

CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE
ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();