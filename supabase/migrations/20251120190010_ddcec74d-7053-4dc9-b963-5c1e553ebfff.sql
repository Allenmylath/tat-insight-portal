-- Create trigger function to generate SSB questions for Pro users
CREATE OR REPLACE FUNCTION public.generate_ssb_questions_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_role_key text;
  user_membership_type membership_type;
  user_membership_expires_at timestamp with time zone;
BEGIN
  -- Get user's membership details
  SELECT membership_type, membership_expires_at INTO user_membership_type, user_membership_expires_at
  FROM users
  WHERE id = NEW.user_id;
  
  -- Only generate for Pro members with valid membership
  IF user_membership_type != 'pro' OR 
     (user_membership_expires_at IS NOT NULL AND user_membership_expires_at < now()) THEN
    RAISE LOG 'Skipping SSB generation - User % is not Pro or membership expired', NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- Skip if SSB questions already exist
  IF NEW.ssb_questions IS NOT NULL THEN
    RAISE LOG 'SSB questions already exist for analysis %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Get service role key
  service_role_key := current_setting('app.settings.service_role_key', true);
  IF service_role_key IS NULL OR service_role_key = '' THEN
    service_role_key := current_setting('supabase.service_role_key', true);
  END IF;
  
  -- Make async HTTP request to edge function
  PERFORM net.http_post(
    url := 'https://ianqebxtpviuekwfhjtq.supabase.co/functions/v1/generate-ssb-questions',
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
        'confidence_score', NEW.confidence_score,
        'generated_at', NEW.generated_at
      )
    )
  );
  
  RAISE LOG 'SSB questions generation triggered for analysis: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the analysis insertion
    RAISE LOG 'Error triggering SSB generation for analysis %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_analysis_inserted_generate_ssb ON public.analysis_results;

-- Create trigger on analysis_results table
CREATE TRIGGER on_analysis_inserted_generate_ssb
  AFTER INSERT ON public.analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION generate_ssb_questions_trigger();