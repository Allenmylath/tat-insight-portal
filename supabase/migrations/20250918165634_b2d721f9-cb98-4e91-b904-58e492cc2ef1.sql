-- First, let's manually trigger analysis for the existing completed session
-- Since we can't update in a read-only transaction, we'll create a function to do this

-- Function to manually analyze existing completed sessions
CREATE OR REPLACE FUNCTION public.analyze_existing_completed_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    session_record RECORD;
    story_length INTEGER;
BEGIN
    -- Loop through all completed sessions without analysis
    FOR session_record IN 
        SELECT ts.id, ts.user_id, ts.story_content
        FROM test_sessions ts
        LEFT JOIN analysis_results ar ON ts.id = ar.test_session_id
        WHERE ts.status = 'completed' AND ar.id IS NULL
    LOOP
        story_length := LENGTH(COALESCE(session_record.story_content, ''));
        
        RAISE LOG 'Processing existing completed session %. Story length: %', session_record.id, story_length;
        
        -- Handle short stories directly
        IF story_length < 250 THEN
            INSERT INTO public.analysis_results (
                test_session_id, 
                user_id, 
                analysis_data, 
                confidence_score,
                personality_traits
            ) VALUES (
                session_record.id,
                session_record.user_id,
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
            RAISE LOG 'Inserted insufficient length analysis for session %', session_record.id;
        ELSE
            -- For longer stories, we need to trigger the webhook manually
            -- Let's insert a placeholder and let the edge function handle it
            RAISE LOG 'Long story found for session %, needs Edge Function analysis', session_record.id;
        END IF;
    END LOOP;
END;
$function$;

-- Execute the function to analyze existing sessions
SELECT public.analyze_existing_completed_sessions();