import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PreviewBanner } from "@/components/PreviewBanner";
import { Clock, Play, Lock, Crown, Image, AlertTriangle, Monitor, Smartphone } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { DeviceSwitchInstructions } from "@/components/DeviceSwitchInstructions";
import { CreditHeader } from "@/components/CreditHeader";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { trackSignupConversion } from "@/utils/trackConversion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PendingTests = () => {
  const { isPro, userData, hasEnoughCredits } = useUserData();
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

  // Track Google OAuth signup conversions
  useEffect(() => {
    const isNewUser = sessionStorage.getItem('clerk_signup_complete');
    
    if (isNewUser) {
      trackSignupConversion();
      sessionStorage.removeItem('clerk_signup_complete');
    }
  }, []);

  useEffect(() => {
    console.log('PendingTests - useEffect triggered', { 
      isSignedIn,
      hasUserId: !!userData?.id
    });
    fetchTests(); // Always fetch tests, regardless of authentication
  }, [userData?.id, isSignedIn]);

  const fetchTests = async () => {
    console.log('PendingTests - Starting fetchTests. User ID:', userData?.id || 'none (unauthenticated)');
    
    try {
      // 1. Fetch all active tests (works for everyone - no auth required)
      const { data: allTests, error: testsError } = await supabase
        .from('tattest')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (testsError) {
        console.error('PendingTests - Error fetching tests:', testsError);
        setTests([]);
        return;
      }

      if (!allTests || allTests.length === 0) {
        console.log('PendingTests - No tests found');
        setTests([]);
        return;
      }

      console.log('PendingTests - Fetched all tests:', allTests.length);

      // 2. For authenticated users, fetch their session data
      let userSessions: any[] = [];
      if (userData?.id) {
        const testIds = allTests.map(test => test.id);
        const { data: sessions, error: sessionsError } = await supabase
          .from('test_sessions')
          .select('tattest_id, status, completed_at, time_remaining, started_at, story_content')
          .eq('user_id', userData.id)
          .in('tattest_id', testIds);

        if (!sessionsError && sessions) {
          userSessions = sessions;
          console.log('PendingTests - Fetched user sessions:', userSessions.length);
        }
      }

      // 3. Process tests based on whether user is authenticated
      const processedTests = allTests
        .filter(test => {
          // For unauthenticated users, show all tests
          if (!userData?.id) return true;
          
          // For authenticated users, filter out completed tests
          const testSessions = userSessions.filter(session => session.tattest_id === test.id);
          const hasCompletedSession = testSessions.some(session => 
            session.status === 'completed' || 
            (session.status === 'abandoned' && session.story_content?.trim().length > 0)
          );
          return !hasCompletedSession;
        })
        .map(test => {
          // For unauthenticated users, return basic test info
          if (!userData?.id) {
            return {
              id: test.id,
              title: test.title,
              description: test.description || `Complete this TAT assessment: ${test.prompt_text?.substring(0, 100)}...`,
              estimatedTime: "10-15 minutes",
              difficulty: "Intermediate",
              isPremium: false,
              imageUrl: test.image_url,
              sessionStatus: null,
              timeRemaining: null,
              hasSession: false,
              isPaused: false,
              isActive: false,
              hasActiveSession: false
            };
          }
          
          // For authenticated users, include session info
          const testSessions = userSessions.filter(session => session.tattest_id === test.id);
          const latestSession = testSessions.sort((a, b) => 
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          )[0];
          
          const isPaused = latestSession?.status === 'paused';
          const isActive = latestSession?.status === 'active';
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
            hasActiveSession: hasActiveSession
          };
        });

      console.log('PendingTests - Processed tests:', processedTests.length);
      setTests(processedTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const availableTests = isPro ? tests : tests.filter(test => !test.isPremium);
  const lockedTests = isPro ? [] : tests.filter(test => test.isPremium);

  // Check for any active test session across all tests
  const checkForActiveSession = async () => {
    if (!userData?.id) return null;

    try {
      const { data: activeSession, error } = await supabase
        .from('test_sessions')
        .select(`
          *,
          tattest:tattest_id (
            id,
            title
          )
        `)
        .eq('user_id', userData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking for active session:', error);
        return null;
      }

      return activeSession;
    } catch (error) {
      console.error('Error checking for active session:', error);
      return null;
    }
  };

  const startTest = async (test: any) => {
    // Check authentication first
    if (!isSignedIn) {
      navigate('/auth/signup?returnUrl=/dashboard/pending');
      return;
    }

    // Then check if user has enough credits
    if (!hasEnoughCredits(100)) {
      toast({
        title: "Insufficient Credits",
        description: `You need 100 credits to start this test. You currently have ${userData?.credit_balance || 0} credits.`,
        variant: "destructive"
      });
      return;
    }

    // Check for mobile device and show warning
    if (isMobile) {
      setSelectedTest(test);
      setShowMobileWarningDialog(true);
      return;
    }

    // Check for any active test session first
    const existingActiveSession = await checkForActiveSession();
    if (existingActiveSession) {
      setActiveSession(existingActiveSession);
      setSelectedTest(test);
      setShowActiveSessionDialog(true);
      return;
    }

    // Show confirmation dialog
    setSelectedTest(test);
    setShowConfirmDialog(true);
  };

  const confirmStartTest = async () => {
    if (!selectedTest) return;

    try {
      // Open test in new window
      const testUrl = `/test/${selectedTest.id}`;
      const testWindow = window.open(testUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      
      if (!testWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to open the test in a new window.",
          variant: "destructive"
        });
        return;
      }

      // Refresh tests when the window closes
      const checkClosed = setInterval(() => {
        if (testWindow.closed) {
          clearInterval(checkClosed);
          fetchTests(); // Refresh the test list
        }
      }, 1000);

      // Close dialog
      setShowConfirmDialog(false);
      setSelectedTest(null);

    } catch (error) {
      console.error('Error starting test:', error);
      toast({
        title: "Error starting test",
        description: "There was an error opening the test. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTestComplete = () => {
    fetchTests(); // Refresh the test list
    toast({
      title: "Test completed!",
      description: "Your story has been submitted successfully.",
      variant: "default"
    });
  };

  const handleTestAbandon = () => {
    fetchTests(); // Refresh the test list
  };

  const handleResumeActiveSession = () => {
    if (!activeSession) return;
    
    // Open the active test in new window
    const testUrl = `/test/${activeSession.tattest_id}`;
    const testWindow = window.open(testUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (!testWindow) {
      toast({
        title: "Popup blocked",
        description: "Please allow popups for this site to open the test in a new window.",
        variant: "destructive"
      });
      return;
    }

    // Close active session dialog
    setShowActiveSessionDialog(false);
    setActiveSession(null);
    setSelectedTest(null);

    // Monitor window closure and refresh
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
      // Update session status to abandoned
      const { error } = await supabase
        .from('test_sessions')
        .update({ status: 'abandoned' })
        .eq('id', activeSession.id);

      if (error) {
        console.error('Error abandoning session:', error);
        toast({
          title: "Error",
          description: "Failed to abandon the active session. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Close active session dialog and show confirmation dialog for new test
      setShowActiveSessionDialog(false);
      setActiveSession(null);
      setShowConfirmDialog(true);

      toast({
        title: "Session Abandoned",
        description: "Your previous test session has been abandoned. You can now start a new test.",
      });

    } catch (error) {
      console.error('Error abandoning session:', error);
      toast({
        title: "Error",
        description: "Failed to abandon the active session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      case "Expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // If there's an active test, show the test interface
  // This is now removed since tests open in new windows

  return (
    <div className="space-y-6">
      {!isSignedIn && <PreviewBanner />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Tests</h1>
          <p className="text-muted-foreground">
            Continue your psychological assessment journey
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CreditHeader />
          <Badge variant="secondary" className="gap-2">
            <Clock className="h-4 w-4" />
            {availableTests.length} Available
          </Badge>
        </div>
      </div>

      {/* Available Tests */}
      {availableTests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Ready to Take</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {availableTests.map((test) => (
              <Card key={test.id} className="shadow-elegant hover:shadow-lg transition-shadow overflow-hidden">
                {/* Large image section at top */}
                <div 
                  className="relative w-full h-48 bg-muted overflow-hidden cursor-pointer group" 
                  onClick={() => startTest(test)}
                >
                  {test.imageUrl && !test.imageUrl.startsWith('/src/assets') ? (
                    <img 
                      src={test.imageUrl} 
                      alt={test.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.log('Image load error for:', test.imageUrl);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Content section below image */}
                <div className="p-6 space-y-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      {test.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{test.description}</CardDescription>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Estimated time: {test.estimatedTime}</span>
                      {test.isPaused && (
                        <Badge variant="outline" className="text-xs">Paused</Badge>
                      )}
                      {test.isActive && (
                        <Badge variant="outline" className="text-xs">In Progress</Badge>
                      )}
                    </div>
                    <Badge className={getDifficultyColor(test.difficulty)}>
                      {test.difficulty}
                    </Badge>
                  </div>
                  <Button 
                    variant={(!isSignedIn || !hasEnoughCredits(100)) ? "outline" : "hero"}
                    className="w-full gap-2"
                    onClick={() => startTest(test)}
                    disabled={isSignedIn && !hasEnoughCredits(100)}
                  >
                    {!isSignedIn ? (
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
                        {test.isPaused ? 'Resume Test' : test.isActive ? 'Continue Test' : 'Start Test'}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Tests for Free Users */}
      {lockedTests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pro Tests</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Unlock
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {lockedTests.map((test) => (
              <Card key={test.id} className="shadow-elegant opacity-75 border-dashed overflow-hidden">
                {/* Large image section at top with lock overlay */}
                <div className="relative w-full h-48 bg-muted overflow-hidden">
                  {test.imageUrl && !test.imageUrl.startsWith('/src/assets') ? (
                    <img 
                      src={test.imageUrl} 
                      alt={test.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.log('Image load error for:', test.imageUrl);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <Lock className="h-8 w-8 text-overlay-foreground" />
                  </div>
                </div>
                
                {/* Content section below image */}
                <div className="p-6 space-y-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      {test.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{test.description}</CardDescription>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Estimated time: {test.estimatedTime}</span>
                    </div>
                    <Badge className={getDifficultyColor(test.difficulty)}>
                      {test.difficulty}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled
                  >
                    <Lock className="h-4 w-4" />
                    Pro Only
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && availableTests.length === 0 && userData?.id && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Tests Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {tests.length === 0 ? "No tests have been created yet." : "All tests have been completed!"}
              </p>
              {!isPro && tests.length > 0 && (
                <Button variant="hero" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade for More Tests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-elegant overflow-hidden">
              <div className="w-full h-48 bg-muted animate-pulse" />
              <div className="p-6 space-y-4">
                <div>
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Active Session Dialog */}
      <AlertDialog open={showActiveSessionDialog} onOpenChange={setShowActiveSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Active Test Session Running
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p>
                You currently have an active test session running: <strong>{activeSession?.tattest?.title || 'Unknown Test'}</strong>
              </p>
              <p>
                You can only have one active test session at a time. Please choose an option:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li><strong>Resume Current Test:</strong> Continue your active session</li>
                <li><strong>Abandon Current Test:</strong> End the active session and start the new test</li>
                <li><strong>Cancel:</strong> Stay on this page without making changes</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={() => {
              setShowActiveSessionDialog(false);
              setActiveSession(null);
              setSelectedTest(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleAbandonActiveSession}>
              Abandon Current Test
            </Button>
            <AlertDialogAction onClick={handleResumeActiveSession}>
              Resume Current Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Warning Dialog */}
      <AlertDialog open={showMobileWarningDialog} onOpenChange={setShowMobileWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-amber-600" />
              Desktop Recommended
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <p>
                For the best test-taking experience, we strongly recommend using a desktop or laptop computer.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <p className="font-medium text-foreground">Benefits of using desktop:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Larger screen for better image visibility</li>
                  <li>Physical keyboard for comfortable typing</li>
                  <li>Better focus without mobile distractions</li>
                  <li>More reliable for timed sessions</li>
                </ul>
              </div>
              <p className="text-sm">
                Would you like to switch to a desktop device or continue on mobile?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={() => {
              setShowMobileWarningDialog(false);
              setSelectedTest(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <Button 
              variant="outline"
              onClick={async () => {
                setShowMobileWarningDialog(false);
                // Check for active session before continuing
                const existingActiveSession = await checkForActiveSession();
                if (existingActiveSession) {
                  setActiveSession(existingActiveSession);
                  setShowActiveSessionDialog(true);
                } else {
                  setShowConfirmDialog(true);
                }
              }}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Continue on Mobile
            </Button>
            <AlertDialogAction 
              onClick={() => {
                setShowMobileWarningDialog(false);
                setShowDeviceSwitchDialog(true);
              }}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Switch to Desktop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Device Switch Instructions Dialog */}
      <AlertDialog open={showDeviceSwitchDialog} onOpenChange={setShowDeviceSwitchDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="sr-only">Device Switch Instructions</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedTest && (
            <DeviceSwitchInstructions 
              testId={selectedTest.id} 
              testTitle={selectedTest.title}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeviceSwitchDialog(false);
              setSelectedTest(null);
            }}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Important Test Instructions
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p>
                Please ensure you complete this psychological assessment in one session without interruptions.
              </p>
              <p>
                <strong>Important Notes:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Set aside 10-15 minutes of uninterrupted time</li>
                <li>Results may be delayed during peak traffic hours</li>
                <li>We conduct assessments globally, processing high volumes daily</li>
                <li>Your session will be saved if you need to pause briefly</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Are you ready to begin your assessment now?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false);
              setSelectedTest(null);
            }}>
              Not Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartTest}>
              Yes, Start Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PendingTests;