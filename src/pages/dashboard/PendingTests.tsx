import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, Lock, Crown, Image } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const PendingTests = () => {
  const { isPro } = useUserData();

  // Mock data for pending tests
  const allPendingTests = [
    {
      id: 3,
      title: "Picture 3: Social Interaction",
      description: "Analyze social dynamics and interpersonal relationships in a group setting.",
      estimatedTime: "10-15 minutes",
      difficulty: "Intermediate",
      isPremium: false,
      imageUrl: "/api/placeholder/300/200"
    },
    {
      id: 4,
      title: "Picture 4: Leadership Scenario",
      description: "Evaluate leadership qualities and decision-making in challenging situations.",
      estimatedTime: "15-20 minutes",
      difficulty: "Advanced",
      isPremium: true,
      imageUrl: "/api/placeholder/300/200"
    },
    {
      id: 5,
      title: "Picture 5: Conflict Resolution",
      description: "Assess conflict management and problem-solving abilities.",
      estimatedTime: "12-18 minutes",
      difficulty: "Advanced",
      isPremium: true,
      imageUrl: "/api/placeholder/300/200"
    },
    {
      id: 6,
      title: "Picture 6: Emotional Intelligence",
      description: "Deep dive into emotional awareness and empathy assessment.",
      estimatedTime: "15-25 minutes",
      difficulty: "Expert",
      isPremium: true,
      imageUrl: "/api/placeholder/300/200"
    },
  ];

  const availableTests = isPro ? allPendingTests : allPendingTests.filter(test => !test.isPremium);
  const lockedTests = isPro ? [] : allPendingTests.filter(test => test.isPremium);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      case "Expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Tests</h1>
          <p className="text-muted-foreground">
            Continue your psychological assessment journey
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Clock className="h-4 w-4" />
          {availableTests.length} Available
        </Badge>
      </div>

      {/* Available Tests */}
      {availableTests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Ready to Take</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {availableTests.map((test) => (
              <Card key={test.id} className="shadow-elegant hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    {test.title}
                  </CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated time: {test.estimatedTime}</span>
                    <Badge className={getDifficultyColor(test.difficulty)}>
                      {test.difficulty}
                    </Badge>
                  </div>
                  <Button variant="hero" className="w-full gap-2">
                    <Play className="h-4 w-4" />
                    Start Test
                  </Button>
                </CardContent>
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
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                    {test.title}
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  </CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {availableTests.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">All Tests Completed!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Great job! You've completed all available tests.
              </p>
              {!isPro && (
                <Button variant="hero" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade for More Tests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PendingTests;