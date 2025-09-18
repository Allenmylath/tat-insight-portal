-- Create function to handle story analysis after test completion
CREATE OR REPLACE FUNCTION public.analyze_completed_story()
RETURNS TRIGGER AS $$
DECLARE
  story_length INTEGER;
  supabase_url TEXT;
  function_url TEXT;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get story length
    story_length := LENGTH(COALESCE(NEW.story_content, ''));
    
    RAISE LOG 'Processing completed test session %. Story length: %', NEW.id, story_length;
    
    -- Check if story length is sufficient for analysis
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
      -- Call edge function for full analysis
      -- Use pg_net extension if available, otherwise log for manual processing
      BEGIN
        -- Get Supabase URL from environment or use default project URL
        supabase_url := 'https://ianqebxtpviuekwfhjtq.supabase.co';
        function_url := supabase_url || '/functions/v1/analyze-story';
        
        -- Make HTTP request to edge function
        PERFORM net.http_post(
          url := function_url,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object(
            'testSessionId', NEW.id::text,
            'userId', NEW.user_id::text,
            'storyContent', NEW.story_content
          )
        );
        
        RAISE LOG 'Called analyze-story edge function for session %', NEW.id;
        
      EXCEPTION WHEN OTHERS THEN
        -- If HTTP call fails, insert a pending analysis record
        INSERT INTO public.analysis_results (
          test_session_id, 
          user_id, 
          analysis_data, 
          confidence_score
        ) VALUES (
          NEW.id,
          NEW.user_id,
          jsonb_build_object(
            'summary', 'Analysis in progress. Your detailed story analysis will be available shortly.',
            'status', 'processing',
            'character_count', story_length
          ),
          NULL
        );
        
        RAISE LOG 'HTTP call failed for session %, inserted pending record: %', NEW.id, SQLERRM;
      END;
      
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically analyze completed stories
DROP TRIGGER IF EXISTS trigger_analyze_completed_story ON public.test_sessions;

CREATE TRIGGER trigger_analyze_completed_story
  AFTER UPDATE ON public.test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.analyze_completed_story();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.analyze_completed_story() TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_completed_story() TO service_role;