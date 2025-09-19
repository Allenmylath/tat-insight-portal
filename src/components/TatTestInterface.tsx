import { useState, useEffect, useRef } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isTimerExpired, setIsTimerExpired] = useState(false); // NEW: Specific flag for timer expiration
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false); // NEW: Flag for auto-submit process
  
  // Responsive layout
  const isMobile = useIsMobile();
  
  // User data and credit management
  const { hasEnoughCredits, deductCreditsAfterCompletion, userData } = useUserData();
  const { toast } = useToast();

  // Ref to track beforeunload listener for proper cleanup
  const beforeUnloadListenerRef = useRef<((event: BeforeUnloadEvent) => void) | null>(null);

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
      await startTimer();
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
    console.log('Timer completed - setting protective flags immediately');
    
    // FIXED: Set all protective flags SYNCHRONOUSLY before any async operations
    setIsTimerExpired(true);
    setIsTimerCompleted(true);
    setIsAutoSubmitting(true);
    setIsCompletingSession(true);
    
    // FIXED: Remove beforeunload listener immediately to prevent race conditions
    if (beforeUnloadListenerRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadListenerRef.current);
      beforeUnloadListenerRef.current = null;
    }
    
    // Update session status in database immediately
    if (sessionId && userData?.id) {
      try {
        const { error: updateError } = await supabase
          .from('test_sessions')
          .update({ 
            status: story.trim() ? 'completed' : 'abandoned',
            story_content: story,
            time_remaining: 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .neq('status', 'completed'); // Prevent overwriting if somehow already completed

        if (updateError) {
          console.error('Error updating session on timer complete:', updateError);
        } else {
          console.log('Session marked as completed due to timer expiration');
        }

        // Deduct credits after successful completion (only if story exists)
        if (story.trim()) {
          const result = await deductCreditsAfterCompletion(sessionId);
          if (result.success) {
            toast({
              title: "Time's up! Test completed.",
              description: `100 credits deducted. Remaining balance: ${result.newBalance} credits`,
              variant: "default"
            });
          } else {
            console.error('Credit deduction failed:', result.error);
            toast({
              title: "Time's up! Test completed.",
              description: "Test completed successfully, but there was an issue processing credit deduction. Please contact support.",
              variant: "default"
            });
          }
        }
      } catch (error) {
        console.error('Error completing session on timer expiration:', error);
      }
    }

    // Handle the completion flow
    if (story.trim()) {
      await submitStory(true);
    } else {
      toast({
        title: "Time's up!",
        description: "Your session has been saved. You can continue later.",
        variant: "default"
      });
      setIsSubmittedSuccessfully(true); // Mark as completed to prevent further abandonment attempts
      onComplete();
    }
  }

  function handleTimerAbandon() {
    // Only call onAbandon if this wasn't a timer expiration
    if (!isTimerExpired && !isAutoSubmitting) {
      onAbandon();
    }
  }

  // FIXED: Improved beforeunload handler with better protection logic
  const createBeforeUnloadHandler = () => {
    const handler = (event: BeforeUnloadEvent) => {
      // FIXED: Multiple layers of protection against false abandonment
      if (
        isSubmittedSuccessfully || 
        isCompletingSession || 
        isTimerExpired || 
        isAutoSubmitting ||
        !isActive ||
        !sessionId
      ) {
        console.log('Beforeunload: Test is completed or in completion process, not abandoning');
        return;
      }
      
      // Only abandon if we have an active session with content
      if (story.trim()) {
        console.log('Beforeunload: Abandoning session due to page close');
        handleAbandon();
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    return handler;
  };

  // Handle window close detection for true abandonment
  useEffect(() => {
    // Remove existing listener if any
    if (beforeUnloadListenerRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadListenerRef.current);
    }
    
    // Create and add new listener only if session is active and not in completion states
    if (isActive && !isSubmittedSuccessfully && !isTimerExpired && !isAutoSubmitting) {
      const handler = createBeforeUnloadHandler();
      beforeUnloadListenerRef.current = handler;
      window.addEventListener('beforeunload', handler);
      console.log('Beforeunload listener added');
    } else {
      beforeUnloadListenerRef.current = null;
      console.log('Beforeunload listener not added due to protective conditions');
    }
    
    // Cleanup function
    return () => {
      if (beforeUnloadListenerRef.current) {
        window.removeEventListener('beforeunload', beforeUnloadListenerRef.current);
        beforeUnloadListenerRef.current = null;
      }
    };
  }, [isActive, sessionId, story, isSubmittedSuccessfully, isCompletingSession, isTimerExpired, isAutoSubmitting]);

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

    console.log('Starting story submission process');
    setIsSubmitting(true);
    setIsCompletingSession(true);
    
    // FIXED: Remove beforeunload listener immediately when starting manual submission
    if (!isTimerComplete && beforeUnloadListenerRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadListenerRef.current);
      beforeUnloadListenerRef.current = null;
      console.log('Beforeunload listener removed for manual submission');
    }
    
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
        .eq('id', sessionId)
        .neq('status', 'completed'); // Prevent overwriting if somehow already completed

      if (updateError) {
        console.error('Failed to update session:', updateError);
        throw updateError;
      }

      console.log('Story submitted successfully');
      
      // FIXED: Mark as successfully submitted immediately after DB update
      setIsSubmittedSuccessfully(true);
      
      // Complete the timer session (this will stop the timer)
      await completeSession();

      // Deduct credits after successful submission (only if not called from timer complete)
      if (!isTimerComplete) {
        const result = await deductCreditsAfterCompletion(sessionId);
        if (result.success) {
          toast({
            title: "Story submitted successfully!",
            description: `100 credits deducted. Remaining balance: ${result.newBalance} credits. Your TAT story will be analyzed.`,
            variant: "default"
          });
        } else {
          console.error('Credit deduction failed:', result.error);
          toast({
            title: "Story submitted successfully!",
            description: "Test completed successfully, but there was an issue processing credit deduction. Please contact support.",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Story submitted successfully!",
          description: "Your TAT story has been saved and will be analyzed.",
          variant: "default"
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error submitting story:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your story. Please try again.",
        variant: "destructive"
      });
      // FIXED: Reset completion flags on error so user can try again
      setIsCompletingSession(false);
      if (!isTimerComplete) {
        setIsSubmittedSuccessfully(false);
        // Re-add beforeunload listener if submission failed and timer hasn't expired
        if (!isTimerExpired) {
          const handler = createBeforeUnloadHandler();
          beforeUnloadListenerRef.current = handler;
          window.addEventListener('beforeunload', handler);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (!userData?.id || !sessionId) return;
    
    // FIXED: Set protective flag before database operation
    setIsCompletingSession(true);
    
    // Remove beforeunload listener since we're intentionally saving and exiting
    if (beforeUnloadListenerRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadListenerRef.current);
      beforeUnloadListenerRef.current = null;
    }
    
    try {
      const { error: updateError } = await supabase
        .from('test_sessions')
        .update({ 
          status: 'paused',
          story_content: story,
          time_remaining: timeRemaining,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .neq('status', 'completed'); // Don't overwrite completed sessions

      if (updateError) {
        throw updateError;
      }

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
      // Reset flag on error
      setIsCompletingSession(false);
    }
  };

  const handleAbandon = async () => {
    // FIXED: Multiple checks to prevent abandoning completed sessions
    if (
      !userData?.id || 
      !sessionId || 
      isCompletingSession || 
      isSubmittedSuccessfully || 
      isTimerExpired ||
      isAutoSubmitting
    ) {
      console.log('Abandon prevented due to protective conditions');
      return;
    }
    
    try {
      console.log('Abandoning session:', sessionId);
      
      // FIXED: Check current session status before abandoning
      const { data: currentSession, error: fetchError } = await supabase
        .from('test_sessions')
        .select('status')
        .eq('id', sessionId)
        .single();

      if (fetchError) {
        console.error('Error fetching session status:', fetchError);
        return;
      }

      // FIXED: Only abandon if session is not already completed
      if (currentSession?.status === 'completed') {
        console.log('Session is already completed, not abandoning');
        return;
      }
      
      const { error: updateError } = await supabase
        .from('test_sessions')
        .update({ 
          status: 'abandoned',
          story_content: story,
          time_remaining: timeRemaining,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .neq('status', 'completed'); // Additional safety check
      
      if (updateError) {
        console.error('Error abandoning session:', updateError);
        return;
      }
      
      console.log('Session abandoned successfully');
      abandonSession();
    } catch (error) {
      console.error('Error in handleAbandon:', error);
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

      {/* Main Test Interface - Responsive Layout */}
      <Card className="shadow-elegant">
        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-5 gap-6'} p-6`}>
          {/* Left Column: Instructions + Image */}
          <div className={`${isMobile ? '' : 'col-span-2'} space-y-4`}>
            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {test.prompt_text}
              </p>
            </div>
            
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
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
          </div>

          {/* Right Column: Story Writing Area */}
          <div className={`${isMobile ? '' : 'col-span-3'}`}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Story</h3>
              <Textarea
                placeholder="Begin writing your story here..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className={`${isMobile ? 'min-h-[300px]' : 'min-h-[400px]'} text-base leading-relaxed resize-none`}
                disabled={isSubmitting || !isActive}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{story.length} characters</span>
                <span>{story.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleSaveAndExit}
          disabled={isSubmitting || isConnecting || isTimerExpired}
          className="flex-1"
        >
          Save & Pause
        </Button>
        <Button
          onClick={() => submitStory()}
          disabled={isSubmitting || !story.trim() || !isActive || isTimerExpired}
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