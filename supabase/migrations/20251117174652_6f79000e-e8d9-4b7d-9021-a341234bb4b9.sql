-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for proper admin access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id IN (
  SELECT id FROM users 
  WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
));

-- Create test_completers view for targeting free users
CREATE VIEW public.test_completers
WITH (security_invoker=on)
AS
SELECT 
  u.id as user_id,
  u.clerk_id,
  u.email,
  u.first_name,
  u.last_name,
  u.username,
  u.created_at as user_created_at,
  u.credit_balance as current_credit_balance,
  u.last_sign_in_at,
  
  -- Test metrics
  COUNT(DISTINCT ts.id) as total_tests_completed,
  COUNT(DISTINCT ts.id) FILTER (WHERE ts.completed_at >= NOW() - INTERVAL '7 days') as tests_last_7_days,
  COUNT(DISTINCT ts.id) FILTER (WHERE ts.completed_at >= NOW() - INTERVAL '30 days') as tests_last_30_days,
  MIN(ts.completed_at) as first_test_date,
  MAX(ts.completed_at) as last_test_date,
  EXTRACT(DAY FROM (NOW() - MAX(ts.completed_at)))::INTEGER as days_since_last_test,
  
  -- Payment status
  COALESCE(pc.total_purchases, 0) as total_purchases,
  COALESCE(pc.total_amount_spent, 0) as total_spent,
  CASE 
    WHEN pc.user_id IS NULL THEN true 
    ELSE false 
  END as is_free_user,
  
  -- Engagement score for targeting
  CASE 
    WHEN COUNT(DISTINCT ts.id) >= 3 AND pc.user_id IS NULL THEN 'hot_lead'
    WHEN COUNT(DISTINCT ts.id) >= 2 AND pc.user_id IS NULL THEN 'warm_lead'
    WHEN COUNT(DISTINCT ts.id) = 1 AND pc.user_id IS NULL THEN 'cold_lead'
    ELSE 'converted'
  END as lead_status

FROM users u
INNER JOIN test_sessions ts ON u.id = ts.user_id AND ts.status = 'completed'
LEFT JOIN paying_customers pc ON u.id = pc.user_id
GROUP BY u.id, u.clerk_id, u.email, u.first_name, u.last_name, u.username, 
         u.created_at, u.credit_balance, u.last_sign_in_at, pc.user_id, 
         pc.total_purchases, pc.total_amount_spent
ORDER BY total_tests_completed DESC, last_test_date DESC;

COMMENT ON VIEW public.test_completers IS 'View of users who completed at least one test, with engagement metrics for campaign targeting';

-- Create email_campaigns table
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign basics
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'conversion',
  
  -- Email content
  subject_line TEXT NOT NULL,
  email_body TEXT NOT NULL,
  preview_text TEXT,
  
  -- Targeting
  target_audience JSONB NOT NULL DEFAULT '{"is_free_user": true}'::jsonb,
  
  -- Offer details
  offer_code TEXT,
  offer_type TEXT,
  offer_value NUMERIC,
  offer_expires_at TIMESTAMPTZ,
  
  -- Campaign scheduling
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  
  -- Sending constraints
  max_recipients INTEGER,
  cooldown_days INTEGER DEFAULT 7,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  
  -- Analytics
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Only admins can manage campaigns
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns FOR ALL
TO authenticated
USING (public.has_role((SELECT id FROM users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')), 'admin'))
WITH CHECK (public.has_role((SELECT id FROM users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')), 'admin'));

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_for ON email_campaigns(scheduled_for) WHERE status = 'scheduled';

-- Create campaign_sends table
CREATE TABLE public.campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email details
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  
  -- Metadata
  user_data JSONB,
  
  UNIQUE(campaign_id, user_id)
);

ALTER TABLE public.campaign_sends ENABLE ROW LEVEL SECURITY;

-- Admins can view all sends
CREATE POLICY "Admins can view campaign sends"
ON public.campaign_sends FOR SELECT
TO authenticated
USING (public.has_role((SELECT id FROM users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')), 'admin'));

CREATE INDEX idx_campaign_sends_campaign_id ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_user_id ON campaign_sends(user_id);
CREATE INDEX idx_campaign_sends_sent_at ON campaign_sends(sent_at DESC);

-- Create email_preferences table
CREATE TABLE public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Preferences
  unsubscribed_from_marketing BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage own email preferences"
ON public.email_preferences FOR ALL
TO authenticated
USING (user_id IN (
  SELECT id FROM users 
  WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
))
WITH CHECK (user_id IN (
  SELECT id FROM users 
  WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
));

-- Create trigger for conversion tracking
CREATE OR REPLACE FUNCTION track_campaign_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a purchase is completed, mark recent campaign sends as converted
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE campaign_sends
    SET converted_at = NOW()
    WHERE user_id = NEW.user_id
      AND sent_at >= NOW() - INTERVAL '30 days'
      AND converted_at IS NULL;
    
    -- Update campaign analytics
    UPDATE email_campaigns
    SET total_converted = (
      SELECT COUNT(DISTINCT user_id)
      FROM campaign_sends
      WHERE campaign_id = email_campaigns.id
        AND converted_at IS NOT NULL
    )
    WHERE id IN (
      SELECT campaign_id
      FROM campaign_sends
      WHERE user_id = NEW.user_id
        AND converted_at IS NOT NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER track_purchase_conversion
AFTER UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION track_campaign_conversion();

-- Create trigger for updated_at
CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON email_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at
BEFORE UPDATE ON email_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();