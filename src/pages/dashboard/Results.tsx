import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, BarChart3, TrendingUp, Download, Brain, Heart, Users, Zap, Loader2, FileText } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PreviewBanner } from "@/components/PreviewBanner";
import { useUser } from "@clerk/clerk-react";

const Results = () => {
  const { isPro, userData, loading: userLoading } = useUserData();
  const { isSignedIn } = useUser();

  const { data: analysisResults, isLoading } = useQuery({
    queryKey: ['analysis-results', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          test_sessions!test_session_id (
            id,
            completed_at,
            tattest:tattest_id (
              title
            )
          )
        `)
        .eq('user_id', userData.id)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Error fetching analysis results:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userData?.id && !userLoading,
  });

  // Calculate aggregate statistics from real data
  const personalityTraits = analysisResults && analysisResults.length > 0 
    ? extractPersonalityTraits(analysisResults)
    : [];

  const overallScore = personalityTraits.length > 0 
    ? Math.round(personalityTraits.reduce((acc, trait) => acc + trait.score, 0) / personalityTraits.length)
    : 0;

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
      {!isSignedIn && <PreviewBanner />}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Overall Summary</h1>
          <p className="text-base md:text-sm text-muted-foreground mt-1">
            Aggregate psychological profile across all completed tests
          </p>
        </div>
        <Button 
          variant="government" 
          size="mobile"
          className="gap-2 w-full sm:w-auto" 
          disabled={!analysisResults || analysisResults.length === 0}
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="font-medium text-foreground mb-2">Loading Your Results</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing your assessment data...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !analysisResults || analysisResults.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Analysis Results Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your first psychological assessment to see results here
              </p>
              <Button variant="hero">Take Assessment</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Score Card */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Overall Assessment Score
              </CardTitle>
              <CardDescription>
                Based on {analysisResults?.length || 0} completed psychological assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base md:text-sm font-medium">Overall Performance</span>
                    <span className={`text-4xl md:text-2xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore}%
                    </span>
                  </div>
                  <Progress value={overallScore} className="h-4 md:h-3" />
                </div>
                <div className={`p-6 sm:p-4 rounded-full ${getScoreBg(overallScore)}`}>
                  <Brain className={`h-12 w-12 sm:h-8 sm:w-8 ${getScoreColor(overallScore)}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personality Traits Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
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
        </>
      )}
    </div>
  );
};

// Helper function to extract personality traits from analysis results
function extractPersonalityTraits(results: any[]) {
  const traits: Array<{ name: string; score: number; description: string }> = [];
  
  results.forEach(result => {
    // Since personality_traits column doesn't exist, we'll extract from analysis_data instead
    if (result.analysis_data && result.analysis_data.personality_traits) {
      Object.entries(result.analysis_data.personality_traits).forEach(([trait, data]: [string, any]) => {
        const existingTrait = traits.find(t => t.name === trait);
        if (existingTrait) {
          // Average the scores if multiple results exist
          existingTrait.score = Math.round((existingTrait.score + (data.score || 0)) / 2);
        } else {
          traits.push({
            name: trait,
            score: data.score || 0,
            description: data.description || `Assessment of ${trait.toLowerCase()}`
          });
        }
      });
    }
  });

  // Add default traits if no data exists
  if (traits.length === 0) {
    return [
      { name: "Assessment Pending", score: 0, description: "Complete more assessments to see detailed traits" }
    ];
  }

  return traits;
}

export default Results;