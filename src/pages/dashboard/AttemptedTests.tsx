import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Eye, Calendar, Loader2, Brain } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisReportDialog } from "@/components/AnalysisReportDialog";
import { ValuationLogicDialog } from "@/components/ValuationLogicDialog";
import { useState } from "react";
import { Button as LinkButton } from "@/components/ui/button";

const AttemptedTests = () => {
  const { isPro, userData, loading: userLoading } = useUserData();
  const [selectedAnalysis, setSelectedAnalysis] = useState<{
    analysis: any;
    title: string;
    score: number;
  } | null>(null);
  const [showValuationLogic, setShowValuationLogic] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<{
    analysis: any;
    title: string;
    score: number;
  } | null>(null);

  const { data: attemptedTests, isLoading } = useQuery({
    queryKey: ['attempted-tests', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data, error } = await supabase
        .from('test_sessions')
        .select(`
          id,
          completed_at,
          session_duration_seconds,
          story_content,
          tattest:tattest_id (
            id,
            title,
            description
          ),
          analysis_results!test_session_id (
            confidence_score,
            personality_traits,
            analysis_data
          )
        `)
        .eq('user_id', userData.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching attempted tests:', error);
        return [];
      }

      return data.map(session => {
        const analysisResult = Array.isArray(session.analysis_results) 
          ? session.analysis_results[0] 
          : session.analysis_results;
        
        return {
          id: session.id,
          title: session.tattest?.title || 'Untitled Test',
          completedAt: session.completed_at,
          duration: session.session_duration_seconds 
            ? `${Math.round(session.session_duration_seconds / 60)} minutes`
            : 'Unknown duration',
          score: analysisResult?.confidence_score 
            ? Math.round(analysisResult.confidence_score * 100)
            : null,
          analysis: analysisResult?.analysis_data?.summary || 
                   'Analysis will be available soon. We are working on implementing the analysis feature.',
          fullAnalysis: analysisResult?.analysis_data || null,
          isPremium: false,
          sessionId: session.id
        };
      });
    },
    enabled: !!userData?.id && !userLoading,
  });

  const visibleTests = isPro ? (attemptedTests || []) : (attemptedTests || []).filter(test => !test.isPremium);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attempted Tests</h1>
          <p className="text-muted-foreground">
            Review your completed psychological assessments and results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LinkButton 
            variant="outline" 
            size="sm" 
            onClick={() => setShowValuationLogic(true)}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            Valuation Logic
          </LinkButton>
          <Badge variant="secondary" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {visibleTests.length} Completed
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="font-medium text-foreground mb-2">Loading Your Tests</h3>
              <p className="text-sm text-muted-foreground">
                Fetching your completed assessments...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : visibleTests.length === 0 ? (
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
                        {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                      <span>Duration: {test.duration}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.score !== null ? (
                      <Badge variant="default" className="bg-primary/10 text-primary">
                        <Trophy className="h-3 w-3 mr-1" />
                        {test.score}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Analysis Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-foreground mb-2">Analysis Summary</h4>
                  <p className="text-sm text-muted-foreground">{test.analysis}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="government" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                      if (test.fullAnalysis) {
                        setPendingAnalysis({
                          analysis: test.fullAnalysis,
                          title: test.title,
                          score: test.score || 0
                        });
                        setShowValuationLogic(true);
                      }
                    }}
                    disabled={!test.fullAnalysis}
                  >
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

      <ValuationLogicDialog
        open={showValuationLogic}
        onOpenChange={setShowValuationLogic}
        onAccept={() => {
          setShowValuationLogic(false);
          if (pendingAnalysis) {
            setSelectedAnalysis(pendingAnalysis);
            setPendingAnalysis(null);
          }
        }}
      />

      <AnalysisReportDialog
        open={!!selectedAnalysis}
        onOpenChange={(open) => !open && setSelectedAnalysis(null)}
        analysis={selectedAnalysis?.analysis}
        testTitle={selectedAnalysis?.title || ""}
        score={selectedAnalysis?.score || 0}
      />
    </div>
  );
};

export default AttemptedTests;