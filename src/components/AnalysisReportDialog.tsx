import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MurrayNeedsChart } from "@/components/MurrayNeedsChart";
import { MilitaryAssessmentCard } from "@/components/MilitaryAssessmentCard";
import { SelectionRecommendationPanel } from "@/components/SelectionRecommendationPanel";
import { ScoreHero } from "@/components/ScoreHero";
import { SSBQuestionsCard } from "@/components/SSBQuestionsCard";
import { AnalysisReportTour } from "@/components/AnalysisReportTour";
import { EnhancedAnalysisData } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, ChevronRight, Activity, Award, Target, FileText, X, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useUserData } from "@/hooks/useUserData";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";

// Helper function to format analysis for ChatGPT
const formatAnalysisForChatGPT = (testTitle: string, score: number, analysis: any): string => {
  let formattedText = `# TAT Psychological Assessment Report\n\n`;
  formattedText += `**Test:** ${testTitle}\n`;
  formattedText += `**Confidence Score:** ${score}%\n\n`;

  if (analysis.summary) {
    formattedText += `## Summary\n${analysis.summary}\n\n`;
  }

  const personalityTraits = analysis.personality_traits || {};
  if (Object.keys(personalityTraits).length > 0) {
    formattedText += `## Personality Traits\n`;
    Object.entries(personalityTraits).forEach(([trait, data]: [string, any]) => {
      formattedText += `- **${trait}:** ${data.score}% - ${data.description}\n`;
    });
    formattedText += `\n`;
  }

  if (Array.isArray(analysis.murray_needs) && analysis.murray_needs.length > 0) {
    formattedText += `## Murray Psychological Needs\n`;
    analysis.murray_needs.forEach((need: any) => {
      formattedText += `- **${need.name}:** ${need.score}% (${need.intensity}) - ${need.description}\n`;
    });
    formattedText += `\n`;
  }

  if (Array.isArray(analysis.inner_states) && analysis.inner_states.length > 0) {
    formattedText += `## Psychological Inner States\n`;
    analysis.inner_states.forEach((state: any) => {
      formattedText += `- **${state.state}:** ${state.intensity}% (${state.valence}) - ${state.description}\n`;
    });
    formattedText += `\n`;
  }

  if (analysis.military_assessment) {
    const ma = analysis.military_assessment;
    formattedText += `## Military/Leadership Assessment\n`;
    formattedText += `- **Overall Rating:** ${ma.overall_rating}%\n`;
    formattedText += `- **Leadership Potential:** ${ma.leadership_potential}%\n`;
    formattedText += `- **Stress Tolerance:** ${ma.stress_tolerance}%\n`;
    formattedText += `- **Team Compatibility:** ${ma.team_compatibility}%\n`;
    formattedText += `- **Adaptability:** ${ma.adaptability}%\n`;
    formattedText += `- **Decision Making:** ${ma.decision_making}%\n\n`;
  }

  if (analysis.selection_recommendation) {
    const sr = analysis.selection_recommendation;
    formattedText += `## Selection Recommendation\n`;
    formattedText += `- **Recommendation:** ${sr.overall_recommendation}\n`;
    formattedText += `- **Confidence:** ${sr.confidence_level}%\n`;
    if (sr.key_strengths && sr.key_strengths.length > 0) {
      formattedText += `\n**Key Strengths:**\n`;
      sr.key_strengths.forEach((strength: string) => {
        formattedText += `  - ${strength}\n`;
      });
    }
    if (sr.areas_for_development && sr.areas_for_development.length > 0) {
      formattedText += `\n**Areas for Development:**\n`;
      sr.areas_for_development.forEach((area: string) => {
        formattedText += `  - ${area}\n`;
      });
    }
    formattedText += `\n`;
  }

  const insights = analysis.psychological_insights || analysis.clinical_insights || [];
  if (insights.length > 0) {
    formattedText += `## Clinical Insights\n`;
    insights.forEach((insight: string) => {
      formattedText += `- ${insight}\n`;
    });
    formattedText += `\n`;
  }

  return formattedText;
};

interface AnalysisReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: EnhancedAnalysisData | any;
  testTitle: string;
  score: number;
  testSessionId: string;
  analysisId: string;
}

export const AnalysisReportDialog = ({ open, onOpenChange, analysis, testTitle, score, testSessionId, analysisId }: AnalysisReportDialogProps) => {
  const isMobile = useIsMobile();
  const { isPro, userData, updateReportTourStatus } = useUserData();
  const [activeTab, setActiveTab] = useState("military");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [runReportTour, setRunReportTour] = useState(false);

  // Trigger report tour for first-time users
  useEffect(() => {
    if (
      open && 
      userData &&
      !userData.has_completed_report_tour && 
      analysis
    ) {
      // Wait longer for dialog/sheet to fully render and content to be visible
      const timer = setTimeout(() => {
        setRunReportTour(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [open, userData, analysis]);

  // Reset tour when dialog closes
  useEffect(() => {
    if (!open) {
      setRunReportTour(false);
    }
  }, [open]);

  const handleReportTourComplete = async () => {
    setRunReportTour(false);
    try {
      await updateReportTourStatus(true);
      toast.success("Tutorial complete! Explore your analysis at your own pace.");
    } catch (error) {
      console.error('Error updating report tour status:', error);
    }
  };

  const handleReportTourSkip = async () => {
    setRunReportTour(false);
    try {
      await updateReportTourStatus(true);
    } catch (error) {
      console.error('Error updating report tour status:', error);
    }
  };

  if (!analysis) return null;

  // Extract and format data
  const personalityTraits = analysis.personality_traits || {};
  const dominantEmotions = analysis.dominant_emotions || analysis.dominant_themes || [];
  const psychologicalInsights = analysis.psychological_insights || analysis.clinical_insights || [];

  const murrayNeeds = Array.isArray(analysis.murray_needs)
    ? analysis.murray_needs.map((need: any) => ({
        name: need.name || "Unknown Need",
        score: need.score || 0,
        description: need.description || `Assessment of ${need.name} psychological need`,
        intensity:
          need.intensity ||
          ((need.score > 80 ? "Very High" : need.score > 60 ? "High" : need.score > 40 ? "Moderate" : "Low") as
            | "Very High"
            | "High"
            | "Moderate"
            | "Low"),
      }))
    : [];

  const innerStates = Array.isArray(analysis.inner_states)
    ? analysis.inner_states.map((state: any) => ({
        state: state.state || "Unknown State",
        intensity: state.intensity || 0,
        description: state.description || `${state.state} emotional state`,
        valence: state.valence || "Neutral",
      }))
    : [];

  const murrayPresses = Array.isArray(analysis.murray_presses)
    ? analysis.murray_presses.map((press: any) => ({
        name: press.name || "Unknown Press",
        score: press.influence || 0,
        description: press.description || `Assessment of ${press.name} environmental press`,
        category: press.category || press.subcategory || "Unknown",
        intensity:
          press.influence > 80
            ? "Very High"
            : press.influence > 60
              ? "High"
              : press.influence > 40
                ? "Moderate"
                : ("Low" as "Very High" | "High" | "Moderate" | "Low"),
      }))
    : [];

  const militaryAssessment = analysis.military_assessment || null;
  const selectionRecommendation = analysis.selection_recommendation || null;

  const formattedMilitaryAssessment = militaryAssessment
    ? {
        overall_rating: militaryAssessment.overall_rating ?? calculateOverallRating(militaryAssessment),
        suitability: militaryAssessment.suitability ?? getSuitabilityLevel(militaryAssessment),
        leadership_potential:
          militaryAssessment.leadership_potential ?? getScoreValue(militaryAssessment.leadership_potential),
        stress_tolerance: militaryAssessment.stress_tolerance ?? getScoreValue(militaryAssessment.stress_resilience),
        team_compatibility: militaryAssessment.team_compatibility ?? getScoreValue(militaryAssessment.team_dynamics),
        adaptability: militaryAssessment.adaptability ?? getScoreValue(militaryAssessment.adaptability),
        decision_making: militaryAssessment.decision_making ?? getScoreValue(militaryAssessment.decision_making),
        effective_intelligence: militaryAssessment.effective_intelligence ?? 0,
        planning_organizing: militaryAssessment.planning_organizing ?? 0,
        social_adaptability: militaryAssessment.social_adaptability ?? 0,
        cooperation: militaryAssessment.cooperation ?? 0,
        sense_of_responsibility: militaryAssessment.sense_of_responsibility ?? 0,
        courage_determination: militaryAssessment.courage_determination ?? 0,
        scores:
          militaryAssessment.scores ||
          Object.entries(militaryAssessment).map(([key, value]: [string, any]) => ({
            category: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            score: getScoreValue(value),
            assessment: getAssessmentLevel(getScoreValue(value)),
            recommendation: value?.analysis || `Recommendation for ${key.replace(/_/g, " ")}`,
          })),
        notes: militaryAssessment.notes || "Assessment based on psychological analysis and behavioral indicators",
      }
    : null;

  const handleCopyToChatGPT = async () => {
    const formattedText = formatAnalysisForChatGPT(testTitle, score, analysis);

    try {
      await navigator.clipboard.writeText(formattedText);
      toast.success("Analysis copied to clipboard!");
      window.open("https://chat.openai.com/", "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy analysis to clipboard");
    }
  };

  // Shared content component
  const AnalysisContent = () => (
    <div className={isMobile ? "space-y-4 pb-6" : "space-y-6"}>
      {/* Score Hero Section */}
      <div data-tour="score-hero">
        <ScoreHero 
          score={score} 
          testTitle={testTitle} 
          militaryAssessment={formattedMilitaryAssessment}
          selectionRecommendation={selectionRecommendation}
        />
      </div>

      {/* Summary Card */}
      <Card className="glass-effect border-2 border-primary/20">
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>📊 Quick Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${isMobile ? "text-sm" : "text-base"} text-foreground leading-relaxed`}>
            {analysis.summary ||
              "Comprehensive psychological assessment completed. View detailed results in the tabs below."}
          </p>
        </CardContent>
      </Card>

      {/* Mobile Navigation Menu */}
              {isMobile && (
                <div className="grid grid-cols-2 gap-3" data-tour="nav-cards">
                  <NavCard
                    icon={<FileText className="h-5 w-5" />}
                    title="Traditional"
                    active={activeTab === "traditional"}
                    onClick={() => setActiveTab("traditional")}
                    data-tour="traditional-tab"
                  />
                  <NavCard
                    icon={<Activity className="h-5 w-5" />}
                    title="Murray TAT"
                    active={activeTab === "murray"}
                    onClick={() => setActiveTab("murray")}
                    data-tour="murray-tab"
                  />
                  <NavCard
                    icon={<Award className="h-5 w-5" />}
                    title="Military"
                    active={activeTab === "military"}
                    onClick={() => setActiveTab("military")}
                    data-tour="military-tab"
                  />
                  <NavCard
                    icon={<Target className="h-5 w-5" />}
                    title="Recommendations"
                    active={activeTab === "recommendation"}
                    onClick={() => setActiveTab("recommendation")}
                    data-tour="recommendation-tab"
                  />
                  <div className="col-span-2">
                    <NavCard
                      icon={<Sparkles className="h-5 w-5" />}
                      title={
                        <div className="flex items-center gap-2">
                          <span>SSB Interview Prep</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            Pro
                          </Badge>
                        </div>
                      }
                      active={activeTab === "ssb"}
                      onClick={() => setActiveTab("ssb")}
                      data-tour="ssb-tab"
                    />
                  </div>
                </div>
              )}

      {/* Content Area */}
      {isMobile ? (
        <div className="space-y-4">
          {activeTab === "traditional" && (
            <TraditionalAnalysis
              {...{ personalityTraits, dominantEmotions, psychologicalInsights, analysis, isMobile }}
            />
          )}
          {activeTab === "murray" && <MurrayAnalysis {...{ murrayNeeds, murrayPresses, innerStates, isMobile }} />}
          {activeTab === "military" && (
            <MilitaryAnalysis assessment={formattedMilitaryAssessment} isMobile={isMobile} />
          )}
          {activeTab === "recommendation" && (
            <RecommendationAnalysis recommendation={selectionRecommendation} isMobile={isMobile} />
          )}
          {activeTab === "ssb" && (
            <SSBQuestionsCard 
              testSessionId={testSessionId}
              analysisId={analysisId}
              isPro={isPro}
            />
          )}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-tour="tabs">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="traditional" className="py-3" data-tour="traditional-tab">
              <span className="hidden lg:inline">Traditional Analysis</span>
              <span className="lg:hidden">Traditional</span>
            </TabsTrigger>
            <TabsTrigger value="murray" className="py-3" data-tour="murray-tab">
              <span className="hidden lg:inline">Murray TAT</span>
              <span className="lg:hidden">Murray</span>
            </TabsTrigger>
            <TabsTrigger value="military" className="py-3" data-tour="military-tab">
              <span className="hidden lg:inline">Military Assessment</span>
              <span className="lg:hidden">Military</span>
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="py-3" data-tour="recommendation-tab">
              <span className="hidden lg:inline">Recommendations</span>
              <span className="lg:hidden">Recommend</span>
            </TabsTrigger>
            <TabsTrigger value="ssb" className="py-3 gap-1" data-tour="ssb-tab">
              <span className="hidden lg:inline">SSB Interview Prep</span>
              <span className="lg:hidden">SSB Prep</span>
              <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">Pro</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traditional" className="space-y-6 mt-6">
            <TraditionalAnalysis
              {...{ personalityTraits, dominantEmotions, psychologicalInsights, analysis, isMobile }}
            />
          </TabsContent>

          <TabsContent value="murray" className="space-y-6 mt-6">
            <MurrayAnalysis {...{ murrayNeeds, murrayPresses, innerStates, isMobile }} />
          </TabsContent>

          <TabsContent value="military" className="space-y-6 mt-6">
            <MilitaryAnalysis assessment={formattedMilitaryAssessment} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-6 mt-6">
            <RecommendationAnalysis recommendation={selectionRecommendation} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="ssb" className="space-y-6 mt-6">
            <SSBQuestionsCard 
              testSessionId={testSessionId}
              analysisId={analysisId}
              isPro={isPro}
            />
          </TabsContent>
        </Tabs>
      )}
      
      <ProUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      
      <AnalysisReportTour
        run={runReportTour}
        onComplete={handleReportTourComplete}
        onSkip={handleReportTourSkip}
        isMobile={isMobile}
      />
    </div>
  );

  // Mobile: Full-screen Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0 flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Sticky Header */}
          <SheetHeader className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-0">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-lg font-bold">🏆 Your Report</SheetTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyToChatGPT} className="gap-1.5 h-9">
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs">Copy</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-9 w-9 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            <AnalysisContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">🏆 YOUR CHAMPION REPORT</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleCopyToChatGPT} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy to ChatGPT
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </DialogHeader>
        <AnalysisContent />
      </DialogContent>
    </Dialog>
  );
};

// Navigation Card Component for Mobile
const NavCard = ({ icon, title, active, onClick, ...rest }: any) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 p-4 rounded-lg border-2 transition-all
      ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-primary/50"}
    `}
    {...rest}
  >
    <div className={active ? "text-primary" : "text-muted-foreground"}>{icon}</div>
    <div className="flex-1 text-left">
      {typeof title === 'string' ? (
        <p className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{title}</p>
      ) : (
        <div className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>
          {title}
        </div>
      )}
    </div>
    <ChevronRight className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
  </button>
);

// Traditional Analysis Component
const TraditionalAnalysis = ({
  personalityTraits,
  dominantEmotions,
  psychologicalInsights,
  analysis,
  isMobile,
}: any) => (
  <div className={isMobile ? "space-y-4" : "space-y-6"}>
    {/* Personality Traits */}
    {Object.keys(personalityTraits).length > 0 && (
      <Card>
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>Personality Traits</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "space-y-3" : "space-y-4"}>
          {Object.entries(personalityTraits).map(([trait, data]: [string, any]) => (
            <div key={trait} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium capitalize ${isMobile ? "text-sm" : ""}`}>{trait}</h4>
                <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>{data.score}%</span>
              </div>
              <Progress value={data.score} className="h-2" />
              <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>{data.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Dominant Themes */}
    {dominantEmotions.length > 0 && (
      <Card>
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>Dominant Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dominantEmotions.map((theme: string, index: number) => (
              <Badge
                key={index}
                variant="default"
                className={`capitalize bg-primary/20 text-primary ${isMobile ? "text-xs" : ""}`}
              >
                {theme}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Clinical Insights */}
    {psychologicalInsights.length > 0 && (
      <Card>
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>Clinical Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className={isMobile ? "space-y-2" : "space-y-3"}>
            {psychologicalInsights.map((insight: string, index: number) => (
              <li
                key={index}
                className={`text-muted-foreground flex items-start gap-2 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span className="flex-1">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )}

    {/* Environmental Factors */}
    {analysis.environmental_factors && (
      <Card>
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>Environmental Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.environmental_factors.map((factor: string, index: number) => (
              <Badge key={index} variant="outline" className={`capitalize ${isMobile ? "text-xs" : ""}`}>
                {factor}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Murray Analysis Component
const MurrayAnalysis = ({ murrayNeeds, murrayPresses, innerStates, isMobile }: any) => (
  <div className={isMobile ? "space-y-4" : "space-y-6"}>
    {/* Murray Needs Chart */}
    {murrayNeeds.length > 0 ? (
      <MurrayNeedsChart needs={murrayNeeds} />
    ) : (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
              No Murray psychological needs data available.
            </p>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Murray Presses */}
    {murrayPresses.length > 0 && (
      <Card>
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>Murray Environmental Presses</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "space-y-3" : "space-y-4"}>
          {murrayPresses.map((press: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`font-medium ${isMobile ? "text-sm" : ""}`}>{press.name}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className={isMobile ? "text-xs" : ""}>
                    {press.category}
                  </Badge>
                  <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>{press.score}%</span>
                </div>
              </div>
              <Progress value={press.score} className="h-2" />
              <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>{press.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Inner States */}
    {innerStates.length > 0 && (
      <Card>
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>Psychological Inner States</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "space-y-3" : "space-y-4"}>
          {innerStates.map((state: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`font-medium ${isMobile ? "text-sm" : ""}`}>{state.state}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={
                      state.valence === "Positive"
                        ? "default"
                        : state.valence === "Negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className={isMobile ? "text-xs" : ""}
                  >
                    {state.valence}
                  </Badge>
                  <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>{state.intensity}%</span>
                </div>
              </div>
              <Progress value={state.intensity} className="h-2" />
              <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>{state.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    )}
  </div>
);

// Military Analysis Component
const MilitaryAnalysis = ({ assessment, isMobile }: any) => (
  <div>
    {assessment ? (
      <MilitaryAssessmentCard assessment={assessment} />
    ) : (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
              Military assessment data not available for this test.
            </p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Recommendation Analysis Component
const RecommendationAnalysis = ({ recommendation, isMobile }: any) => (
  <div>
    {recommendation ? (
      <SelectionRecommendationPanel recommendation={recommendation} />
    ) : (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
              Selection recommendation data not available for this test.
            </p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Helper functions
function calculateOverallRating(assessment: any): number {
  if (!assessment) return 0;
  const scores = Object.values(assessment)
    .filter((value: any) => value?.score)
    .map((value: any) => value.score);
  return scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
}

function getSuitabilityLevel(assessment: any): "Highly Suitable" | "Suitable" | "Moderately Suitable" | "Not Suitable" {
  const rating = calculateOverallRating(assessment);
  if (rating >= 80) return "Highly Suitable";
  if (rating >= 70) return "Suitable";
  if (rating >= 60) return "Moderately Suitable";
  return "Not Suitable";
}

function getScoreValue(item: any): number {
  if (typeof item === "number") return item;
  if (item?.score) return item.score;
  if (item?.intensity) return item.intensity;
  return 0;
}

function getAssessmentLevel(score: number): "Excellent" | "Good" | "Satisfactory" | "Needs Improvement" {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Satisfactory";
  return "Needs Improvement";
}
