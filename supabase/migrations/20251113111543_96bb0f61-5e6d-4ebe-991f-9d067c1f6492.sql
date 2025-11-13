-- Fix security warning: Set search_path for calculate_session_duration function
CREATE OR REPLACE FUNCTION calculate_session_duration(
  p_session_created_at TIMESTAMPTZ,
  p_session_ended_at TIMESTAMPTZ
) RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_session_ended_at IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(EPOCH FROM (p_session_ended_at - p_session_created_at))::INTEGER;
END;
$$;