-- Add credit tracking columns to users table
ALTER TABLE public.users 
ADD COLUMN credit_balance INTEGER NOT NULL DEFAULT 0,
ADD COLUMN total_credits_purchased INTEGER NOT NULL DEFAULT 0,
ADD COLUMN total_credits_spent INTEGER NOT NULL DEFAULT 0;

-- Modify purchases table for credit purchases
-- Remove tattest_id foreign key constraint and column
ALTER TABLE public.purchases DROP COLUMN IF EXISTS tattest_id;

-- Remove stripe-specific column
ALTER TABLE public.purchases DROP COLUMN IF EXISTS stripe_payment_intent_id;

-- Add credit purchase columns
ALTER TABLE public.purchases 
ADD COLUMN credits_purchased INTEGER NOT NULL DEFAULT 0,
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN payment_reference VARCHAR(255),
ADD COLUMN package_name VARCHAR(100);

-- Update currency default to INR
ALTER TABLE public.purchases ALTER COLUMN currency SET DEFAULT 'INR';

-- Update status column to support more states
ALTER TABLE public.purchases 
DROP CONSTRAINT IF EXISTS purchases_status_check,
ADD CONSTRAINT purchases_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'));

-- Create credit packages table
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on credit packages
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing active credit packages
CREATE POLICY "Anyone can view active credit packages" 
ON public.credit_packages 
FOR SELECT 
USING (is_active = true);

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'test_usage', 'refund', 'bonus', 'adjustment')),
  credits_change INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on credit transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own transactions
CREATE POLICY "Users can view their own credit transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (user_id IN (
  SELECT users.id FROM users 
  WHERE users.clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text)
));

-- Create policy for inserting credit transactions
CREATE POLICY "Users can create their own credit transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT users.id FROM users 
  WHERE users.clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text)
));

-- Insert default credit packages
INSERT INTO public.credit_packages (name, description, credits, price, is_popular, sort_order) VALUES
('Basic Pack', '100 credits for TAT tests', 100, 100.00, false, 1),
('Value Pack', '500 credits for TAT tests', 500, 500.00, true, 2),
('Bulk Pack', '1000 credits for TAT tests', 1000, 1000.00, false, 3);

-- Create function to safely deduct credits for tests
CREATE OR REPLACE FUNCTION public.deduct_credits_for_test(
  p_user_id UUID,
  p_test_session_id UUID,
  p_credits_needed INTEGER DEFAULT 100
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
  -- Get current balance with row lock
  SELECT credit_balance INTO current_balance
  FROM users 
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user has sufficient credits
  IF current_balance < p_credits_needed THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - p_credits_needed;
  
  -- Update user balance and total spent
  UPDATE users 
  SET 
    credit_balance = new_balance,
    total_credits_spent = total_credits_spent + p_credits_needed,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    credits_change,
    balance_after,
    reference_type,
    reference_id,
    description
  ) VALUES (
    p_user_id,
    'test_usage',
    -p_credits_needed,
    new_balance,
    'test_session',
    p_test_session_id,
    'Credits deducted for TAT test'
  );
  
  RETURN TRUE;
END;
$$;

-- Create function to add credits after purchase
CREATE OR REPLACE FUNCTION public.add_credits_after_purchase(
  p_user_id UUID,
  p_purchase_id UUID,
  p_credits_purchased INTEGER
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
  -- Get current balance with row lock
  SELECT credit_balance INTO current_balance
  FROM users 
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Calculate new balance
  new_balance := current_balance + p_credits_purchased;
  
  -- Update user balance and total purchased
  UPDATE users 
  SET 
    credit_balance = new_balance,
    total_credits_purchased = total_credits_purchased + p_credits_purchased,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    credits_change,
    balance_after,
    reference_type,
    reference_id,
    description
  ) VALUES (
    p_user_id,
    'purchase',
    p_credits_purchased,
    new_balance,
    'credit_purchase',
    p_purchase_id,
    'Credits added from purchase'
  );
  
  RETURN TRUE;
END;
$$;