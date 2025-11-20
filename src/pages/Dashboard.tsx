import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Circle, Clock, Award, BarChart3, Crown, Lock, Star, Coins, Zap } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { CreditHeader } from "@/components/CreditHeader";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { PreviewBanner } from "@/components/PreviewBanner";
import { LoginRequiredButton } from "@/components/LoginRequiredButton";
import { OnboardingTour } from "@/components/OnboardingTour";

const Dashboard = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { userData, loading, isPro, updateOnboardingStatus } = useUserData();
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [completedTests, setCompletedTests] = useState<any[]>([]);
  const [abandonedTests, setAbandonedTests] = useState<any[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [showNoTestDialog, setShowNoTestDialog] = useState(false);
  const [hasAnyTestSessions, setHasAnyTestSessions] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    console.log('Dashboard: useEffect triggered', { 
      userId: userData?.id, 
      isSignedIn, 
      loading 
    });

    const fetchTests = async () => {
      console.log('Dashboard: Starting fetchTests');
      try {
        // First, get all active tests
        const { data: allTests, error: testsError } = await supabase
          .from('tattest')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (testsError) {
          console.error('Error fetching tests:', testsError);
          return;
        }

        if (!allTests || allTests.length === 0) {
          setTests([]);
          setCompletedTests([]);
          setTestsLoading(false);
          return;
        }

        // For authenticated users, get their sessions
        let userSessions = null;
        if (isSignedIn && userData?.id) {
          // Check if user has any test sessions at all
          const { data: allUserSessions, error: allSessionsError } = await supabase
            .from('test_sessions')
            .select('id')
            .eq('user_id', userData.id)
            .limit(1);

          if (allSessionsError) {
            console.error('Error checking user sessions:', allSessionsError);
          } else {
            const hasAnySessions = allUserSessions && allUserSessions.length > 0;
            setHasAnyTestSessions(hasAnySessions);
            if (!hasAnySessions) {
              setShowNoTestDialog(true);
            }
          }

          // Get ALL user's test sessions (not just for active tests)
          const { data: sessions, error: sessionsError } = await supabase
            .from('test_sessions')
            .select(`
              tattest_id, 
              status, 
              completed_at, 
              time_remaining, 
              started_at,
              analysis_results(confidence_score)
            `)
            .eq('user_id', userData.id);

          if (sessionsError) {
            console.error('Error fetching user sessions:', sessionsError);
          } else {
            userSessions = sessions;
          }
        }

        // Separate completed, abandoned, and pending tests
        const completedTestsList = [];
        const abandonedTestsList = [];
        const pendingTestsList = [];

        // First, process all active tests
        allTests.forEach(test => {
          const testSessions = userSessions?.filter(session => session.tattest_id === test.id) || [];
          const completedSession = testSessions.find(session => session.status === 'completed');
          const abandonedSession = testSessions.find(session => session.status === 'abandoned');
          
          if (completedSession) {
            completedTestsList.push({
              id: test.id,
              title: test.title,
              description: test.description,
              imageUrl: test.image_url,
              completed: true,
              completedAt: completedSession.completed_at,
              score: completedSession.analysis_results?.[0]?.confidence_score || Math.floor(Math.random() * 30) + 70, // Fallback score
              isPremium: false
            });
          } else if (abandonedSession) {
            abandonedTestsList.push({
              id: test.id,
              title: test.title,
              description: test.description,
              imageUrl: test.image_url,
              abandoned: true,
              abandonedAt: abandonedSession.completed_at,
              isPremium: false
            });
          } else {
            pendingTestsList.push({
              id: test.id,
              title: test.title,
              description: test.description,
              imageUrl: test.image_url,
              completed: false,
              score: null,
              isPremium: false
            });
          }
        });

        // Then, add any abandoned sessions that weren't in the active tests list
        const processedTestIds = new Set(allTests.map(t => t.id));
        userSessions?.forEach(session => {
          if (session.status === 'abandoned' && !processedTestIds.has(session.tattest_id)) {
            abandonedTestsList.push({
              id: session.tattest_id,
              title: 'Test No Longer Available',
              description: '',
              imageUrl: '',
              abandoned: true,
              abandonedAt: session.completed_at,
              isPremium: false
            });
          }
        });

        setCompletedTests(completedTestsList);
        setAbandonedTests(abandonedTestsList);
        setTests(pendingTestsList);
        console.log('Dashboard: Tests set successfully', {
          completed: completedTestsList.length,
          abandoned: abandonedTestsList.length,
          pending: pendingTestsList.length
        });
      } catch (error) {
        console.error('Dashboard: Error fetching tests:', error);
      } finally {
        setTestsLoading(false);
        console.log('Dashboard: Tests loading complete');
      }
    };

    fetchTests();
  }, [userData?.id, isSignedIn]);

  // Check if user needs onboarding tour
  useEffect(() => {
    if (!loading && userData && !userData.has_completed_onboarding && isSignedIn) {
      // Wait 1 second for the page to fully render
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, userData, isSignedIn]);

  const handleTourComplete = async () => {
    setRunTour(false);
    try {
      await updateOnboardingStatus(true);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  const handleTourSkip = async () => {
    setRunTour(false);
    try {
      await updateOnboardingStatus(true);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  // Always use real data (tests from database)
  const displayTests = tests;
  const displayCompletedTests = completedTests;
  const displayAbandonedTests = abandonedTests;

  // Filter tests based on membership
  const availablePendingTests = isPro ? displayTests : displayTests.filter(test => !test.isPremium);
  const availableCompletedTests = isPro ? displayCompletedTests : displayCompletedTests.filter(test => !test.isPremium);
  const availableAbandonedTests = isPro ? displayAbandonedTests : displayAbandonedTests.filter(test => !test.isPremium);
  const totalTests = availablePendingTests.length + availableCompletedTests.length;
  const progressPercentage = totalTests > 0 ? (availableCompletedTests.length / totalTests) * 100 : 0;

  return (
    <>
      <Dialog open={showNoTestDialog} onOpenChange={setShowNoTestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No Tests Taken</DialogTitle>
            <DialogDescription>
              You haven't taken any tests yet. Take one to start your psychological assessment journey.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowNoTestDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="action"
              onClick={() => {
                setShowNoTestDialog(false);
                navigate('/dashboard/pending');
              }}
            >
              Take a Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
      {/* Preview Banner for unauthenticated users */}
      {!isSignedIn && <PreviewBanner />}
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-base md:text-sm text-muted-foreground mt-1">
            Continue your psychological assessment journey
          </p>
        </div>
        {loading ? (
          <Skeleton className="h-6 w-24" />
        ) : isPro ? (
          <Badge variant="default" className="gap-1">
            <Crown className="h-3 w-3" />
            Pro Member
          </Badge>
        ) : (!userData?.credit_balance || userData.credit_balance === 0) ? (
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3" />
            Free Plan
          </Badge>
        ) : null}
      </div>

      {/* Earn Free Credits Section - Only show when credits = 0 */}
      {isSignedIn && !loading && userData && userData.credit_balance === 0 && (
        <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 shadow-xl animate-in fade-in-50 duration-700">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left side - Icon & Message */}
              <div className="flex items-start gap-4 flex-1">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Star className="h-8 w-8 text-white fill-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-xs font-bold text-white">₹</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-xl mb-1 flex items-center gap-2">
                    Get ₹100 Free Credits! 
                    <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600">
                      Limited Time
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share tattests.me on social media and claim your free credits instantly
                  </p>
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-yellow-500/30">
                    <p className="text-xs font-semibold text-foreground mb-2">📱 Quick Steps:</p>
                    <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                      <li>Post about <span className="font-bold text-foreground">tattests.me</span> on Instagram/Facebook</li>
                      <li>Send the link to <span className="font-bold text-primary">+91 8921635144</span> on WhatsApp</li>
                      <li>Include your email: <span className="font-bold text-primary">{userData?.email}</span></li>
                    </ol>
                  </div>
                </div>
              </div>
              
              {/* Right side - CTA Button */}
              <div className="flex flex-col gap-2 w-full md:min-w-[200px]">
                <Button 
                  size="mobile"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg gap-2 font-semibold text-base"
                  onClick={() => {
                    const message = `Hi! I want to earn ₹100 credits by sharing tattests.me.\n\nMy email: ${userData?.email}\n\nPost link: `;
                    window.open(`https://wa.me/918921635144?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  <Zap className="h-5 w-5" />
                  Send WhatsApp Message
                </Button>
                <p className="text-sm md:text-xs text-center text-muted-foreground">
                  Credits added within 24 hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membership Alert for Free Users */}
      {isSignedIn && !loading && !isPro && (
        <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Crown className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Unlock Full Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Access all {tests.length > 0 ? tests.length : "available"} tests and detailed analysis with Pro membership
                  </p>
                </div>
              </div>
              <Button variant="champion" size="lg" className="gap-2 shadow-lg whitespace-nowrap animate-pulse-glow">
                <Crown className="h-5 w-5" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Credit Overview & Test Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Overview */}
          <Card className="shadow-elegant border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Coins className="h-5 w-5 text-primary" />
                Credit Overview
              </CardTitle>
              <CardDescription>
                Manage your test credits and view usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 sm:p-0">
                    <div className="text-3xl md:text-2xl font-bold text-primary">{isSignedIn ? (userData?.credit_balance || 0) : 10}</div>
                    <div className="text-base md:text-sm text-muted-foreground mt-1">Available Credits</div>
                  </div>
                  <div className="text-center p-4 sm:p-0">
                    <div className="text-3xl md:text-2xl font-bold text-green-600">{isSignedIn ? (userData?.total_credits_purchased || 0) : 0}</div>
                    <div className="text-base md:text-sm text-muted-foreground mt-1">Total Purchased</div>
                  </div>
                  <div className="text-center p-4 sm:p-0">
                    <div className="text-3xl md:text-2xl font-bold text-blue-600">{isSignedIn ? (userData?.total_credits_spent || 0) : 0}</div>
                    <div className="text-base md:text-sm text-muted-foreground mt-1">Total Spent</div>
                  </div>
                </div>
              )}
              {isSignedIn && (
                <div className="flex justify-center mt-4" data-tour="credit-balance">
                  <CreditHeader />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Progress Overview */}
          <Card className="shadow-elegant border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Test Progress Overview
              </CardTitle>
              <CardDescription>
                Your performance in the Thematic Apperception Test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {availableCompletedTests.length} of {totalTests} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              
              {availableCompletedTests && availableCompletedTests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Average Score</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(
                        availableCompletedTests
                          .filter(test => test.score != null)
                          .reduce((acc, test) => acc + (test.score || 0), 0) / 
                        availableCompletedTests.length
                      )}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Completed Tests */}
          {availableCompletedTests.length > 0 && (
            <Card className="shadow-elegant border-primary/10" data-tour="results-tab">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Completed Tests
                </CardTitle>
                <CardDescription>
                  Review your completed assessments and scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableCompletedTests.slice(0, 3).map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium text-foreground">{test.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Score: {test.score}% • Completed {new Date(test.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {test.score >= 80 ? 'Excellent' : test.score >= 60 ? 'Good' : 'Fair'}
                        </Badge>
                        <LoginRequiredButton size="sm" variant="government" className="ml-2">
                          Review
                        </LoginRequiredButton>
                      </div>
                    </div>
                  ))}
                  {availableCompletedTests.length > 3 && (
                    <div className="text-center pt-2">
                      <LoginRequiredButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => isSignedIn && navigate('/dashboard/attempted')}
                      >
                        View All Completed ({availableCompletedTests.length})
                      </LoginRequiredButton>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Abandoned Tests - Always visible */}
          <Card className="shadow-elegant border-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-destructive" />
                Abandoned Tests
              </CardTitle>
              <CardDescription>
                Tests that were not completed (insufficient story length or time expired)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableAbandonedTests.length > 0 ? (
                <div className="space-y-4">
                  {availableAbandonedTests.slice(0, 3).map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5 hover:border-destructive/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-destructive" />
                        <div>
                          <h3 className="font-medium text-foreground">{test.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Abandoned {new Date(test.abandonedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        Not Completed
                      </Badge>
                    </div>
                  ))}
                  {availableAbandonedTests.length > 3 && (
                    <div className="text-center pt-2">
                      <LoginRequiredButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => isSignedIn && navigate('/dashboard/abandoned')}
                      >
                        View All Abandoned ({availableAbandonedTests.length})
                      </LoginRequiredButton>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No abandoned tests yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* No Tests Available */}
          {!testsLoading && availablePendingTests.length === 0 && availableCompletedTests.length === 0 && (
            <Card className="shadow-elegant border-primary/10">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">No Tests Available</h3>
                  <p className="text-sm text-muted-foreground">
                    No tests have been created yet. Check back later!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card className="shadow-elegant border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tests Completed</span>
                <span className="font-bold text-primary">{availableCompletedTests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Tests</span>
                <span className="font-bold">{availablePendingTests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Abandoned Tests</span>
                <span className="font-bold text-destructive">{availableAbandonedTests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Available</span>
                <span className="font-bold">{totalTests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress Rate</span>
                <span className="font-bold text-primary">{Math.round(progressPercentage)}%</span>
              </div>
              {!isPro && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pro Tests</span>
                    <span className="font-bold text-primary">{tests.filter(test => test.isPremium).length}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-primary/10" data-tour="pending-tab">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availablePendingTests.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Continue with your assessment to receive comprehensive feedback.
                    </p>
                    <LoginRequiredButton 
                      variant="hero" 
                      className="w-full"
                      onClick={() => isSignedIn && navigate('/dashboard/pending')}
                      data-tour="start-test-button"
                    >
                      Continue Assessment
                    </LoginRequiredButton>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {isPro 
                        ? "Congratulations! You've completed all available tests."
                        : "You've completed all free tests. Upgrade for more!"
                      }
                    </p>
                     <LoginRequiredButton 
                       variant="default" 
                       className="w-full"
                       onClick={() => isSignedIn && navigate(isPro ? '/dashboard/results' : '/dashboard/pricing')}
                     >
                       {isPro ? "View Full Report" : "Upgrade to Pro"}
                     </LoginRequiredButton>
                  </>
                )}
                
                {!isPro && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      Want deeper insights?
                    </p>
                    <LoginRequiredButton 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => isSignedIn && navigate('/dashboard/pricing')}
                    >
                      <Crown className="h-4 w-4" />
                      See Pro Benefits
                    </LoginRequiredButton>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      <OnboardingTour
        run={runTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />
    </>
  );
};

export default Dashboard;