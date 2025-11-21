-- Add columns to track SSB generation state
ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS ssb_generation_in_progress BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ssb_generation_started_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_results_ssb_generation 
ON analysis_results(ssb_generation_in_progress) 
WHERE ssb_generation_in_progress = true;

-- Add a function to reset stuck generations
CREATE OR REPLACE FUNCTION reset_stuck_ssb_generations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Reset any generation that has been running for more than 5 minutes
  UPDATE analysis_results
  SET 
    ssb_generation_in_progress = false,
    ssb_generation_started_at = NULL
  WHERE 
    ssb_generation_in_progress = true 
    AND ssb_generation_started_at < NOW() - INTERVAL '5 minutes';
END;
$$;