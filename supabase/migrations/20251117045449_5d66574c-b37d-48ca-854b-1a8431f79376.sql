-- Create trigger function to send first test completion email
CREATE OR REPLACE FUNCTION public.send_first_test_completion_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_role_key text;
  is_first_test boolean;
BEGIN
  -- Only fire when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Check if this is the user's first completed test
    SELECT COUNT(*) = 0 INTO is_first_test
    FROM test_sessions
    WHERE user_id = NEW.user_id
      AND status = 'completed'
      AND id != NEW.id
      AND completed_at < NEW.completed_at;
    
    -- Only send email for first completed test
    IF is_first_test THEN
      -- Get service role key
      service_role_key := current_setting('app.settings.service_role_key', true);
      IF service_role_key IS NULL OR service_role_key = '' THEN
        service_role_key := current_setting('supabase.service_role_key', true);
      END IF;
      
      -- Make async HTTP request to edge function
      PERFORM net.http_post(
        url := 'https://ianqebxtpviuekwfhjtq.supabase.co/functions/v1/send-first-test-completion-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'UPDATE',
          'table', 'test_sessions',
          'record', jsonb_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'tattest_id', NEW.tattest_id,
            'completed_at', NEW.completed_at,
            'user_email', NEW.user_email
          )
        )
      );
      
      RAISE LOG 'First test completion email trigger fired for session: %', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the test completion
    RAISE LOG 'Error in first test completion email trigger for session %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on test_sessions table
DROP TRIGGER IF EXISTS on_first_test_completed_send_email ON public.test_sessions;

CREATE TRIGGER on_first_test_completed_send_email
  AFTER UPDATE ON public.test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION send_first_test_completion_email_trigger();

-- Create trigger function to send analysis ready email
CREATE OR REPLACE FUNCTION public.send_analysis_ready_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_role_key text;
BEGIN
  -- Get service role key
  service_role_key := current_setting('app.settings.service_role_key', true);
  IF service_role_key IS NULL OR service_role_key = '' THEN
    service_role_key := current_setting('supabase.service_role_key', true);
  END IF;
  
  -- Make async HTTP request to edge function
  PERFORM net.http_post(
    url := 'https://ianqebxtpviuekwfhjtq.supabase.co/functions/v1/send-analysis-ready-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'analysis_results',
      'record', jsonb_build_object(
        'id', NEW.id,
        'test_session_id', NEW.test_session_id,
        'user_id', NEW.user_id,
        'analysis_data', NEW.analysis_data,
        'confidence_score', NEW.confidence_score,
        'generated_at', NEW.generated_at
      )
    )
  );
  
  RAISE LOG 'Analysis ready email trigger fired for analysis: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the analysis insertion
    RAISE LOG 'Error in analysis ready email trigger for analysis %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on analysis_results table
DROP TRIGGER IF EXISTS on_analysis_ready_send_email ON public.analysis_results;

CREATE TRIGGER on_analysis_ready_send_email
  AFTER INSERT ON public.analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION send_analysis_ready_email_trigger();