import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, BarChart3, TrendingUp, Download, Brain, Heart, Users, Zap } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const Results = () => {
  const { isPro } = useUserData();

  // Mock analysis data
  const personalityTraits = [
    { name: "Emotional Intelligence", score: 85, description: "Strong ability to understand and manage emotions" },
    { name: "Leadership Potential", score: 78, description: "Good natural leadership qualities" },
    { name: "Social Awareness", score: 92, description: "Excellent understanding of social dynamics" },
    { name: "Problem Solving", score: 74, description: "Solid analytical and solution-oriented thinking" },
    { name: "Creativity", score: 88, description: "High creative and innovative thinking" },
    { name: "Stress Management", score: 66, description: "Moderate ability to handle pressure" },
  ];

  const overallScore = Math.round(personalityTraits.reduce((acc, trait) => acc + trait.score, 0) / personalityTraits.length);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results & Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive psychological assessment results and insights
          </p>
        </div>
        <Button variant="government" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Overall Assessment Score
          </CardTitle>
          <CardDescription>
            Based on {isPro ? "7" : "3"} completed psychological assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Performance</span>
                <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </span>
              </div>
              <Progress value={overallScore} className="h-3" />
            </div>
            <div className={`p-4 rounded-full ${getScoreBg(overallScore)}`}>
              <Brain className={`h-8 w-8 ${getScoreColor(overallScore)}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality Traits Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {personalityTraits.map((trait, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{trait.name}</CardTitle>
                <Badge variant="secondary" className={getScoreColor(trait.score)}>
                  {trait.score}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={trait.score} className="h-2" />
              <p className="text-sm text-muted-foreground">{trait.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Cognitive Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Analytical Thinking</span>
                <span className="text-sm font-medium">Strong</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pattern Recognition</span>
                <span className="text-sm font-medium">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Abstract Reasoning</span>
                <span className="text-sm font-medium">Good</span>
              </div>
            </div>
            {isPro && (
              <Button variant="outline" size="sm" className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                Detailed Report
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Emotional Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Self-Awareness</span>
                <span className="text-sm font-medium">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Empathy</span>
                <span className="text-sm font-medium">Very High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Emotional Regulation</span>
                <span className="text-sm font-medium">Moderate</span>
              </div>
            </div>
            {isPro && (
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Heart className="h-4 w-4" />
                EQ Deep Dive
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Social Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Communication</span>
                <span className="text-sm font-medium">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Team Collaboration</span>
                <span className="text-sm font-medium">Strong</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Conflict Resolution</span>
                <span className="text-sm font-medium">Good</span>
              </div>
            </div>
            {isPro && (
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Users className="h-4 w-4" />
                Social Analysis
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pro Upgrade CTA */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Unlock Advanced Analysis</h3>
              </div>
              <p className="text-muted-foreground">
                Get detailed personality insights, career recommendations, and personalized development plans with Pro
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="hero" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
                <Button variant="outline">
                  View Sample Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Results;