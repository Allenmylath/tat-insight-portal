-- Add user_email and payment_metadata to credit_transactions table
ALTER TABLE public.credit_transactions 
ADD COLUMN user_email TEXT,
ADD COLUMN payment_metadata JSONB;

-- Update the add_credits_after_purchase function to accept and store user email
CREATE OR REPLACE FUNCTION public.add_credits_after_purchase(
  p_user_id uuid, 
  p_purchase_id uuid, 
  p_credits_purchased integer,
  p_user_email text DEFAULT NULL,
  p_payment_metadata jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Log the transaction with user email and payment metadata
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    credits_change,
    balance_after,
    reference_type,
    reference_id,
    description,
    user_email,
    payment_metadata
  ) VALUES (
    p_user_id,
    'purchase',
    p_credits_purchased,
    new_balance,
    'credit_purchase',
    p_purchase_id,
    'Credits added from purchase',
    p_user_email,
    p_payment_metadata
  );
  
  RETURN TRUE;
END;
$function$