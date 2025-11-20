import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Eye, Calendar, Loader2, Brain, TrendingUp, Flame } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisReportDialog } from "@/components/AnalysisReportDialog";
import { ValuationLogicDialog } from "@/components/ValuationLogicDialog";
import { GamificationPanel } from "@/components/GamificationPanel";
import { useState, useEffect } from "react";
import { Button as LinkButton } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PreviewBanner } from "@/components/PreviewBanner";
import { useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AttemptedTests = () => {
  const { isPro, userData, loading: userLoading } = useUserData();
  const { isSignedIn } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedAnalysis, setSelectedAnalysis] = useState<{
    analysis: any;
    title: string;
    score: number;
    testSessionId: string;
    analysisId: string;
  } | null>(null);
  const [showValuationLogic, setShowValuationLogic] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<{
    analysis: any;
    title: string;
    score: number;
    testSessionId: string;
    analysisId: string;
  } | null>(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Test Completed Successfully!",
        description: "Your test has been submitted and is being analyzed. Results will appear shortly.",
      });
      // Remove the success parameter from URL
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  const { data: attemptedTests, isLoading } = useQuery({
    queryKey: ["attempted-tests", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data, error } = await supabase
        .from("test_sessions")
        .select(
          `
          id,
          completed_at,
          session_duration_seconds,
          story_content,
          tattest_id,
          tattest:tattest_id (
            id,
            title,
            description
          ),
          analysis_results!test_session_id (
            id,
            confidence_score,
            analysis_data,
            murray_needs,
            murray_presses,
            inner_states,
            military_assessment,
            selection_recommendation,
            analysis_type
          )
        `,
        )
        .eq("user_id", userData.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching attempted tests:", error);
        return [];
      }

      // First pass: Count total attempts per test
      const totalAttemptsByTest = new Map<string, number>();
      data.forEach((session) => {
        const testId = session.tattest_id;
        totalAttemptsByTest.set(testId, (totalAttemptsByTest.get(testId) || 0) + 1);
      });

      // Second pass: Assign attempt numbers (newest = highest)
      const attemptCounters = new Map<string, number>();

      return data.map((session) => {
        const testId = session.tattest_id;
        const totalAttempts = totalAttemptsByTest.get(testId) || 1;
        const attemptsProcessed = attemptCounters.get(testId) || 0;
        const currentAttempt = totalAttempts - attemptsProcessed;
        attemptCounters.set(testId, attemptsProcessed + 1);

        const analysisResult = Array.isArray(session.analysis_results)
          ? session.analysis_results[0]
          : session.analysis_results;

        return {
          id: session.id,
          testId: testId,
          title: session.tattest?.title || "Untitled Test",
          attemptNumber: currentAttempt,
          completedAt: session.completed_at,
          duration: session.session_duration_seconds
            ? `${Math.round(session.session_duration_seconds / 60)} minutes`
            : "Unknown duration",
            score: analysisResult?.military_assessment?.overall_rating 
              ? Math.round(analysisResult.military_assessment.overall_rating)
              : analysisResult?.confidence_score 
                ? Math.round(analysisResult.confidence_score) 
                : null,
          analysis:
            analysisResult?.analysis_data?.summary ||
            "Our models are analysing the results.Will soon be available based on server traffic.Remember we run tests globally.",
          fullAnalysis: analysisResult
            ? {
                ...analysisResult.analysis_data,
                murray_needs: analysisResult.murray_needs,
                murray_presses: analysisResult.murray_presses,
                inner_states: analysisResult.inner_states,
                military_assessment: analysisResult.military_assessment,
                selection_recommendation: analysisResult.selection_recommendation,
                confidence_score: analysisResult.confidence_score,
                analysis_type: analysisResult.analysis_type,
              }
            : null,
          isPremium: false,
          sessionId: session.id,
          analysisId: analysisResult?.id || "",
        };
      });
    },
    enabled: !!userData?.id && !userLoading,
  });

  const visibleTests = isPro ? attemptedTests || [] : (attemptedTests || []).filter((test) => !test.isPremium);

  // Calculate stats for gamification
  const averageScore =
    visibleTests.length > 0
      ? Math.round(visibleTests.reduce((sum, test) => sum + (test.score || 0), 0) / visibleTests.length)
      : 0;

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden px-2 sm:px-4 md:px-0">
        {!isSignedIn && <PreviewBanner />}

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-1 md:mb-2 break-words">
                DETAILED TEST ANALYSIS 🔍
              </h1>
              <p className="text-white/90 text-sm sm:text-base md:text-lg">
                View comprehensive analysis for each test attempt
              </p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm sm:text-base md:text-lg px-3 py-1.5 md:px-4 md:py-2 gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0">
              <Trophy className="h-4 w-4 md:h-5 md:w-5" />
              {visibleTests.length} Completed
            </Badge>
          </div>
        </div>

        {/* Gamification Stats */}
        {visibleTests.length > 0 && (
          <GamificationPanel
            testsCompleted={visibleTests.length}
            averageScore={averageScore}
            streak={5}
            achievements={["first_test"]}
          />
        )}

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="font-medium text-foreground mb-2">Loading Your Tests</h3>
                <p className="text-sm text-muted-foreground">Fetching your completed assessments...</p>
              </div>
            </CardContent>
          </Card>
        ) : visibleTests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Tests Completed Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start taking tests to see your results here</p>
                <Button variant="hero">Start First Test</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-full">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
              <span className="break-words">Your Tests</span>
            </h2>
            <div className="grid gap-4 md:gap-6">
              {visibleTests.map((test, index) => {
                const scoreGradient =
                  test.score && test.score >= 80
                    ? "from-green-500/10 to-emerald-500/10 border-green-500/30"
                    : test.score && test.score >= 60
                      ? "from-blue-500/10 to-indigo-500/10 border-blue-500/30"
                      : test.score && test.score >= 40
                        ? "from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                        : "from-purple-500/10 to-pink-500/10 border-purple-500/30";

                return (
                  <Card
                    key={test.id}
                    className={`glass-effect border-2 bg-gradient-to-r ${scoreGradient} hover:scale-[1.01] md:hover:scale-[1.02] transition-all`}
                  >
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="space-y-2 flex-1 min-w-0 w-full">
                          <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg md:text-xl">
                            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                            <span className="break-words">{test.title}</span>
                            <Badge className="bg-primary/20 text-primary border-primary/30 whitespace-nowrap">
                              Attempt #{test.attemptNumber}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                              {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : "Unknown date"}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Brain className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                              {test.duration}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                          {test.score !== null ? (
                            <>
                              <div className="text-3xl md:text-4xl font-black text-primary">{test.score}%</div>
                              <Badge className="bg-gradient-to-r from-primary to-accent text-white px-2 py-1 md:px-3 text-xs md:text-sm whitespace-nowrap">
                                {test.score >= 80
                                  ? "EXCELLENT! 🏆"
                                  : test.score >= 60
                                    ? "GREAT JOB! 💪"
                                    : test.score >= 40
                                      ? "SOLID! 🚀"
                                      : "KEEP GOING! 💪"}
                              </Badge>
                            </>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground text-xs md:text-sm whitespace-nowrap"
                            >
                              ⏳ Analysis Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                      {test.score === null ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-card/50 rounded-xl p-3 md:p-4 cursor-help">
                              <h4 className="font-bold text-sm md:text-base text-foreground mb-2">
                                📊 Analysis Summary
                              </h4>
                              <p className="text-sm md:text-base text-muted-foreground leading-relaxed break-words">
                                {test.analysis}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Story is being evaluated. Processing time varies depending on server traffic and
                              availability.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="bg-card/50 rounded-xl p-3 md:p-4">
                          <h4 className="font-bold text-sm md:text-base text-foreground mb-2">📊 What We Found</h4>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed break-words">
                            {test.analysis}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                        <Button
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold gap-2 shadow-action text-sm md:text-base"
                          size="lg"
                          onClick={() => {
                            if (test.fullAnalysis) {
                              setPendingAnalysis({
                                analysis: test.fullAnalysis,
                                title: test.title,
                                score: test.score || 0,
                                testSessionId: test.sessionId,
                                analysisId: test.analysisId,
                              });
                              setShowValuationLogic(true);
                            }
                          }}
                          disabled={!test.fullAnalysis}
                        >
                          <Eye className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                          <span className="break-words">SEE MY FULL ANALYSIS 🎯</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2 border-2 hover:border-primary/50 text-sm md:text-base flex-1 sm:flex-initial"
                          onClick={() => {
                            window.location.href = `/test/${test.testId}`;
                          }}
                        >
                          <span className="whitespace-nowrap">BEAT MY SCORE 🔥</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
          testSessionId={selectedAnalysis?.testSessionId || ""}
          analysisId={selectedAnalysis?.analysisId || ""}
        />
      </div>
    </TooltipProvider>
  );
};

export default AttemptedTests;
