-- Create the missing trigger for analyzing completed stories
CREATE TRIGGER trigger_analyze_completed_story
    AFTER UPDATE ON public.test_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.analyze_completed_story();

-- Also create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_test_sessions_updated_at
    BEFORE UPDATE ON public.test_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();