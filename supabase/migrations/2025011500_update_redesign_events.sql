-- Update redesign events to match new 2-round structure
-- Round 1: Wireframe submission
-- Round 2: Hackathon submission (final type)

-- Update the existing "Redesign Proposal" event to "Wireframe Submission"
UPDATE public.events 
SET 
  name = 'Wireframe Submission',
  type = 'wireframe',
  description = 'Submit your wireframe designs for redesign category'
WHERE 
  name = 'Redesign Proposal' 
  AND category = 'redesign';

-- Update the existing "Hackathon" event to "Hackathon Submission" and change type to 'final'
UPDATE public.events 
SET 
  name = 'Hackathon Submission',
  type = 'final',
  description = 'Submit your final hackathon project for redesign category'
WHERE 
  name = 'Hackathon' 
  AND category = 'redesign';

-- Add a new event for Innovation Round 2 (Wireframe) if it doesn't exist
INSERT INTO public.events (name, description, category, type, start_at, end_at)
SELECT 'Wireframe Submission', 'Submit your wireframe designs for innovation category', 'innovation', 'wireframe',
       '2025-10-05T00:00:00+05:30', '2025-10-11T23:59:59+05:30'
WHERE NOT EXISTS (
  SELECT 1 FROM public.events 
  WHERE name = 'Wireframe Submission' 
  AND category = 'innovation' 
  AND type = 'wireframe'
);

-- Add a new event for Innovation Round 3 (Final) if it doesn't exist
INSERT INTO public.events (name, description, category, type, start_at, end_at)
SELECT 'Final Submission', 'Submit your final project and video for innovation category', 'innovation', 'final',
       '2025-10-22T00:00:00+05:30', '2025-10-27T23:59:59+05:30'
WHERE NOT EXISTS (
  SELECT 1 FROM public.events 
  WHERE name = 'Final Submission' 
  AND category = 'innovation' 
  AND type = 'final'
);
