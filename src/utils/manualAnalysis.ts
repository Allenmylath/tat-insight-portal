// Temporary utility to manually trigger analysis for completed sessions
import { supabase } from "@/integrations/supabase/client";

export async function triggerAnalysisForSession(sessionId: string) {
  try {
    // Get the session details
    const { data: session } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      console.error('Session not found:', sessionId);
      return;
    }

    if (!session.story_content || session.story_content.length < 250) {
      console.log('Story too short, skipping analysis');
      return;
    }

    console.log('Triggering analysis for session:', sessionId);
    
    // Call the Edge Function directly
    const { data, error } = await supabase.functions.invoke('analyze-story', {
      body: {
        testSessionId: session.id,
        userId: session.user_id,
        storyContent: session.story_content
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
    } else {
      console.log('Analysis triggered successfully:', data);
    }
  } catch (error) {
    console.error('Error triggering analysis:', error);
  }
}

// Auto-trigger for the existing session
if (typeof window !== 'undefined') {
  setTimeout(() => {
    triggerAnalysisForSession('75044ad2-8bb7-40c2-a73f-84400d919a8d');
  }, 1000);
}