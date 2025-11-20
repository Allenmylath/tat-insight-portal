-- Add SSB questions columns to analysis_results
ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS ssb_questions JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ssb_questions_generated_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN analysis_results.ssb_questions IS 'SSB interview questions for Pro users, generated on-demand';
COMMENT ON COLUMN analysis_results.ssb_questions_generated_at IS 'Timestamp when SSB questions were generated';

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  duration_days INTEGER DEFAULT 30,
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription_orders table
CREATE TABLE IF NOT EXISTS subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  merchant_order_id TEXT UNIQUE NOT NULL,
  phonepe_order_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'CREATED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  payment_completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  redirect_url TEXT,
  payment_metadata JSONB
);

-- Add updated_at trigger for subscription_plans
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for subscription_orders
CREATE TRIGGER update_subscription_orders_updated_at
BEFORE UPDATE ON subscription_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on subscription tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" 
ON subscription_plans FOR SELECT 
USING (is_active = true);

-- RLS Policies for subscription_orders
CREATE POLICY "Users can view own subscriptions" 
ON subscription_orders FOR SELECT 
USING (user_id IN (
  SELECT id FROM users 
  WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')
));

CREATE POLICY "Users can create own subscriptions" 
ON subscription_orders FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM users 
  WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')
));

-- Insert Pro Monthly Plan
INSERT INTO subscription_plans (name, price, currency, duration_days, features)
VALUES (
  'Pro Monthly',
  500,
  'INR',
  30,
  '["SSB Interview Questions", "Unlimited Test Access", "Advanced Analytics", "Priority Support", "Expert Consultation Access"]'::jsonb
)
ON CONFLICT (name) DO NOTHING;