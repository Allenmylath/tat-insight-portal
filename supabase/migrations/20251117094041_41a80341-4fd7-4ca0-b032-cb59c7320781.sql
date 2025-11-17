-- Fix security issue: Set security_invoker=on for paying_customers view
-- This makes the view respect RLS policies and use the querying user's permissions
DROP VIEW IF EXISTS public.paying_customers;

CREATE VIEW public.paying_customers
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
  u.last_sign_in_at,
  u.credit_balance as current_credit_balance,
  
  -- Purchase aggregations
  COUNT(p.id) FILTER (WHERE p.status = 'completed') as total_purchases,
  SUM(p.amount) FILTER (WHERE p.status = 'completed') as total_amount_spent,
  SUM(p.credits_purchased) FILTER (WHERE p.status = 'completed') as total_credits_purchased,
  
  -- Purchase dates
  MIN(p.purchased_at) FILTER (WHERE p.status = 'completed') as first_purchase_date,
  MAX(p.purchased_at) FILTER (WHERE p.status = 'completed') as last_purchase_date,
  
  -- Days since last purchase
  EXTRACT(DAY FROM (NOW() - MAX(p.purchased_at) FILTER (WHERE p.status = 'completed')))::INTEGER as days_since_last_purchase,
  
  -- Failed purchases count
  COUNT(p.id) FILTER (WHERE p.status = 'failed') as failed_purchases_count,
  
  -- Most recent payment method
  (
    SELECT payment_method 
    FROM purchases 
    WHERE user_id = u.id 
      AND status = 'completed' 
    ORDER BY purchased_at DESC 
    LIMIT 1
  ) as last_payment_method

FROM users u
INNER JOIN purchases p ON u.id = p.user_id
WHERE p.status = 'completed'
GROUP BY u.id, u.clerk_id, u.email, u.first_name, u.last_name, u.username, u.created_at, u.last_sign_in_at, u.credit_balance
ORDER BY total_amount_spent DESC;

-- Add comment for documentation
COMMENT ON VIEW public.paying_customers IS 'View of all customers who have completed at least one purchase, with aggregated purchase statistics. Uses security_invoker to respect RLS policies.';