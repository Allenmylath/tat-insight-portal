-- Create view for users with abandoned or paused tests
CREATE OR REPLACE VIEW public.abandoned_test_users AS
SELECT 
  u.id as user_id,
  u.clerk_id,
  u.email,
  u.username,
  u.first_name,
  u.last_name,
  u.credit_balance as current_credit_balance,
  u.last_sign_in_at,
  u.created_at as user_created_at,
  
  -- Abandoned test metrics
  COUNT(*) FILTER (WHERE ts.status = 'abandoned') as total_abandoned_tests,
  MAX(ts.started_at) FILTER (WHERE ts.status = 'abandoned') as last_abandoned_date,
  MIN(ts.started_at) FILTER (WHERE ts.status = 'abandoned') as first_abandoned_date,
  
  -- Paused test metrics
  COUNT(*) FILTER (WHERE ts.status = 'paused') as total_paused_tests,
  MAX(ts.started_at) FILTER (WHERE ts.status = 'paused') as last_paused_date,
  MIN(ts.started_at) FILTER (WHERE ts.status = 'paused') as first_paused_date,
  
  -- Combined metrics
  COUNT(*) as total_incomplete_tests,
  EXTRACT(DAY FROM (NOW() - MAX(ts.started_at)))::INTEGER as days_since_last_incomplete,
  
  -- Completed tests for context
  (SELECT COUNT(*) FROM test_sessions WHERE user_id = u.id AND status = 'completed') as total_completed_tests,
  
  -- Determine user engagement level
  CASE 
    WHEN COUNT(*) FILTER (WHERE ts.status = 'paused') > 0 THEN 'has_paused_tests'
    WHEN COUNT(*) FILTER (WHERE ts.status = 'abandoned') > 2 THEN 'multiple_abandonments'
    WHEN COUNT(*) FILTER (WHERE ts.status = 'abandoned') > 0 THEN 'single_abandonment'
    ELSE 'other'
  END as engagement_status

FROM public.users u
INNER JOIN public.test_sessions ts ON u.id = ts.user_id
WHERE ts.status IN ('abandoned', 'paused')
GROUP BY u.id, u.clerk_id, u.email, u.username, u.first_name, u.last_name, 
         u.credit_balance, u.last_sign_in_at, u.created_at;