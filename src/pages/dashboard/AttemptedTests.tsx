import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Eye, Calendar } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const AttemptedTests = () => {
  const { isPro } = useUserData();

  // Mock data for attempted tests
  const attemptedTests = [
    {
      id: 1,
      title: "Picture 1: Family Scene",
      completedAt: "2024-01-15",
      score: 85,
      duration: "12 minutes",
      analysis: "Strong emotional intelligence and family dynamics understanding.",
      isPremium: false
    },
    {
      id: 2,
      title: "Picture 2: Professional Setting",
      completedAt: "2024-01-16",
      score: 92,
      duration: "15 minutes",
      analysis: "Excellent leadership qualities and professional insight.",
      isPremium: false
    },
    {
      id: 3,
      title: "Picture 3: Social Interaction",
      completedAt: "2024-01-17",
      score: 88,
      duration: "11 minutes",
      analysis: "Good interpersonal skills and social awareness.",
      isPremium: true
    },
  ];

  const visibleTests = isPro ? attemptedTests : attemptedTests.filter(test => !test.isPremium);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attempted Tests</h1>
          <p className="text-muted-foreground">
            Review your completed psychological assessments and results
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {visibleTests.length} Completed
        </Badge>
      </div>

      {visibleTests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Tests Completed Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start taking tests to see your results here
              </p>
              <Button variant="hero">Start First Test</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {visibleTests.map((test) => (
            <Card key={test.id} className="shadow-elegant">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {test.title}
                      {test.isPremium && (
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(test.completedAt).toLocaleDateString()}
                      </span>
                      <span>Duration: {test.duration}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-primary/10 text-primary">
                      <Trophy className="h-3 w-3 mr-1" />
                      {test.score}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-foreground mb-2">Analysis Summary</h4>
                  <p className="text-sm text-muted-foreground">{test.analysis}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="government" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Full Report
                  </Button>
                  <Button variant="outline" size="sm">
                    Retake Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttemptedTests;