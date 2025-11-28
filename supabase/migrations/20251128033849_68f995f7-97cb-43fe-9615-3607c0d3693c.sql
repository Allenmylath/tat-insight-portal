-- Update Pro Monthly subscription price to ₹899
UPDATE subscription_plans 
SET price = 899,
    updated_at = now()
WHERE name = 'Pro Monthly' AND is_active = true;