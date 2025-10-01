-- Drop duplicate trigger
DROP TRIGGER IF EXISTS trigger_analyze_completed_story ON public.test_sessions;

-- Update analyze_completed_story function with error handling
CREATE OR REPLACE FUNCTION public.analyze_completed_story()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  story_length INTEGER;
  existing_analysis_id UUID;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Check if analysis already exists
    SELECT id INTO existing_analysis_id
    FROM public.analysis_results
    WHERE test_session_id = NEW.id;
    
    IF existing_analysis_id IS NOT NULL THEN
      RAISE LOG 'Analysis already exists for session %, skipping', NEW.id;
      RETURN NEW;
    END IF;
    
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
        confidence_score
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
        NULL
      )
      ON CONFLICT (test_session_id) DO NOTHING;
      
      RAISE LOG 'Inserted insufficient length analysis for session %', NEW.id;
    ELSE
      RAISE LOG 'Story length % is sufficient, webhook will handle analysis for session %', story_length, NEW.id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$function$;