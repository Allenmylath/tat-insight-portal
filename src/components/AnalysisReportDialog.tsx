import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MurrayNeedsChart } from "@/components/MurrayNeedsChart";
import { MilitaryAssessmentCard } from "@/components/MilitaryAssessmentCard";
import { SelectionRecommendationPanel } from "@/components/SelectionRecommendationPanel";
import { EnhancedAnalysisData } from "@/types/analysis";

interface AnalysisReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: EnhancedAnalysisData | any;
  testTitle: string;
  score: number;
}

export const AnalysisReportDialog = ({ 
  open, 
  onOpenChange, 
  analysis, 
  testTitle, 
  score 
}: AnalysisReportDialogProps) => {
  if (!analysis) return null;

  // Debug log to see what data we're getting
  console.log('Analysis data received:', analysis);

  // Handle data extraction from nested analysis structure
  const personalityTraits = analysis.personality_traits || {};
  const emotionalThemes = analysis.emotional_themes || [];  
  const copingMechanisms = analysis.coping_mechanisms || [];
  const dominantEmotions = analysis.dominant_emotions || analysis.dominant_themes || [];
  const psychologicalInsights = analysis.psychological_insights || analysis.clinical_insights || [];
  
  // Extract Murray Needs from nested structure
  const murrayNeeds = analysis.murray_needs ? Object.entries(analysis.murray_needs)
    .filter(([key, value]: [string, any]) => value?.present === true)
    .map(([key, value]: [string, any]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      score: value.intensity || 0,
      description: value.description || `Assessment of ${key.replace(/_/g, ' ')} psychological need`,
      intensity: (value.intensity > 80 ? 'Very High' : value.intensity > 60 ? 'High' : value.intensity > 40 ? 'Moderate' : 'Low') as 'Very High' | 'High' | 'Moderate' | 'Low'
    })) : [];
    
  // Extract Inner States from nested structure  
  const innerStates = analysis.inner_states ? Object.entries(analysis.inner_states)
    .filter(([key, value]: [string, any]) => value?.present === true)
    .map(([key, value]: [string, any]) => ({
      state: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      intensity: value.intensity || 0,
      description: value.description || `${key.replace(/_/g, ' ')} emotional state`,
      valence: value.intensity > 50 ? 'Positive' : value.intensity > 0 ? 'Neutral' : 'Negative'
    })) : [];
    
  const murrayPresses = analysis.murray_presses || [];
  const militaryAssessment = analysis.military_assessment || null;
  const selectionRecommendation = analysis.selection_recommendation || null;

  // Convert military assessment to expected format if needed
  const formattedMilitaryAssessment = militaryAssessment ? {
    overall_rating: calculateOverallRating(militaryAssessment),
    suitability: getSuitabilityLevel(militaryAssessment),
    leadership_potential: getScoreValue(militaryAssessment.leadership_potential),
    stress_tolerance: getScoreValue(militaryAssessment.stress_resilience),
    team_compatibility: getScoreValue(militaryAssessment.team_dynamics),
    adaptability: getScoreValue(militaryAssessment.adaptability),
    decision_making: getScoreValue(militaryAssessment.decision_making),
    scores: Object.entries(militaryAssessment).map(([key, value]: [string, any]) => ({
      category: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      score: getScoreValue(value),
      assessment: getAssessmentLevel(getScoreValue(value)),
      recommendation: value?.analysis || `Recommendation for ${key.replace(/_/g, ' ')}`
    })),
    notes: "Assessment based on psychological analysis and behavioral indicators"
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {testTitle} - Full Analysis Report
            <Badge variant="default" className="bg-primary/10 text-primary">
              {score}% Confidence
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.summary || "Comprehensive psychological assessment completed. View detailed results in the tabs below."}
              </p>
            </CardContent>
          </Card>

          {/* Enhanced Analysis with Tabs */}
          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="traditional">Traditional Analysis</TabsTrigger>
              <TabsTrigger value="murray">Murray TAT</TabsTrigger>
              <TabsTrigger value="military">Military Assessment</TabsTrigger>
              <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="traditional" className="space-y-6 mt-6">
              {/* Personality Traits */}
              {Object.keys(personalityTraits).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personality Traits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(personalityTraits).map(([trait, data]: [string, any]) => (
                      <div key={trait} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium capitalize">{trait}</h4>
                          <span className="text-sm font-medium">{data.score}%</span>
                        </div>
                        <Progress value={data.score} className="h-2" />
                        <p className="text-xs text-muted-foreground">{data.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Dominant Emotions/Themes */}
              {dominantEmotions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dominant Themes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {dominantEmotions.map((theme: string, index: number) => (
                        <Badge key={index} variant="default" className="capitalize bg-primary/20 text-primary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Psychological Insights */}
              {psychologicalInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clinical Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {psychologicalInsights.map((insight: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Environmental Factors */}
              {analysis.environmental_factors && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environmental Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.environmental_factors.map((factor: string, index: number) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="murray" className="space-y-6 mt-6">
              {/* Murray Needs */}
              {murrayNeeds.length > 0 && <MurrayNeedsChart needs={murrayNeeds} />}
              
              {murrayNeeds.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No specific Murray psychological needs identified in this analysis.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inner States */}
              {innerStates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Psychological Inner States</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {innerStates.map((state: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{state.state}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={state.valence === 'Positive' ? 'default' : state.valence === 'Negative' ? 'destructive' : 'secondary'}>
                              {state.valence}
                            </Badge>
                            <span className="text-sm font-medium">{state.intensity}%</span>
                          </div>
                        </div>
                        <Progress value={state.intensity} className="h-2" />
                        <p className="text-xs text-muted-foreground">{state.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="military" className="space-y-6 mt-6">
              {formattedMilitaryAssessment && <MilitaryAssessmentCard assessment={formattedMilitaryAssessment} />}
              {!formattedMilitaryAssessment && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No military assessment data available for this analysis.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendation" className="space-y-6 mt-6">
              {selectionRecommendation && <SelectionRecommendationPanel recommendation={selectionRecommendation} />}
              {!selectionRecommendation && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No selection recommendations available for this analysis.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
function calculateOverallRating(assessment: any): number {
  if (!assessment) return 0;
  const scores = Object.values(assessment).filter((value: any) => value?.score).map((value: any) => value.score);
  return scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
}

function getSuitabilityLevel(assessment: any): 'Highly Suitable' | 'Suitable' | 'Moderately Suitable' | 'Not Suitable' {
  const rating = calculateOverallRating(assessment);
  if (rating >= 80) return 'Highly Suitable';
  if (rating >= 70) return 'Suitable';
  if (rating >= 60) return 'Moderately Suitable';
  return 'Not Suitable';
}

function getScoreValue(item: any): number {
  if (typeof item === 'number') return item;
  if (item?.score) return item.score;
  if (item?.intensity) return item.intensity;
  return 0;
}

function getAssessmentLevel(score: number): 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Satisfactory';
  return 'Needs Improvement';
}