import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: any;
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

  const personalityTraits = analysis.personality_traits || {};
  const emotionalThemes = analysis.emotional_themes || [];
  const copingMechanisms = analysis.coping_mechanisms || [];
  const dominantEmotions = analysis.dominant_emotions || [];
  const psychologicalInsights = analysis.psychological_insights || [];

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
                {analysis.summary}
              </p>
            </CardContent>
          </Card>

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

          {/* Emotional Themes */}
          {emotionalThemes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emotional Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {emotionalThemes.map((theme: string, index: number) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coping Mechanisms */}
          {copingMechanisms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coping Mechanisms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {copingMechanisms.map((mechanism: string, index: number) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {mechanism}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dominant Emotions */}
          {dominantEmotions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dominant Emotions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dominantEmotions.map((emotion: string, index: number) => (
                    <Badge key={index} variant="default" className="capitalize bg-primary/20 text-primary">
                      {emotion}
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
                <CardTitle className="text-lg">Psychological Insights</CardTitle>
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

          {/* Interpersonal Style */}
          {analysis.interpersonal_style && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interpersonal Style</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.interpersonal_style}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Motivation Patterns */}
          {analysis.motivation_patterns && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Motivation Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.motivation_patterns}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};