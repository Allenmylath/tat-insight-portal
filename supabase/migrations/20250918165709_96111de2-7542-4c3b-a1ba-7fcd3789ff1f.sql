-- Manually call the Edge Function for the long story
SELECT extensions.http_post(
    url := 'https://ianqebxtpviuekwfhjtq.supabase.co/functions/v1/analyze-story',
    body := json_build_object(
        'testSessionId', '75044ad2-8bb7-40c2-a73f-84400d919a8d',
        'userId', (SELECT user_id FROM test_sessions WHERE id = '75044ad2-8bb7-40c2-a73f-84400d919a8d'),
        'storyContent', (SELECT story_content FROM test_sessions WHERE id = '75044ad2-8bb7-40c2-a73f-84400d919a8d')
    )::text,
    headers := json_build_object(
        'Content-Type', 'application/json',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbnFlYnh0cHZpdWVrd2ZoanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDIyNDIsImV4cCI6MjA3MzUxODI0Mn0.wfrK1p_fuqbVlmxSxuhteQu4IPVsPgy-wAY5sT33AA4'
    )::json
) AS edge_function_result;