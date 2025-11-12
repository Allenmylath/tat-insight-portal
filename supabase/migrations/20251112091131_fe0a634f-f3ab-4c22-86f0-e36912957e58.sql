-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create trigger function to send welcome email
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_role_key text;
BEGIN
  -- Get service role key from vault or use the one from secrets
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- If not set in settings, use the SUPABASE_SERVICE_ROLE_KEY from secrets
  IF service_role_key IS NULL OR service_role_key = '' THEN
    service_role_key := current_setting('supabase.service_role_key', true);
  END IF;
  
  -- Make async HTTP request to edge function
  PERFORM net.http_post(
    url := 'https://ianqebxtpviuekwfhjtq.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'users',
      'record', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'clerk_id', NEW.clerk_id,
        'credit_balance', NEW.credit_balance,
        'membership_type', NEW.membership_type,
        'created_at', NEW.created_at
      )
    )
  );
  
  RAISE LOG 'Welcome email trigger fired for user: %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error sending welcome email for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on users table
DROP TRIGGER IF EXISTS on_user_created_send_welcome ON public.users;

CREATE TRIGGER on_user_created_send_welcome
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email_trigger();