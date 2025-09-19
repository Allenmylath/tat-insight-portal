import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, Lock, Crown, Image, AlertTriangle } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreditHeader } from "@/components/CreditHeader";
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
  const { toast } = useToast();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  useEffect(() => {
    console.log('PendingTests - useEffect triggered', { 
      hasUserId: !!userData?.id, 
      userId: userData?.id 
    });
    if (userData?.id) {
      fetchTests();
    }
  }, [userData?.id]);

  const fetchTests = async () => {
    if (!userData?.id) {
      console.log('PendingTests - fetchTests blocked: no user ID');
      return;
    }
    
    console.log('PendingTests - Starting fetchTests for user:', userData.id);
    
    try {
      // First, get all active tests
      const { data: allTests, error: testsError } = await supabase
        .from('tattest')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (testsError) {
        console.error('PendingTests - Error fetching tests:', testsError);
        return;
      }

      console.log('PendingTests - Fetched all tests:', allTests?.length || 0, allTests);

      if (!allTests || allTests.length === 0) {
        console.log('PendingTests - No tests found, setting empty array');
        setTests([]);
        return;
      }

      // Then, get user's test sessions for these tests
      const testIds = allTests.map(test => test.id);
      const { data: userSessions, error: sessionsError } = await supabase
        .from('test_sessions')
        .select('tattest_id, status, completed_at, time_remaining, started_at, story_content')
        .eq('user_id', userData.id)
        .in('tattest_id', testIds);

      if (sessionsError) {
        console.error('PendingTests - Error fetching user sessions:', sessionsError);
        return;
      }

      console.log('PendingTests - Fetched user sessions:', userSessions?.length || 0, userSessions);

      // Filter to only show pending tests (never completed)
      const pendingTests = allTests
        .filter(test => {
          const testSessions = userSessions?.filter(session => session.tattest_id === test.id) || [];
          
          // If any session is completed, don't show it as pending
          const hasCompletedSession = testSessions.some(session => 
            session.status === 'completed' || 
            (session.status === 'abandoned' && session.story_content && session.story_content.trim().length > 0)
          );
          return !hasCompletedSession;
        })
        .map((test) => {
          const testSessions = userSessions?.filter(session => session.tattest_id === test.id) || [];
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

      console.log('PendingTests - Final pending tests:', pendingTests.length, pendingTests);
      setTests(pendingTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableTests = isPro ? tests : tests.filter(test => !test.isPremium);
  const lockedTests = isPro ? [] : tests.filter(test => test.isPremium);

  const startTest = (test: any) => {
    // Check if user has enough credits before starting test
    if (!hasEnoughCredits(100)) {
      toast({
        title: "Insufficient Credits",
        description: `You need 100 credits to start this test. You currently have ${userData?.credit_balance || 0} credits.`,
        variant: "destructive"
      });
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
              <Card key={test.id} className="shadow-elegant hover:shadow-lg transition-shadow">
                <div className="flex gap-4 p-6">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {test.imageUrl && !test.imageUrl.startsWith('/src/assets') ? (
                      <img 
                        src={test.imageUrl} 
                        alt={test.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image load error for:', test.imageUrl);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
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
                      variant={!hasEnoughCredits(100) ? "outline" : "hero"}
                      className="w-full gap-2"
                      onClick={() => startTest(test)}
                      disabled={!hasEnoughCredits(100)}
                    >
                      <Play className="h-4 w-4" />
                      {!hasEnoughCredits(100) 
                        ? 'Insufficient Credits' 
                        : test.isPaused ? 'Resume Test' : test.isActive ? 'Continue Test' : 'Start Test'
                      }
                    </Button>
                  </div>
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
              <Card key={test.id} className="shadow-elegant opacity-75 border-dashed">
                <div className="flex gap-4 p-6">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                    {test.imageUrl && !test.imageUrl.startsWith('/src/assets') ? (
                      <img 
                        src={test.imageUrl} 
                        alt={test.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image load error for:', test.imageUrl);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                        {test.title}
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">{test.description}</CardDescription>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated time: {test.estimatedTime}</span>
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full gap-2" disabled>
                      <Lock className="h-4 w-4" />
                      Requires Pro
                    </Button>
                  </div>
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
            <Card key={i} className="shadow-elegant">
              <div className="flex gap-4 p-6">
                <div className="w-16 h-16 bg-muted rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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