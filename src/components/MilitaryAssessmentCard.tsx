import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Users, Zap, Target, CheckCircle2 } from "lucide-react";
import { MilitaryAssessment } from "@/types/analysis";

interface MilitaryAssessmentCardProps {
  assessment: MilitaryAssessment;
}

export const MilitaryAssessmentCard = ({ assessment }: MilitaryAssessmentCardProps) => {
  if (!assessment) return null;

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'Highly Suitable': return 'bg-green-500/20 text-green-700';
      case 'Suitable': return 'bg-blue-500/20 text-blue-700';
      case 'Moderately Suitable': return 'bg-yellow-500/20 text-yellow-700';
      case 'Not Suitable': return 'bg-red-500/20 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAssessmentIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'leadership': return <Star className="h-4 w-4" />;
      case 'teamwork': return <Users className="h-4 w-4" />;
      case 'adaptability': return <Zap className="h-4 w-4" />;
      case 'decision making': return <Target className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Military Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Rating</span>
            <div className="flex items-center gap-2">
              <Badge className={getSuitabilityColor(assessment.suitability)}>
                {assessment.suitability}
              </Badge>
              <span className="text-lg font-bold">{assessment.overall_rating}%</span>
            </div>
          </div>
          <Progress value={assessment.overall_rating} className="h-3" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Leadership Potential</span>
            <div className="flex items-center gap-2">
              <Progress value={assessment.leadership_potential} className="h-2 flex-1" />
              <span className="text-sm font-medium">{assessment.leadership_potential}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Stress Tolerance</span>
            <div className="flex items-center gap-2">
              <Progress value={assessment.stress_tolerance} className="h-2 flex-1" />
              <span className="text-sm font-medium">{assessment.stress_tolerance}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Team Compatibility</span>
            <div className="flex items-center gap-2">
              <Progress value={assessment.team_compatibility} className="h-2 flex-1" />
              <span className="text-sm font-medium">{assessment.team_compatibility}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Adaptability</span>
            <div className="flex items-center gap-2">
              <Progress value={assessment.adaptability} className="h-2 flex-1" />
              <span className="text-sm font-medium">{assessment.adaptability}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        {assessment.scores && assessment.scores.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Detailed Assessment</h4>
            {assessment.scores.map((score, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  {getAssessmentIcon(score.category)}
                  <span className="text-sm font-medium">{score.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{score.assessment}</Badge>
                  <span className="text-sm font-medium">{score.score}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {assessment.notes && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Additional Notes</h4>
            <p className="text-sm text-muted-foreground">{assessment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};