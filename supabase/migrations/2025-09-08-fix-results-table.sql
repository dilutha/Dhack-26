-- Fix results table to support both regular teams (DH###) and BIS teams (DHBIS###)
-- Remove the restrictive foreign key constraint that only allows teams.team_id

-- First, drop the existing foreign key constraint
ALTER TABLE public.results DROP CONSTRAINT IF EXISTS results_team_id_fkey;

-- Add a check constraint to ensure team_id follows the correct format
ALTER TABLE public.results ADD CONSTRAINT results_team_id_format
CHECK (team_id ~ '^DH(BIS)?\d{3}$');

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_results_team_id ON public.results(team_id);
