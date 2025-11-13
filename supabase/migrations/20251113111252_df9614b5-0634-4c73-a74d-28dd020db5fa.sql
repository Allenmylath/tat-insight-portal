-- Part 1: Enhance existing users table with analytics fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_two_factor BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_email_id TEXT;

-- Add indexes for common queries on users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_last_sign_in ON users(last_sign_in_at);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);

-- Part 2: Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  client_id TEXT,
  
  -- Session lifecycle
  status TEXT,
  event_type TEXT,
  session_created_at TIMESTAMPTZ,
  session_ended_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  expire_at TIMESTAMPTZ,
  abandon_at TIMESTAMPTZ,
  
  -- Device & browser info
  browser_name TEXT,
  browser_version TEXT,
  device_type TEXT,
  is_mobile BOOLEAN,
  user_agent TEXT,
  
  -- Location data
  ip_address TEXT,
  city TEXT,
  country TEXT,
  
  -- Organization context
  organization_id TEXT,
  
  -- Calculated metrics
  session_duration_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for user_sessions table
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_clerk_user_id ON user_sessions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(session_created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country ON user_sessions(country);
CREATE INDEX IF NOT EXISTS idx_user_sessions_city ON user_sessions(city);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_type ON user_sessions(device_type);

COMMENT ON TABLE user_sessions IS 'Tracks all user authentication sessions with device, location, and lifecycle data';

-- Part 3: Create user_activity_summary table
CREATE TABLE IF NOT EXISTS user_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT UNIQUE NOT NULL,
  
  -- Session metrics
  total_sessions INTEGER DEFAULT 0,
  total_session_duration_seconds BIGINT DEFAULT 0,
  first_session_at TIMESTAMPTZ,
  last_session_at TIMESTAMPTZ,
  sessions_last_7_days INTEGER DEFAULT 0,
  sessions_last_30_days INTEGER DEFAULT 0,
  
  -- Device & location metrics
  unique_devices_count INTEGER DEFAULT 0,
  unique_locations_count INTEGER DEFAULT 0,
  primary_device_type TEXT,
  primary_browser TEXT,
  primary_country TEXT,
  primary_city TEXT,
  is_mobile_user BOOLEAN DEFAULT false,
  
  -- Engagement metrics
  days_since_last_login INTEGER,
  average_sessions_per_week NUMERIC(10,2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for user_activity_summary table
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_clerk_user_id ON user_activity_summary(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_session ON user_activity_summary(last_session_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_sessions_7d ON user_activity_summary(sessions_last_7_days);
CREATE INDEX IF NOT EXISTS idx_user_activity_sessions_30d ON user_activity_summary(sessions_last_30_days);
CREATE INDEX IF NOT EXISTS idx_user_activity_primary_country ON user_activity_summary(primary_country);

COMMENT ON TABLE user_activity_summary IS 'Pre-aggregated user activity metrics for fast analytics queries';

-- Part 4: Enable RLS on new tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;

-- Part 5: Create RLS policies for user_sessions
CREATE POLICY "Service role full access on user_sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')
    )
  );

-- Part 6: Create RLS policies for user_activity_summary
CREATE POLICY "Service role full access on user_activity_summary"
  ON user_activity_summary
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own activity summary"
  ON user_activity_summary
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')
    )
  );

-- Part 7: Create triggers for updated_at
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_summary_updated_at
  BEFORE UPDATE ON user_activity_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Part 8: Helper function to calculate session duration
CREATE OR REPLACE FUNCTION calculate_session_duration(
  p_session_created_at TIMESTAMPTZ,
  p_session_ended_at TIMESTAMPTZ
) RETURNS INTEGER AS $$
BEGIN
  IF p_session_ended_at IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(EPOCH FROM (p_session_ended_at - p_session_created_at))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Part 9: Helper function to refresh user_activity_summary
CREATE OR REPLACE FUNCTION refresh_user_activity_summary(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_clerk_user_id TEXT;
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
  -- Get clerk_user_id
  SELECT clerk_id INTO v_clerk_user_id FROM users WHERE id = p_user_id;
  
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
    
  -- Also update users table total_sessions
  UPDATE users 
  SET last_active_at = v_last_session
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;