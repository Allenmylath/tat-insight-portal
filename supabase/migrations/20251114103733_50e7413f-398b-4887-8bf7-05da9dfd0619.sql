-- Add user_email column to user_activity_summary
ALTER TABLE user_activity_summary 
ADD COLUMN user_email TEXT;

-- Create index for faster email lookups
CREATE INDEX idx_user_activity_summary_email ON user_activity_summary(user_email);

-- Update the refresh_user_activity_summary function to include email
CREATE OR REPLACE FUNCTION public.refresh_user_activity_summary(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_clerk_user_id TEXT;
  v_user_email TEXT;
  v_total_sessions INTEGER;
  v_total_duration BIGINT;
  v_first_session TIMESTAMPTZ;
  v_last_session TIMESTAMPTZ;
  v_sessions_7d INTEGER;
  v_sessions_30d INTEGER;
  v_unique_devices INTEGER;
  v_unique_locations INTEGER;
  v_primary_device TEXT;
  v_primary_browser TEXT;
  v_primary_country TEXT;
  v_primary_city TEXT;
  v_is_mobile BOOLEAN;
  v_days_since_login INTEGER;
  v_avg_sessions_per_week NUMERIC(10,2);
BEGIN
  -- Get clerk_user_id and email
  SELECT clerk_id, email INTO v_clerk_user_id, v_user_email 
  FROM users 
  WHERE id = p_user_id;
  
  IF v_clerk_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculate metrics from user_sessions
  SELECT 
    COUNT(*),
    COALESCE(SUM(session_duration_seconds), 0),
    MIN(session_created_at),
    MAX(session_created_at),
    COUNT(*) FILTER (WHERE session_created_at >= now() - INTERVAL '7 days'),
    COUNT(*) FILTER (WHERE session_created_at >= now() - INTERVAL '30 days'),
    COUNT(DISTINCT device_type),
    COUNT(DISTINCT country || '_' || city),
    MODE() WITHIN GROUP (ORDER BY device_type),
    MODE() WITHIN GROUP (ORDER BY browser_name),
    MODE() WITHIN GROUP (ORDER BY country),
    MODE() WITHIN GROUP (ORDER BY city),
    BOOL_OR(is_mobile)
  INTO 
    v_total_sessions,
    v_total_duration,
    v_first_session,
    v_last_session,
    v_sessions_7d,
    v_sessions_30d,
    v_unique_devices,
    v_unique_locations,
    v_primary_device,
    v_primary_browser,
    v_primary_country,
    v_primary_city,
    v_is_mobile
  FROM user_sessions
  WHERE user_id = p_user_id;
  
  -- Calculate days since last login
  v_days_since_login := EXTRACT(DAY FROM (now() - v_last_session))::INTEGER;
  
  -- Calculate average sessions per week
  IF v_first_session IS NOT NULL THEN
    v_avg_sessions_per_week := v_total_sessions::NUMERIC / 
      GREATEST(EXTRACT(DAY FROM (now() - v_first_session))::NUMERIC / 7, 1);
  END IF;
  
  -- Upsert into user_activity_summary
  INSERT INTO user_activity_summary (
    user_id,
    clerk_user_id,
    user_email,
    total_sessions,
    total_session_duration_seconds,
    first_session_at,
    last_session_at,
    sessions_last_7_days,
    sessions_last_30_days,
    unique_devices_count,
    unique_locations_count,
    primary_device_type,
    primary_browser,
    primary_country,
    primary_city,
    is_mobile_user,
    days_since_last_login,
    average_sessions_per_week
  ) VALUES (
    p_user_id,
    v_clerk_user_id,
    v_user_email,
    v_total_sessions,
    v_total_duration,
    v_first_session,
    v_last_session,
    v_sessions_7d,
    v_sessions_30d,
    v_unique_devices,
    v_unique_locations,
    v_primary_device,
    v_primary_browser,
    v_primary_country,
    v_primary_city,
    v_is_mobile,
    v_days_since_login,
    v_avg_sessions_per_week
  )
  ON CONFLICT (user_id) DO UPDATE SET
    clerk_user_id = EXCLUDED.clerk_user_id,
    user_email = EXCLUDED.user_email,
    total_sessions = EXCLUDED.total_sessions,
    total_session_duration_seconds = EXCLUDED.total_session_duration_seconds,
    first_session_at = EXCLUDED.first_session_at,
    last_session_at = EXCLUDED.last_session_at,
    sessions_last_7_days = EXCLUDED.sessions_last_7_days,
    sessions_last_30_days = EXCLUDED.sessions_last_30_days,
    unique_devices_count = EXCLUDED.unique_devices_count,
    unique_locations_count = EXCLUDED.unique_locations_count,
    primary_device_type = EXCLUDED.primary_device_type,
    primary_browser = EXCLUDED.primary_browser,
    primary_country = EXCLUDED.primary_country,
    primary_city = EXCLUDED.primary_city,
    is_mobile_user = EXCLUDED.is_mobile_user,
    days_since_last_login = EXCLUDED.days_since_last_login,
    average_sessions_per_week = EXCLUDED.average_sessions_per_week,
    updated_at = now();
    
  -- Also update users table last_active_at
  UPDATE users 
  SET last_active_at = v_last_session
  WHERE id = p_user_id;
END;
$function$;

-- Backfill existing records with user emails
UPDATE user_activity_summary uas
SET user_email = u.email
FROM users u
WHERE uas.user_id = u.id
  AND uas.user_email IS NULL;