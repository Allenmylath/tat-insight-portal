import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PreviewBanner } from "@/components/PreviewBanner";
import { Clock, Play, Lock, Crown, Image, AlertTriangle, Monitor, Smartphone } from "lucide-react";
import { LazyImage } from "@/components/LazyImage";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { DeviceSwitchInstructions } from "@/components/DeviceSwitchInstructions";
import { CreditHeader } from "@/components/CreditHeader";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PendingTests = () => {
  const { isPro, userData, hasEnoughCredits, loading: userDataLoading } = useUserData();
  const { isSignedIn } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showActiveSessionDialog, setShowActiveSessionDialog] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [showMobileWarningDialog, setShowMobileWarningDialog] = useState(false);
  const [showDeviceSwitchDialog, setShowDeviceSwitchDialog] = useState(false);
  const [startingTestId, setStartingTestId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      toast({
        title: "🎉 Welcome to Pro!",
        description: "You now have unlimited access to all TAT tests",
        duration: 5000,
      });
      window.history.replaceState({}, '', '/dashboard/pending');
    }
  }, []);

  useEffect(() => {
    console.log("PendingTests - useEffect triggered", {
      isSignedIn,
      hasUserId: !!userData?.id,
    });
    fetchTests();
  }, [userData?.id, isSignedIn]);

  const fetchTests = async () => {
    console.log("PendingTests - Starting fetchTests. User ID:", userData?.id || "none (unauthenticated)");

    try {
      // 1. Fetch all active tests
      const { data: allTests, error: testsError } = await supabase
        .from("tattest")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (testsError) {
        console.error("PendingTests - Error fetching tests:", testsError);
        setTests([]);
        return;
      }

      if (!allTests || allTests.length === 0) {
        console.log("PendingTests - No tests found");
        setTests([]);
        return;
      }

      console.log("PendingTests - Fetched all tests:", allTests.length);

      // 2. For authenticated users, fetch their session data
      let userSessions: any[] = [];
      if (userData?.id) {
        const testIds = allTests.map((test) => test.id);
        const { data: sessions, error: sessionsError } = await supabase
          .from("test_sessions")
          .select("tattest_id, status, completed_at, time_remaining, started_at, story_content")
          .eq("user_id", userData.id)
          .in("tattest_id", testIds);

        if (!sessionsError && sessions) {
          userSessions = sessions;
          console.log("PendingTests - Fetched user sessions:", userSessions.length);
        }
      }

      // 3. Process tests
      const processedTests = allTests
        .filter((test) => {
          if (!userData?.id) return true;

          const testSessions = userSessions.filter((session) => session.tattest_id === test.id);
          const hasCompletedSession = testSessions.some(
            (session) =>
              session.status === "completed" ||
              (session.status === "abandoned" && session.story_content?.trim().length > 0),
          );
          return !hasCompletedSession;
        })
        .map((test) => {
          if (!userData?.id) {
            return {
              id: test.id,
              title: test.title,
              description:
                test.description || `Complete this TAT assessment: ${test.prompt_text?.substring(0, 100)}...`,
              estimatedTime: "10-15 minutes",
              difficulty: "Intermediate",
              isPremium: false,
              imageUrl: test.image_url,
              sessionStatus: null,
              timeRemaining: null,
              hasSession: false,
              isPaused: false,
              isActive: false,
              hasActiveSession: false,
            };
          }

          const testSessions = userSessions.filter((session) => session.tattest_id === test.id);
          const latestSession = testSessions.sort(
            (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
          )[0];

          const isPaused = latestSession?.status === "paused";
          const isActive = latestSession?.status === "active";
          const hasActiveSession = isPaused || isActive;

          return {
            id: test.id,
            title: test.title,
            description: test.description || `Complete this TAT assessment: ${test.prompt_text?.substring(0, 100)}...`,
            estimatedTime: "10-15 minutes",
            difficulty: "Intermediate",
            isPremium: false,
            imageUrl: test.image_url,
            sessionStatus: latestSession?.status || null,
            timeRemaining: latestSession?.time_remaining || null,
            hasSession: testSessions.length > 0,
            isPaused: isPaused,
            isActive: isActive,
            hasActiveSession: hasActiveSession,
          };
        });

      console.log("PendingTests - Processed tests:", processedTests.length);
      setTests(processedTests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const availableTests = isPro ? tests : tests.filter((test) => !test.isPremium);
  const lockedTests = isPro ? [] : tests.filter((test) => test.isPremium);

  // Check for any active test session
  const checkForActiveSession = async () => {
    if (!userData?.id) return null;

    try {
      const { data: activeSession, error } = await supabase
        .from("test_sessions")
        .select(
          `
          *,
          tattest:tattest_id (
            id,
            title
          )
        `,
        )
        .eq("user_id", userData.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking for active session:", error);
        return null;
      }

      return activeSession;
    } catch (error) {
      console.error("Error checking for active session:", error);
      return null;
    }
  };

  const startTest = async (test: any) => {
    setStartingTestId(test.id);
    
    // Check authentication first
    if (!isSignedIn) {
      navigate("/auth/signup?returnUrl=/dashboard/pending");
      setStartingTestId(null);
      return;
    }

    // Check credits (Pro users bypass this check)
    if (!isPro && !hasEnoughCredits(100)) {
      toast({
        title: "Insufficient Credits",
        description: `You need 100 credits to start this test. You currently have ${userData?.credit_balance || 0} credits.`,
        variant: "destructive",
      });
      setStartingTestId(null);
      return;
    }

    // On desktop, show mobile warning if applicable
    if (!isMobile) {
      // Check for active session
      const existingActiveSession = await checkForActiveSession();
      if (existingActiveSession) {
        setActiveSession(existingActiveSession);
        setSelectedTest(test);
        setShowActiveSessionDialog(true);
        setStartingTestId(null);
        return;
      }

      // Show confirmation dialog
      setSelectedTest(test);
      setShowConfirmDialog(true);
      setStartingTestId(null);
      return;
    }

    // On mobile, navigate directly to test page (no popup, no warnings)
    const existingActiveSession = await checkForActiveSession();
    if (existingActiveSession) {
      setActiveSession(existingActiveSession);
      setSelectedTest(test);
      setShowActiveSessionDialog(true);
      setStartingTestId(null);
      return;
    }

    // Show confirmation dialog before starting
    setSelectedTest(test);
    setShowConfirmDialog(true);
    setStartingTestId(null);
  };

  const confirmStartTest = async () => {
    if (!selectedTest) return;

    try {
      const testUrl = `/test/${selectedTest.id}`;

      // On mobile: navigate in same window
      if (isMobile) {
        navigate(testUrl);
        return;
      }

      // On desktop: open in new window
      const testWindow = window.open(testUrl, "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes");

      if (!testWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to open the test in a new window.",
          variant: "destructive",
        });
        return;
      }

      // Monitor window closure and refresh
      const checkClosed = setInterval(() => {
        if (testWindow.closed) {
          clearInterval(checkClosed);
          fetchTests();
        }
      }, 1000);

      setShowConfirmDialog(false);
      setSelectedTest(null);
    } catch (error) {
      console.error("Error starting test:", error);
      toast({
        title: "Error starting test",
        description: "There was an error opening the test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResumeActiveSession = () => {
    if (!activeSession) return;

    const testUrl = `/test/${activeSession.tattest_id}`;

    // On mobile: navigate in same window
    if (isMobile) {
      navigate(testUrl);
      return;
    }

    // On desktop: open in new window
    const testWindow = window.open(testUrl, "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes");

    if (!testWindow) {
      toast({
        title: "Popup blocked",
        description: "Please allow popups for this site to open the test in a new window.",
        variant: "destructive",
      });
      return;
    }

    setShowActiveSessionDialog(false);
    setActiveSession(null);
    setSelectedTest(null);

    // Monitor window closure
    const checkClosed = setInterval(() => {
      if (testWindow.closed) {
        clearInterval(checkClosed);
        fetchTests();
      }
    }, 1000);
  };

  const handleAbandonActiveSession = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase.from("test_sessions").update({ status: "abandoned" }).eq("id", activeSession.id);

      if (error) {
        console.error("Error abandoning session:", error);
        toast({
          title: "Error",
          description: "Failed to abandon the active session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setShowActiveSessionDialog(false);
      setActiveSession(null);
      setShowConfirmDialog(true);

      toast({
        title: "Session Abandoned",
        description: "Your previous test session has been abandoned. You can now start a new test.",
      });
    } catch (error) {
      console.error("Error abandoning session:", error);
      toast({
        title: "Error",
        description: "Failed to abandon the active session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Expert":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {!isSignedIn && <PreviewBanner />}

      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pending Tests</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Continue your psychological assessment journey</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <CreditHeader />
          <Badge variant="secondary" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            {availableTests.length} Available
          </Badge>
        </div>
      </div>

      {/* Available Tests - Mobile Optimized Grid */}
      {availableTests.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Ready to Take</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {availableTests.map((test) => (
              <Card key={test.id} className="shadow-elegant hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image Section - Responsive Height */}
                <div
                  className="relative w-full h-40 sm:h-48 bg-muted overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform"
                  onClick={() => startTest(test)}
                >
                  {test.imageUrl && !test.imageUrl.startsWith("/src/assets") ? (
                    <LazyImage
                      src={test.imageUrl}
                      alt={test.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      placeholderClassName="w-full h-40 sm:h-48"
                      priority={false}
                      onError={() => console.log("Image load error for:", test.imageUrl)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content Section - Mobile Optimized Padding */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <span className="line-clamp-2">{test.title}</span>
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{test.description}</CardDescription>
                  </div>

                  {/* Meta Info - Stacked on Mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-muted-foreground text-xs sm:text-sm">{test.estimatedTime}</span>
                      {test.isPaused && (
                        <Badge variant="outline" className="text-xs">
                          Paused
                        </Badge>
                      )}
                      {test.isActive && (
                        <Badge variant="outline" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${getDifficultyColor(test.difficulty)} text-xs w-fit`}>{test.difficulty}</Badge>
                  </div>

                  {/* Button - Touch Optimized */}
                  <Button
                    variant={!isSignedIn || (!isPro && !hasEnoughCredits(100)) ? "outline" : "hero"}
                    className="w-full gap-2 min-h-[44px] text-sm sm:text-base active:scale-95 transition-transform"
                    onClick={() => startTest(test)}
                    disabled={startingTestId === test.id || (isSignedIn && !isPro && !hasEnoughCredits(100))}
                  >
                    {startingTestId === test.id ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : !isSignedIn ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Login to Continue
                      </>
                    ) : !hasEnoughCredits(100) ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Insufficient Credits
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {test.isPaused ? "Resume Test" : test.isActive ? "Continue Test" : "Start Test"}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Tests - Mobile Optimized */}
      {lockedTests.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Pro Tests</h2>
            <Button variant="outline" size="sm" className="gap-2 min-h-[44px] w-full sm:w-auto">
              <Crown className="h-4 w-4" />
              Upgrade to Unlock
            </Button>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {lockedTests.map((test) => (
              <Card key={test.id} className="shadow-elegant opacity-75 border-dashed overflow-hidden">
                {/* Image with Lock Overlay */}
                <div className="relative w-full h-40 sm:h-48 bg-muted overflow-hidden">
                  {test.imageUrl && !test.imageUrl.startsWith("/src/assets") ? (
                    <img
                      src={test.imageUrl}
                      alt={test.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.log("Image load error for:", test.imageUrl);
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <span className="line-clamp-2">{test.title}</span>
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{test.description}</CardDescription>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                    <span className="text-muted-foreground text-xs sm:text-sm">{test.estimatedTime}</span>
                    <Badge className={`${getDifficultyColor(test.difficulty)} text-xs w-fit`}>{test.difficulty}</Badge>
                  </div>

                  <Button variant="outline" className="w-full gap-2 min-h-[44px] text-sm sm:text-base" disabled>
                    <Lock className="h-4 w-4" />
                    Pro Only
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Tests Available */}
      {!loading && availableTests.length === 0 && userData?.id && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 sm:py-8 px-4">
              <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="font-medium text-foreground mb-2 text-base sm:text-lg">No Tests Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {tests.length === 0 ? "No tests have been created yet." : "All tests have been completed!"}
              </p>
              {!isPro && tests.length > 0 && (
                <Button variant="hero" className="gap-2 min-h-[44px] w-full sm:w-auto">
                  <Crown className="h-4 w-4" />
                  Upgrade for More Tests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State - Mobile Optimized */}
      {loading && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-elegant overflow-hidden">
              <div className="w-full h-40 sm:h-48 bg-muted animate-pulse" />
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Active Session Dialog - Mobile Optimized */}
      <AlertDialog open={showActiveSessionDialog} onOpenChange={setShowActiveSessionDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <span>Active Test Session Running</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left text-sm">
              <p>
                You currently have an active test session running:{" "}
                <strong>{activeSession?.tattest?.title || "Unknown Test"}</strong>
              </p>
              <p>You can only have one active test session at a time. Please choose an option:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs sm:text-sm">
                <li>
                  <strong>Resume:</strong> Continue your active session
                </li>
                <li>
                  <strong>Abandon:</strong> End the active session and start new test
                </li>
                <li>
                  <strong>Cancel:</strong> Stay on this page
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              onClick={() => {
                setShowActiveSessionDialog(false);
                setActiveSession(null);
                setSelectedTest(null);
              }}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleAbandonActiveSession} className="min-h-[44px] w-full sm:w-auto">
              Abandon Current Test
            </Button>
            <AlertDialogAction onClick={handleResumeActiveSession} className="min-h-[44px] w-full sm:w-auto">
              Resume Current Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Device Switch Instructions Dialog - Mobile Optimized */}
      <AlertDialog open={showDeviceSwitchDialog} onOpenChange={setShowDeviceSwitchDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="sr-only">Device Switch Instructions</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedTest && <DeviceSwitchInstructions testId={selectedTest.id} testTitle={selectedTest.title} />}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeviceSwitchDialog(false);
                setSelectedTest(null);
              }}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog - Mobile Optimized */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <span>Important Test Instructions</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left text-sm">
              <p>Please ensure you complete this psychological assessment in one session without interruptions.</p>
              <p>
                <strong>Important Notes:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs sm:text-sm">
                <li>Set aside 10-15 minutes of uninterrupted time</li>
                <li>Results may be delayed during peak traffic hours</li>
                <li>We conduct assessments globally, processing high volumes daily</li>
                <li>Your session will be saved if you need to pause briefly</li>
              </ul>
              <p className="text-xs sm:text-sm text-muted-foreground">Are you ready to begin your assessment now?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              onClick={() => {
                setShowConfirmDialog(false);
                setSelectedTest(null);
              }}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Not Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartTest} className="min-h-[44px] w-full sm:w-auto">
              Yes, Start Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PendingTests;
