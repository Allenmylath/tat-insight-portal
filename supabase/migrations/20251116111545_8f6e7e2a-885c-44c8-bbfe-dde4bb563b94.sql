-- Update users table default credit balance to 200
ALTER TABLE users 
ALTER COLUMN credit_balance SET DEFAULT 200;

-- Create promotional credits tracking table
CREATE TABLE promotional_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credit_type VARCHAR(50) NOT NULL,
  credits_amount INTEGER NOT NULL DEFAULT 200,
  claim_token TEXT UNIQUE NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  
  -- Email tracking fields
  email_sent_at TIMESTAMPTZ,
  email_delivery_status VARCHAR(50),
  email_attempts INTEGER DEFAULT 0,
  last_email_attempt_at TIMESTAMPTZ,
  email_error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_promotional_credits_user_id ON promotional_credits(user_id);
CREATE INDEX idx_promotional_credits_token ON promotional_credits(claim_token);
CREATE INDEX idx_promotional_credits_pending_emails ON promotional_credits(email_delivery_status, last_email_attempt_at) 
  WHERE email_delivery_status IN ('pending', 'retry', 'failed');

-- Enable RLS
ALTER TABLE promotional_credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own promotional credits"
  ON promotional_credits FOR SELECT
  USING (user_id IN (
    SELECT id FROM users 
    WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
  ));

CREATE POLICY "Users can claim their own credits"
  ON promotional_credits FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users 
    WHERE clerk_id = (current_setting('request.jwt.claims', true)::json ->> 'clerk_user_id')
  ));

-- Create function to get inactive users for promotion
CREATE OR REPLACE FUNCTION get_inactive_users_for_promotion()
RETURNS TABLE (
  id UUID,
  email TEXT,
  clerk_id TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.clerk_id,
    u.created_at,
    u.last_sign_in_at
  FROM users u
  WHERE 
    u.created_at <= NOW() - INTERVAL '3 days'
    AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at <= NOW() - INTERVAL '3 days')
    AND NOT EXISTS (
      SELECT 1 FROM test_sessions ts 
      WHERE ts.user_id = u.id 
      AND ts.status = 'completed'
    )
    AND NOT EXISTS (
      SELECT 1 FROM promotional_credits pc
      WHERE pc.user_id = u.id 
      AND pc.credit_type = 'inactivity_bonus'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add promotional credits
CREATE OR REPLACE FUNCTION add_promotional_credits(
  p_user_id UUID,
  p_promotional_credit_id UUID,
  p_credits_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  SELECT credit_balance INTO current_balance
  FROM users WHERE id = p_user_id FOR UPDATE;
  
  new_balance := current_balance + p_credits_amount;
  
  UPDATE users 
  SET credit_balance = new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  INSERT INTO credit_transactions (
    user_id, transaction_type, credits_change,
    balance_after, reference_type, reference_id,
    description
  ) VALUES (
    p_user_id, 'promotional', p_credits_amount,
    new_balance, 'promotional_credit', p_promotional_credit_id,
    'Promotional credits claimed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for updated_at
CREATE TRIGGER update_promotional_credits_updated_at
BEFORE UPDATE ON promotional_credits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();