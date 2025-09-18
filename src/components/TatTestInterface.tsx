import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Send, AlertCircle, CheckCircle, WifiOff, Loader2 } from "lucide-react";
import { useModalTimer } from "@/hooks/useModalTimer";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";
import { CreditPurchaseModal } from "@/components/CreditPurchaseModal";

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
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  
  // User data and credit management
  const { hasEnoughCredits, deductCredits, userData } = useUserData();
  const { toast } = useToast();

  const {
    timeRemaining,
    timeFormatted,
    isActive,
    connectionStatus,
    error,
    isRecoveredSession,
    startTimer,
    completeSession,
    abandonSession,
    pauseSession,
    stopTimer,
    isConnecting,
    isExpired,
    canStart,
    sessionId
  } = useModalTimer({
    tatTestId: test.id,
    durationMinutes: 6, // 6 minutes
    onTimeUp: handleTimerComplete,
    onSessionEnd: handleTimerAbandon,
  });

  // Start test with credit deduction 
  const handleStartTest = async () => {
    if (!userData) return;
    
    if (!hasEnoughCredits()) {
      setShowCreditModal(true);
      return;
    }

    try {
      const startedSessionId = await startTimer();
      
      // After successful timer start, deduct credits using the returned session ID
      if (startedSessionId) {
        console.log('Deducting credits for session:', startedSessionId);
        const success = await deductCredits(startedSessionId);
        if (!success) {
          toast({
            title: "Credit Error",
            description: "Failed to deduct credits. Test stopped.",
            variant: "destructive"
          });
          return;
        }
        console.log('Credits deducted successfully');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      toast({
        title: "Error",
        description: "Failed to start test. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Timer event handlers
  async function handleTimerComplete() {
    setIsTimerCompleted(true);
    
    // Automatically mark session as completed when timer reaches 0
    if (sessionId && userData?.id) {
      try {
        await supabase
          .from('test_sessions')
          .update({ 
            status: story.trim() ? 'completed' : 'abandoned',
            story_content: story,
            time_remaining: 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }

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

  // Handle window close detection for true abandonment
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Don't show warning or abandon if test was submitted successfully or is being completed
      if (isSubmittedSuccessfully || isCompletingSession) {
        return;
      }
      
      if (isActive && sessionId && story.trim()) {
        handleAbandon();
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, sessionId, story, isSubmittedSuccessfully, isCompletingSession]);

  // Story submission
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
    setIsCompletingSession(true);
    
    try {
      // Update the test session with the story content using session ID
      if (!sessionId) {
        throw new Error('No active session found');
      }

      console.log('Submitting story for session:', sessionId);
      const { error: updateError } = await supabase
        .from('test_sessions')
        .update({
          story_content: story,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Failed to update session:', updateError);
        throw updateError;
      }

      console.log('Story submitted successfully');
      
      // Mark as successfully submitted to prevent beforeunload handler
      setIsSubmittedSuccessfully(true);
      
      // Remove beforeunload listener immediately to prevent race conditions
      window.removeEventListener('beforeunload', window.onbeforeunload as any);
      
      // Complete the timer session (this will stop the timer)
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
      setIsCompletingSession(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (!userData?.id || !sessionId) return;
    
    try {
      await supabase
        .from('test_sessions')
        .update({ 
          status: 'paused',
          story_content: story,
          time_remaining: timeRemaining,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      toast({
        title: "Progress Saved",
        description: "Your test has been paused and progress saved.",
      });
      
      stopTimer();
      onAbandon();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAbandon = async () => {
    if (!userData?.id || !sessionId || isCompletingSession) return;
    
    try {
      // Only abandon if the session is not already completed
      await supabase
        .from('test_sessions')
        .update({ 
          status: 'abandoned',
          story_content: story,
          time_remaining: timeRemaining,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .neq('status', 'completed');
      
      abandonSession();
    } catch (error) {
      console.error('Error abandoning session:', error);
    }
  };

  // UI helpers
  const getTimerColor = () => {
    if (timeRemaining > 300) return "text-primary"; // > 5 minutes: green
    if (timeRemaining > 60) return "text-amber-600"; // > 1 minute: amber
    return "text-destructive"; // < 1 minute: red
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'idle':
        return <Badge variant="secondary">Ready</Badge>;
      case 'checking':
        return <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking Session
        </Badge>;
      case 'connecting':
        return <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Connecting
        </Badge>;
      case 'connected':
        return <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Starting Timer
        </Badge>;
      case 'timer_running':
        return <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1">
          <WifiOff className="h-3 w-3" />
          Connection Error
        </Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Check for insufficient credits before rendering
  if (!hasEnoughCredits() && connectionStatus === 'idle') {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Insufficient Credits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You need 100 credits to start this TAT test. 
                Your current balance: {userData?.credit_balance || 0} credits
              </p>
              <Button onClick={() => setShowCreditModal(true)} className="w-full">
                Purchase Credits
              </Button>
            </CardContent>
          </Card>
        </div>
        <CreditPurchaseModal 
          open={showCreditModal} 
          onOpenChange={setShowCreditModal} 
        />
      </>
    );
  }

  // Show start test screen when timer is idle
  if (connectionStatus === 'idle' && canStart) {
    return (
      <>
        <div className="space-y-6">
          {/* Test Preview */}
          <Card className="shadow-elegant border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {test.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{test.prompt_text}</p>
              <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-muted">
                <img 
                  src={test.image_url} 
                  alt={test.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Duration: 6 minutes</p>
                  <p>Cost: 100 credits</p>
                  <p>Your balance: {userData?.credit_balance || 0} credits</p>
                </div>
                <Button 
                  onClick={handleStartTest}
                  disabled={!hasEnoughCredits()}
                  size="lg"
                  className="w-full max-w-sm"
                >
                  Start Test (100 credits)
                </Button>
                {!hasEnoughCredits() && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreditModal(true)}
                    className="w-full max-w-sm"
                  >
                    Purchase Credits
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <CreditPurchaseModal 
          open={showCreditModal} 
          onOpenChange={setShowCreditModal} 
        />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-elegant border-destructive/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Connection Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error}
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
              {isRecoveredSession && (
                <Badge variant="outline" className="text-xs">Resumed</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-3">
              {getConnectionStatusBadge()}
              <Badge variant="secondary" className={`gap-2 ${getTimerColor()}`}>
                <Clock className="h-4 w-4" />
                {timeFormatted}
              </Badge>
            </div>
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

      {/* Test Image */}
      <Card className="shadow-elegant">
        <CardContent className="pt-6">
          <div className="aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-muted">
            <img 
              src={test.image_url} 
              alt={test.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground">Image failed to load</div>';
              }}
            />
          </div>
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
            disabled={isSubmitting || !isActive}
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
          onClick={handleSaveAndExit}
          disabled={isSubmitting || isConnecting}
          className="flex-1"
        >
          Save & Pause
        </Button>
        <Button
          onClick={() => submitStory()}
          disabled={isSubmitting || !story.trim() || !isActive}
          className="flex-1 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
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

      {/* Connection status indicator */}
      {isConnecting && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {connectionStatus === 'checking' && 'Checking for existing session...'}
              {connectionStatus === 'connecting' && 'Connecting to timer service...'}
              {connectionStatus === 'connected' && 'Starting your timer...'}
            </div>
          </CardContent>
        </Card>
      )}
      
      <CreditPurchaseModal 
        open={showCreditModal} 
        onOpenChange={setShowCreditModal} 
      />
    </div>
  );
};
