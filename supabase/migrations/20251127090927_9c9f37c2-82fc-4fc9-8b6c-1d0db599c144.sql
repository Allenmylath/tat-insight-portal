-- Schedule cron job to expire pro memberships daily at 2:00 AM UTC
SELECT cron.schedule(
  'expire-pro-memberships-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ianqebxtpviuekwfhjtq.supabase.co/functions/v1/expire-pro-memberships',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbnFlYnh0cHZpdWVrd2ZoanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDIyNDIsImV4cCI6MjA3MzUxODI0Mn0.wfrK1p_fuqbVlmxSxuhteQu4IPVsPgy-wAY5sT33AA4'
    ),
    body := jsonb_build_object(
      'triggered_at', now(),
      'job_name', 'expire-pro-memberships-daily'
    ),
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);
