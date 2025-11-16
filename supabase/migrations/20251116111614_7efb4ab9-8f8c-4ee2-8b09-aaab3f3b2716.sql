-- Fix search_path security warnings for get_inactive_users_for_promotion
CREATE OR REPLACE FUNCTION get_inactive_users_for_promotion()
RETURNS TABLE (
  id UUID,
  email TEXT,
  clerk_id TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix search_path security warnings for add_promotional_credits
CREATE OR REPLACE FUNCTION add_promotional_credits(
  p_user_id UUID,
  p_promotional_credit_id UUID,
  p_credits_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;