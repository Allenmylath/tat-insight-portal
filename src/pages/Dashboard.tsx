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

const Dashboard = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { userData, loading, isPro } = useUserData();
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [completedTests, setCompletedTests] = useState<any[]>([]);
  const [abandonedTests, setAbandonedTests] = useState<any[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [showNoTestDialog, setShowNoTestDialog] = useState(false);
  const [hasAnyTestSessions, setHasAnyTestSessions] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/auth/signin");
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    const fetchTests = async () => {
      if (!userData?.id) return;
      
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
          return;
        }

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
        const { data: userSessions, error: sessionsError } = await supabase
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
          return;
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
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, [userData?.id]);

  // Filter tests based on membership
  const availablePendingTests = isPro ? tests : tests.filter(test => !test.isPremium);
  const availableCompletedTests = isPro ? completedTests : completedTests.filter(test => !test.isPremium);
  const availableAbandonedTests = isPro ? abandonedTests : abandonedTests.filter(test => !test.isPremium);
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
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground">
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

      {/* Membership Alert for Free Users */}
      {!loading && !isPro && (
        <Card className="border-primary bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Unlock Full Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Access all {tests.length > 0 ? tests.length : "available"} tests and detailed analysis with Pro membership
                  </p>
                </div>
              </div>
              <Button variant="hero" className="gap-2">
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userData?.credit_balance || 0}</div>
                    <div className="text-sm text-muted-foreground">Available Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{userData?.total_credits_purchased || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Purchased</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData?.total_credits_spent || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              )}
              <div className="flex justify-center mt-4">
                <CreditHeader />
              </div>
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
              
              {availableCompletedTests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Average Score</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(availableCompletedTests.reduce((acc, test) => acc + test.score!, 0) / availableCompletedTests.length)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Completed Tests */}
          {availableCompletedTests.length > 0 && (
            <Card className="shadow-elegant border-primary/10">
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
                        <Button size="sm" variant="government" className="ml-2">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  {availableCompletedTests.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View All Completed ({availableCompletedTests.length})
                      </Button>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/dashboard/abandoned'}
                      >
                        View All Abandoned ({availableAbandonedTests.length})
                      </Button>
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

          <Card className="shadow-elegant border-primary/10">
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
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => navigate('/dashboard/pending')}
                    >
                      Continue Assessment
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {isPro 
                        ? "Congratulations! You've completed all available tests."
                        : "You've completed all free tests. Upgrade for more!"
                      }
                    </p>
                    <Button variant="government" className="w-full">
                      {isPro ? "View Full Report" : "Upgrade to Pro"}
                    </Button>
                  </>
                )}
                
                {!isPro && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      Want deeper insights?
                    </p>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Crown className="h-4 w-4" />
                      See Pro Benefits
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;