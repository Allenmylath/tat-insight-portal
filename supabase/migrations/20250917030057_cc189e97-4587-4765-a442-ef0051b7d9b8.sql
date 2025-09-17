-- Add time_remaining column to test_sessions table
ALTER TABLE public.test_sessions 
ADD COLUMN time_remaining INTEGER;

-- Set default value for existing records (they can recover using the old calculation method if needed)
UPDATE public.test_sessions 
SET time_remaining = session_duration_seconds 
WHERE time_remaining IS NULL AND status = 'active';