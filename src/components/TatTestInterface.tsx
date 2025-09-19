import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Send, AlertCircle, CheckCircle, WifiOff, Loader2, X, Trophy } from "lucide-react";
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
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [completionData, setCompletionData] = useState<{
    creditsDeducted: number;
    remainingCredits: number;
    wasAutoCompleted: boolean;
  } | null>(null);
  
  // Responsive layout
  const isMobile = useIsMobile();
  
  // User data and credit management
  const { hasEnoughCredits, deductCreditsAfterCompletion, userData } = useUserData();
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

  // Add useEffect to monitor state changes for debugging
  useEffect(() => {
    console.log('🔍 State changes detected:');
    console.log('- showCompletionScreen:', showCompletionScreen);
    console.log('- completionData:', completionData);
    console.log('- connectionStatus:', connectionStatus);
    console.log('- timeRemaining:', timeRemaining);
    console.log('- isActive:', isActive);
  }, [showCompletionScreen, completionData, connectionStatus, timeRemaining, isActive]);

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

  // Timer completion handler - just call the same submit function
  async function handleTimerComplete() {
    console.log('⏰ Timer completed - calling submitStory with timer flag');
    await submitStory(true); // Use the same submission logic, just mark as timer-completed
  }

  function handleTimerAbandon() {
    // Removed abandon logic - timer completion uses submitStory instead
    console.log('🚫 Timer abandon called but ignoring - using submitStory flow instead');
  }

  // Manual story submission
  const submitStory = async (wasAutoCompleted = false) => {
    if (!story.trim()) {
      toast({
        title: "Story required",
        description: "Please write your story before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!userData?.id || !sessionId) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your story.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Manually submitting story for session:', sessionId);
      
      // Update the test session
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
      
      // Complete the timer session
      await completeSession();

      // Deduct credits
      const result = await deductCreditsAfterCompletion(sessionId);
      if (!result.success) {
        console.error('Credit deduction failed:', result.error);
      }

      // Show completion screen
      setCompletionData({
        creditsDeducted: 100,
        remainingCredits: result.success ? result.newBalance : userData.credit_balance - 100,
        wasAutoCompleted
      });
      setShowCompletionScreen(true);

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

  // Close completion screen and exit
  const handleCloseCompletion = () => {
    console.log('👋 User clicked close button on completion screen');
    setShowCompletionScreen(false);
    setCompletionData(null);
    onComplete();
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

  // Show completion screen
  if (showCompletionScreen && completionData) {
    console.log('🖥️ Rendering completion screen with data:', completionData);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-elegant border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">
              {completionData.wasAutoCompleted ? "Time's Up!" : "Test Completed!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {completionData.wasAutoCompleted 
                  ? "Your TAT test session has ended automatically." 
                  : "Thank you for completing the TAT test!"
                }
              </p>
              {story.trim() && (
                <p className="text-sm text-muted-foreground">
                  Your story has been saved and will be analyzed.
                </p>
              )}
            </div>

            {/* Credit Details */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-center">Credit Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Credits Used</p>
                  <p className="text-lg font-semibold text-primary">
                    {completionData.creditsDeducted}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Remaining Balance</p>
                  <p className="text-lg font-semibold">
                    {completionData.remainingCredits}
                  </p>
                </div>
              </div>
              {completionData.creditsDeducted === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  No credits deducted - test was abandoned without content
                </p>
              )}
            </div>

            {/* Story Stats (if story exists) */}
            {story.trim() && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-center">Your Story</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-center">
                  <div>
                    <p className="text-muted-foreground">Characters</p>
                    <p className="font-semibold">{story.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Words</p>
                    <p className="font-semibold">
                      {story.trim().split(/\s+/).filter(word => word.length > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button 
              onClick={handleCloseCompletion}
              className="w-full gap-2"
              size="lg"
            >
              <X className="h-4 w-4" />
              Close & Return to Tests
            </Button>

            {/* Debug Info - Remove this after testing */}
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              Debug: Screen shown at {new Date().toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


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