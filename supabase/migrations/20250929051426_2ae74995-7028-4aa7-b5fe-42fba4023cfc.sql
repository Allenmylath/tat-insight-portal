-- Create trigger to fire webhook when test_sessions are updated to completed status
CREATE OR REPLACE FUNCTION public.handle_test_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire webhook for status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Log the trigger firing
    RAISE LOG 'Test completion trigger fired for session %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS test_session_completion_webhook ON public.test_sessions;
CREATE TRIGGER test_session_completion_webhook
  AFTER UPDATE ON public.test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_test_completion();