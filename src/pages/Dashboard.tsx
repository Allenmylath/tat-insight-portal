import { SignedIn, SignedOut, UserButton, RedirectToSignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, BookOpen, Award, BarChart3, Crown, Lock, Star } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { userData, loading, isPro } = useUserData();

  // Mock data for test progress - different limits based on membership
  const allTests = [
    { id: 1, title: "Picture 1: Family Scene", completed: true, score: 85, isPremium: false },
    { id: 2, title: "Picture 2: Professional Setting", completed: true, score: 92, isPremium: false },
    { id: 3, title: "Picture 3: Social Interaction", completed: false, score: null, isPremium: false },
    { id: 4, title: "Picture 4: Leadership Scenario", completed: false, score: null, isPremium: true },
    { id: 5, title: "Picture 5: Conflict Resolution", completed: false, score: null, isPremium: true },
    { id: 6, title: "Picture 6: Advanced Analysis", completed: false, score: null, isPremium: true },
    { id: 7, title: "Picture 7: Deep Insights", completed: false, score: null, isPremium: true },
  ];

  // Filter tests based on membership
  const availableTests = isPro ? allTests : allTests.filter(test => !test.isPremium);
  const completedTests = availableTests.filter(test => test.completed);
  const progressPercentage = availableTests.length > 0 ? (completedTests.length / availableTests.length) * 100 : 0;

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-saffron rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">TAT Dashboard</h1>
                  <p className="text-sm text-muted-foreground">SSC Assessment Portal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
                    {isPro ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                    {isPro ? "Pro Member" : "Free Plan"}
                  </Badge>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {/* Membership Alert for Free Users */}
            {!loading && !isPro && (
              <Card className="mb-6 border-primary bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Unlock Full Access</h3>
                        <p className="text-sm text-muted-foreground">
                          Access all {allTests.length} tests and detailed analysis with Pro membership
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
                      {availableTests.map((test) => (
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
                      ))}
                      
                      {/* Show locked tests for free users */}
                      {!isPro && allTests.some(test => test.isPremium) && (
                        <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5">
                          <div className="text-center">
                            <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-medium text-foreground mb-1">
                              {allTests.filter(test => test.isPremium).length} More Tests Available
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Unlock advanced psychological analysis and detailed insights
                            </p>
                            <Button variant="hero" size="sm" className="gap-2">
                              <Crown className="h-4 w-4" />
                              Upgrade to Pro
                            </Button>
                          </div>
                        </div>
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
                          <span className="font-bold text-primary">{allTests.filter(test => test.isPremium).length}</span>
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
          </main>
        </div>
      </SignedIn>
    </>
  );
};

export default Dashboard;