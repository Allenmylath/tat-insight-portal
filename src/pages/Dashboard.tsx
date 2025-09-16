import { SignedIn, SignedOut, UserButton, RedirectToSignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, BookOpen, Award, BarChart3 } from "lucide-react";

const Dashboard = () => {
  // Mock data for test progress
  const tests = [
    { id: 1, title: "Picture 1: Family Scene", completed: true, score: 85 },
    { id: 2, title: "Picture 2: Professional Setting", completed: true, score: 92 },
    { id: 3, title: "Picture 3: Social Interaction", completed: false, score: null },
    { id: 4, title: "Picture 4: Leadership Scenario", completed: false, score: null },
    { id: 5, title: "Picture 5: Conflict Resolution", completed: false, score: null },
  ];

  const completedTests = tests.filter(test => test.completed);
  const progressPercentage = (completedTests.length / tests.length) * 100;

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
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
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
                        {completedTests.length} of {tests.length} completed
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
                      {tests.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {test.completed ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <h3 className="font-medium text-foreground">{test.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {test.completed ? `Score: ${test.score}%` : "Not started"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {test.completed ? (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-muted-foreground/20">
                                Pending
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant={test.completed ? "government" : "hero"}
                              className="ml-2"
                            >
                              {test.completed ? "Review" : "Start Test"}
                            </Button>
                          </div>
                        </div>
                      ))}
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
                      <span className="text-sm text-muted-foreground">Tests Remaining</span>
                      <span className="font-bold">{tests.length - completedTests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-bold text-primary">{Math.round(progressPercentage)}%</span>
                    </div>
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
                      {tests.find(test => !test.completed) ? (
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
                            Congratulations! You've completed all tests.
                          </p>
                          <Button variant="government" className="w-full">
                            View Full Report
                          </Button>
                        </>
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