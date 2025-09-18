-- Remove the problematic HTTP call from trigger and keep it simple
-- Only handle insufficient length stories directly in the database
CREATE OR REPLACE FUNCTION public.analyze_completed_story()
RETURNS TRIGGER AS $$
DECLARE
  story_length INTEGER;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get story length
    story_length := LENGTH(COALESCE(NEW.story_content, ''));
    
    RAISE LOG 'Processing completed test session %. Story length: %', NEW.id, story_length;
    
    -- Only handle insufficient length stories directly in the database
    -- Webhook will handle longer stories
    IF story_length < 250 THEN
      -- Insert insufficient length analysis directly
      INSERT INTO public.analysis_results (
        test_session_id, 
        user_id, 
        analysis_data, 
        confidence_score,
        personality_traits
      ) VALUES (
        NEW.id,
        NEW.user_id,
        jsonb_build_object(
          'summary', 'Not enough length for story to analyze. Please write a more detailed story (minimum 250 characters) for comprehensive analysis.',
          'reason', 'insufficient_length',
          'character_count', story_length,
          'minimum_required', 250,
          'guidance', 'Try to include more details about the characters, their thoughts, feelings, and what might happen next in your story.'
        ),
        NULL,
        NULL
      );
      
      RAISE LOG 'Inserted insufficient length analysis for session %', NEW.id;
    ELSE
      RAISE LOG 'Story length % is sufficient, webhook will handle analysis for session %', story_length, NEW.id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS test_session_analysis_trigger ON test_sessions;
CREATE TRIGGER test_session_analysis_trigger
  AFTER UPDATE ON test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION analyze_completed_story();