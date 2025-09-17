import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useModalTimer } from "@/hooks/useModalTimer";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";

interface TatTestInterfaceProps {
  test: {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    prompt_text: string;
  };
  onComplete: () => void;
  onAbandon: () => void;
}

export const TatTestInterface = ({ test, onComplete, onAbandon }: TatTestInterfaceProps) => {
  const [story, setStory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData } = useUserData();
  const { toast } = useToast();

  const {
    timeRemaining,
    timeFormatted,
    isActive,
    error,
    startTimer,
    completeSession,
    abandonSession
  } = useModalTimer({
    tatTestId: test.id,
    durationMinutes: 15, // 15 minutes
    onTimeUp: handleTimerComplete,
    onSessionEnd: handleTimerAbandon,
  });

  // Auto-start timer when component mounts
  useEffect(() => {
    if (!isActive && !error) {
      startTimer();
    }
  }, [startTimer, isActive, error]);

  async function handleTimerComplete() {
    if (story.trim()) {
      await submitStory(true);
    } else {
      toast({
        title: "Time's up!",
        description: "Your session has been saved. You can continue later.",
        variant: "default"
      });
      onComplete();
    }
  }

  function handleTimerAbandon() {
    onAbandon();
  }

  const submitStory = async (isTimerComplete = false) => {
    if (!story.trim()) {
      toast({
        title: "Story required",
        description: "Please write your story before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!userData?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your story.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update the test session with the story content
      const { error: updateError } = await supabase
        .from('test_sessions')
        .update({
          story_content: story,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('tattest_id', test.id)
        .eq('user_id', userData.id)
        .eq('status', 'active');

      if (updateError) {
        throw updateError;
      }

      // Complete the timer session
      await completeSession();

      toast({
        title: "Story submitted successfully!",
        description: "Your TAT story has been saved and will be analyzed.",
        variant: "default"
      });

      onComplete();
    } catch (error) {
      console.error('Error submitting story:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbandonTest = async () => {
    if (story.trim()) {
      // Save the story before abandoning
      try {
        await supabase
          .from('test_sessions')
          .update({
            story_content: story,
            status: 'abandoned'
          })
          .eq('tattest_id', test.id)
          .eq('user_id', userData?.id)
          .eq('status', 'active');
      } catch (error) {
        console.error('Error saving story before abandon:', error);
      }
    }
    
    await abandonSession();
    onAbandon();
  };

  const getTimerColor = () => {
    if (timeRemaining > 300) return "text-primary"; // > 5 minutes: green
    if (timeRemaining > 60) return "text-amber-600"; // > 1 minute: amber
    return "text-destructive"; // < 1 minute: red
  };

  if (error) {
    return (
      <Card className="shadow-elegant border-destructive/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Session Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error with your test session. Please try again.
            </p>
            <Button variant="outline" onClick={onAbandon}>
              Return to Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer Header */}
      <Card className="shadow-elegant border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {test.title}
            </CardTitle>
            <Badge variant="secondary" className={`gap-2 ${getTimerColor()}`}>
              <Clock className="h-4 w-4" />
              {timeFormatted}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Test Instructions */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {test.prompt_text}
          </p>
        </CardContent>
      </Card>

      {/* Story Writing Area */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Your Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Begin writing your story here..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="min-h-[300px] text-base leading-relaxed"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{story.length} characters</span>
            <span>{story.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleAbandonTest}
          disabled={isSubmitting}
          className="flex-1"
        >
          Save & Exit
        </Button>
        <Button
          onClick={() => submitStory()}
          disabled={isSubmitting || !story.trim()}
          className="flex-1 gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Story
            </>
          )}
        </Button>
      </div>
    </div>
  );
};