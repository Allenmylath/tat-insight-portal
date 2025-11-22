import { useState, useEffect, useRef } from "react";
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
  const [acknowledgedMobileWarning, setAcknowledgedMobileWarning] = useState(false);

  // Responsive layout
  const isMobile = useIsMobile();

  // User data and credit management
  const { hasEnoughCredits, deductCreditsAfterCompletion, userData } = useUserData();
  const { toast } = useToast();

  // Create a ref to store the session ID that can be accessed by handlers
  const sessionIdRef = useRef<string | null>(null);
  const storyRestoredRef = useRef<boolean>(false);

  const {
    timeRemaining,
    timeFormatted,
    isActive,
    connectionStatus,
    error,
    isRecoveredSession,
    recoveredStoryContent,
    startTimer,
    completeSession,
    abandonSession,
    pauseSession,
    stopTimer,
    isConnecting,
    isExpired,
    canStart,
    sessionId,
  } = useModalTimer({
    tatTestId: test.id,
    durationMinutes: 6, // 6 minutes
    onTimeUp: async () => {
      console.log("⏰ Timer completed - triggering auto-submission");
      // Force the submission to happen even if story is blank
      await submitStory(true);
    },
    onSessionEnd: () => {
      console.log("🚫 Timer session ended");
    },
  });

  // Update ref when sessionId changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
    console.log("📌 Session ID updated in ref:", sessionId);
  }, [sessionId]);

  // Restore story content when session is recovered
  useEffect(() => {
    if (isRecoveredSession && recoveredStoryContent && !storyRestoredRef.current) {
      console.log("📝 Restoring story content:", recoveredStoryContent.length, "characters");
      setStory(recoveredStoryContent);
      storyRestoredRef.current = true;
      
      toast({
        title: "Progress Restored",
        description: `Your previous story (${recoveredStoryContent.length} characters) has been restored.`,
        duration: 4000,
      });
    }
  }, [isRecoveredSession, recoveredStoryContent, toast]);

  // Time warning notifications
  useEffect(() => {
    if (!isActive) return;
    
    if (timeRemaining === 120) {
      toast({ 
        title: "⏰ 2 minutes remaining!", 
        description: "Keep writing your story",
        duration: 3000 
      });
    } else if (timeRemaining === 60) {
      toast({ 
        title: "⚠️ 1 minute left!", 
        description: "Finish up your story soon",
        variant: "destructive",
        duration: 3000 
      });
    } else if (timeRemaining === 30) {
      toast({ 
        title: "🚨 30 seconds!", 
        description: "Your story will be auto-submitted",
        variant: "destructive",
        duration: 3000 
      });
    }
  }, [timeRemaining, isActive, toast]);

  // Add useEffect to monitor state changes for debugging
  useEffect(() => {
    console.log("🔍 State changes detected:");
    console.log("- showCompletionScreen:", showCompletionScreen);
    console.log("- completionData:", completionData);
    console.log("- connectionStatus:", connectionStatus);
    console.log("- timeRemaining:", timeRemaining);
    console.log("- isActive:", isActive);
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
      console.error("Error starting test:", error);
      toast({
        title: "Error",
        description: "Failed to start test. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Manual story submission
  const submitStory = async (wasAutoCompleted = false) => {
    // CRITICAL: Use the ref instead of state to get the current session ID
    const currentSessionId = sessionIdRef.current;

    console.log("📝 submitStory called:", {
      wasAutoCompleted,
      sessionId: currentSessionId,
      hasUserData: !!userData,
      storyLength: story.length,
    });

    // CHECK CHARACTER COUNT FIRST (applies to both manual and auto)
    const storyLength = story.trim().length;
    const MIN_CHARS = 500;
    const MAX_CHARS = 2500;

    if (storyLength < MIN_CHARS || storyLength > MAX_CHARS) {
      let message = "";
      if (storyLength < MIN_CHARS) {
        message = wasAutoCompleted
          ? "Time expired but your story is too short for analysis. Test will be abandoned with no credit deduction."
          : `Please write at least ${MIN_CHARS} characters for proper analysis. You have ${storyLength} characters.`;
      } else {
        message = wasAutoCompleted
          ? "Time expired but your story exceeds the maximum length. Test will be abandoned with no credit deduction."
          : `Your story exceeds the maximum length of ${MAX_CHARS} characters. You have ${storyLength} characters.`;
      }

      toast({
        title: storyLength < MIN_CHARS ? "Story too short" : "Story too long",
        description: message,
        variant: "destructive",
      });

      // Abandon test without credit deduction
      if (currentSessionId) {
        await supabase
          .from("test_sessions")
          .update({
            story_content: story,
            status: "abandoned",
            completed_at: new Date().toISOString(),
          })
          .eq("id", currentSessionId);
      }

      // Stop timer
      await completeSession();

      // Show completion screen with 0 credits deducted
      if (wasAutoCompleted) {
        setCompletionData({
          creditsDeducted: 0,
          remainingCredits: userData?.credit_balance || 0,
          wasAutoCompleted: true,
        });
        setShowCompletionScreen(true);
      } else {
        // For manual submission outside range, just abandon
        onAbandon();
      }

      return; // Exit early - no credit deduction
    }

    // Rest of validation (only for manual submission)
    if (!wasAutoCompleted && !story.trim()) {
      toast({
        title: "Story required",
        description: "Please write your story before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!userData?.id) {
      console.error("❌ No user data available");
      toast({
        title: "Authentication required",
        description: "Please log in to submit your story.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSessionId) {
      console.error("❌ No session ID available in ref");
      toast({
        title: "Session error",
        description: "Test session not found. Please restart the test.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Initialize with 0 credits deducted
    let creditsDeducted = 0;
    let remainingCredits = userData.credit_balance;

    try {
      console.log("✅ Starting submission process for session:", currentSessionId);

      // Update the test session to COMPLETED (not abandoned)
      const { error: updateError } = await supabase
        .from("test_sessions")
        .update({
          story_content: story,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", currentSessionId);

      if (updateError) {
        console.error("❌ Failed to update session:", updateError);
        throw updateError;
      }

      console.log("✅ Story submitted successfully");

      // Complete the timer session
      try {
        await completeSession();
        console.log("✅ Timer session completed");
      } catch (timerError) {
        console.error("⚠️ Timer completion failed (non-critical):", timerError);
      }

      // Deduct credits ONLY if story is valid (500-2500 characters)
      const storyLength = story.trim().length;
      if (storyLength >= 500 && storyLength <= 2500) {
        try {
          const result = await deductCreditsAfterCompletion(currentSessionId);
          if (result.success) {
            console.log("✅ Credits deducted successfully:", result.newBalance);
            creditsDeducted = 100;
            remainingCredits = result.newBalance;
          } else {
            console.error("⚠️ Credit deduction failed:", result.error);
          }
        } catch (creditError) {
          console.error("⚠️ Credit deduction error (non-critical):", creditError);
        }
      } else {
        console.log("⚠️ Skipping credit deduction - story length outside valid range (500-2500)");
      }
    } catch (error) {
      console.error("❌ Critical error in submitStory:", error);

      // Show error toast but still show completion screen
      toast({
        title: "Submission issue",
        description: "Your story was saved but there may have been an issue. Please contact support if needed.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);

      // ALWAYS show completion screen, regardless of errors
      console.log("🎯 Setting completion data:", { creditsDeducted, remainingCredits, wasAutoCompleted });
      setCompletionData({
        creditsDeducted,
        remainingCredits,
        wasAutoCompleted,
      });

      console.log("🎯 Showing completion screen NOW");
      setShowCompletionScreen(true);
    }
  };

  const handleSaveAndExit = async () => {
    const currentSessionId = sessionIdRef.current;

    if (!userData?.id || !currentSessionId) return;

    try {
      await supabase
        .from("test_sessions")
        .update({
          status: "paused",
          story_content: story,
          time_remaining: timeRemaining,
          completed_at: new Date().toISOString(),
        })
        .eq("id", currentSessionId);

      toast({
        title: "Progress Saved",
        description: "Your test has been paused and progress saved.",
      });

      stopTimer();
      onAbandon();
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Close completion screen and exit
  const handleCloseCompletion = () => {
    console.log("👋 User clicked close button on completion screen");
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

  const getProgressBarColor = () => {
    if (timeRemaining < 60) return "rgb(239 68 68)"; // red
    if (timeRemaining < 120) return "rgb(245 158 11)"; // amber
    return "hsl(var(--primary))"; // primary
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case "idle":
        return <Badge variant="secondary">Ready</Badge>;
      case "checking":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking Session
          </Badge>
        );
      case "connecting":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting
          </Badge>
        );
      case "connected":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Starting Timer
          </Badge>
        );
      case "timer_running":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="h-3 w-3" />
            Connection Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Show completion screen
  if (showCompletionScreen && completionData) {
    console.log("🖥️ Rendering completion screen with data:", completionData);
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
                  : "Thank you for completing the TAT test!"}
              </p>
              {story.trim() && (
                <p className="text-sm text-muted-foreground">Your story has been saved and will be analyzed.</p>
              )}
            </div>

            {/* Credit Details */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-center">Credit Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Credits Used</p>
                  <p className="text-lg font-semibold text-primary">{completionData.creditsDeducted}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Remaining Balance</p>
                  <p className="text-lg font-semibold">{completionData.remainingCredits}</p>
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
                      {
                        story
                          .trim()
                          .split(/\s+/)
                          .filter((word) => word.length > 0).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button onClick={handleCloseCompletion} className="w-full gap-2" size="lg">
              <X className="h-4 w-4" />
              Close & Return to Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for insufficient credits before rendering
  if (!hasEnoughCredits() && connectionStatus === "idle") {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Insufficient Credits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You need 100 credits to start this TAT test. Your current balance: {userData?.credit_balance || 0}{" "}
                credits
              </p>
              <Button onClick={() => setShowCreditModal(true)} className="w-full">
                Purchase Credits
              </Button>
            </CardContent>
          </Card>
        </div>
        <CreditPurchaseModal open={showCreditModal} onOpenChange={setShowCreditModal} />
      </>
    );
  }

  // Show start test screen when timer is idle
  if (connectionStatus === "idle" && canStart) {
    return (
      <>
        <div className="space-y-6">
          {/* Mobile Warning Banner */}
          {isMobile && !acknowledgedMobileWarning && (
            <Card className="border-amber-600/30 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Desktop Recommended</h3>
                      <p className="text-sm text-muted-foreground">
                        For the best test-taking experience, we recommend using a desktop or laptop computer. You'll
                        have more screen space, better typing comfort, and can focus without distractions.
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => setAcknowledgedMobileWarning(true)}>
                        I understand, continue anyway
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                <img src={test.image_url} alt={test.title} className="w-full h-full object-contain" />
              </div>
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Duration: 6 minutes</p>
                  <p>Cost: 100 credits</p>
                  <p>Your balance: {userData?.credit_balance || 0} credits</p>
                </div>
                <Button onClick={handleStartTest} disabled={!hasEnoughCredits()} size="lg" className="w-full max-w-sm">
                  Start Test (100 credits)
                </Button>
                {!hasEnoughCredits() && (
                  <Button variant="outline" onClick={() => setShowCreditModal(true)} className="w-full max-w-sm">
                    Purchase Credits
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <CreditPurchaseModal open={showCreditModal} onOpenChange={setShowCreditModal} />
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
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={onAbandon}>
              Return to Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={isMobile ? "pt-20 space-y-4" : "space-y-6"}>
      {/* Timer Header - Mobile: Fixed, Desktop: Card */}
      {isMobile ? (
        <div className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-md">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm truncate">
                {test.title}
              </span>
              {isRecoveredSession && (
                <Badge variant="outline" className="text-xs flex-shrink-0">Resumed</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {getConnectionStatusBadge()}
              <Badge 
                variant="secondary" 
                className={`gap-2 ${getTimerColor()} text-base font-bold px-3 py-1.5`}
              >
                <Clock className="h-5 w-5" />
                <span className="tabular-nums">{timeFormatted}</span>
              </Badge>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div 
              className="h-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${(timeRemaining / (6 * 60)) * 100}%`,
                backgroundColor: getProgressBarColor()
              }}
            />
          </div>
        </div>
      ) : (
        <Card className="shadow-elegant border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {test.title}
                {isRecoveredSession && (
                  <Badge variant="outline" className="text-xs">
                    Resumed
                  </Badge>
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
      )}
 
      {/* Main Test Interface - Responsive Layout */}
      <Card className={`shadow-elegant ${isMobile ? "mt-0" : "mt-6"}`}>
        <div className={`${isMobile ? "space-y-6 pt-4" : "grid grid-cols-5 gap-6"} p-6`}>
          {/* Left Column: Instructions + Image */}
          <div className={`${isMobile ? "" : "col-span-2"} space-y-4`}>
            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{test.prompt_text}</p>
            </div>

            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <img
                src={test.image_url}
                alt={test.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML =
                    '<div class="w-full h-full flex items-center justify-center text-muted-foreground">Image failed to load</div>';
                }}
              />
            </div>
          </div>

          {/* Right Column: Story Writing Area */}
          <div className={`${isMobile ? "" : "col-span-3"}`}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Story</h3>
              <Textarea
                placeholder="Begin writing your story here..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className={`${isMobile ? "min-h-[300px]" : "min-h-[400px]"} text-base leading-relaxed resize-none`}
                disabled={isSubmitting || !isActive}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{story.trim().length} characters</span>
                <span>
                  {
                    story
                      .trim()
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  }{" "}
                  words
                </span>
              </div>

              {story.trim().length > 0 && story.trim().length < 500 && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p>
                    <strong>Minimum 500 characters required</strong> for proper analysis. You need {500 - story.trim().length}{" "}
                    more characters.
                  </p>
                </div>
              )}
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
          disabled={isSubmitting || !story.trim() || story.trim().length < 500 || !isActive}
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

      {story.trim().length > 0 && story.trim().length < 500 && !isSubmitting && (
        <p className="text-sm text-center text-muted-foreground">Write at least 500 characters to enable submission</p>
      )}

      {/* Connection status indicator */}
      {isConnecting && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {connectionStatus === "checking" && "Checking for existing session..."}
              {connectionStatus === "connecting" && "Connecting to timer service..."}
              {connectionStatus === "connected" && "Starting your timer..."}
            </div>
          </CardContent>
        </Card>
      )}

      <CreditPurchaseModal open={showCreditModal} onOpenChange={setShowCreditModal} />
    </div>
  );
};
