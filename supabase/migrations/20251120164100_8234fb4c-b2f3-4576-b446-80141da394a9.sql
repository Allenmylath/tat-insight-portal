-- Temporarily set Pro subscription price to ₹5 for testing
UPDATE subscription_plans 
SET price = 5 
WHERE name = 'Pro Monthly';