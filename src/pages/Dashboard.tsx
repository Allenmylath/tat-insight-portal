import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, Award, BarChart3, Crown, Lock, Star } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { userData, loading, isPro } = useUserData();
  const [tests, setTests] = useState<any[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data, error } = await supabase
          .from('tattest')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tests:', error);
          return;
        }

        // Transform database data to match component expectations
        const transformedTests = data?.map((test, index) => ({
          id: test.id,
          title: test.title,
          completed: false, // TODO: Check actual completion status from test_sessions
          score: null,
          isPremium: false
        })) || [];

        setTests(transformedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Filter tests based on membership
  const availableTests = isPro ? tests : tests.filter(test => !test.isPremium);
  const completedTests = availableTests.filter(test => test.completed);
  const progressPercentage = availableTests.length > 0 ? (completedTests.length / availableTests.length) * 100 : 0;

  return (
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
        ) : (
          <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
            {isPro ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
            {isPro ? "Pro Member" : "Free Plan"}
          </Badge>
        )}
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
        {/* Progress Overview */}
        <div className="lg:col-span-2 space-y-6">
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
                  {completedTests.length} of {availableTests.length} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              
              {completedTests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Average Score</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(completedTests.reduce((acc, test) => acc + test.score!, 0) / completedTests.length)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test List */}
          <Card className="shadow-elegant border-primary/10">
            <CardHeader>
              <CardTitle>Assessment Tests</CardTitle>
              <CardDescription>
                Complete all tests to receive your comprehensive evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testsLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                        <div>
                          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  ))
                ) : availableTests.length === 0 ? (
                  <div className="text-center py-8">
                    <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No Tests Available</h3>
                    <p className="text-sm text-muted-foreground">
                      No tests have been created yet. Check back later!
                    </p>
                  </div>
                ) : (
                  availableTests.slice(0, 5).map((test) => (
                    <div
                      key={test.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        test.isPremium && !isPro
                          ? "border-muted bg-muted/30 opacity-60"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {test.completed ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : test.isPremium && !isPro ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{test.title}</h3>
                            {test.isPremium && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                <Crown className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {test.completed 
                              ? `Score: ${test.score}%` 
                              : test.isPremium && !isPro 
                                ? "Requires Pro membership"
                                : "Not started"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.completed ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Completed
                          </Badge>
                        ) : test.isPremium && !isPro ? (
                          <Badge variant="outline" className="border-muted-foreground/20">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-muted-foreground/20">
                            Pending
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={test.completed ? "government" : test.isPremium && !isPro ? "outline" : "hero"}
                          className="ml-2"
                          disabled={test.isPremium && !isPro && !test.completed}
                        >
                          {test.completed 
                            ? "Review" 
                            : test.isPremium && !isPro 
                              ? "Upgrade" 
                              : "Start Test"
                          }
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
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
                <span className="font-bold text-primary">{completedTests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Tests</span>
                <span className="font-bold">{availableTests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tests Remaining</span>
                <span className="font-bold">{availableTests.length - completedTests.length}</span>
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
                {availableTests.find(test => !test.completed) ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Continue with your assessment to receive comprehensive feedback.
                    </p>
                    <Button variant="hero" className="w-full">
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
  );
};

export default Dashboard;