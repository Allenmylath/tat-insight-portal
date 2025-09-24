-- Drop the old version of add_credits_after_purchase function to resolve overloading conflict
-- The newer version with default parameters for p_user_email and p_payment_metadata can handle both cases
DROP FUNCTION IF EXISTS public.add_credits_after_purchase(p_user_id uuid, p_purchase_id uuid, p_credits_purchased integer);