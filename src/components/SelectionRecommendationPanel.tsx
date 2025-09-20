import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, TrendingUp, Users, ArrowRight } from "lucide-react";
import { SelectionRecommendation } from "@/types/analysis";

interface SelectionRecommendationPanelProps {
  recommendation: SelectionRecommendation;
}

export const SelectionRecommendationPanel = ({ recommendation }: SelectionRecommendationPanelProps) => {
  if (!recommendation) return null;

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strongly Recommend': return 'bg-green-500/20 text-green-700';
      case 'Recommend': return 'bg-blue-500/20 text-blue-700';
      case 'Consider': return 'bg-yellow-500/20 text-yellow-700';
      case 'Not Recommended': return 'bg-red-500/20 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Selection Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Recommendation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Recommendation</span>
            <div className="flex items-center gap-2">
              <Badge className={getRecommendationColor(recommendation.overall_recommendation)}>
                {recommendation.overall_recommendation}
              </Badge>
              <span className="text-sm font-medium">{recommendation.confidence_level}% Confidence</span>
            </div>
          </div>
          <Progress value={recommendation.confidence_level} className="h-3" />
        </div>

        {/* Key Strengths */}
        {recommendation.key_strengths && recommendation.key_strengths.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Key Strengths
            </h4>
            <div className="space-y-2">
              {recommendation.key_strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Development */}
        {recommendation.areas_for_development && recommendation.areas_for_development.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Areas for Development
            </h4>
            <div className="space-y-2">
              {recommendation.areas_for_development.map((area, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-orange-500/10 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Suitability */}
        {recommendation.role_suitability && recommendation.role_suitability.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Role Suitability Analysis</h4>
            {recommendation.role_suitability.map((role, index) => (
              <div key={index} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{role.role}</span>
                  <span className="text-sm font-medium">{role.suitability_score}%</span>
                </div>
                <Progress value={role.suitability_score} className="h-2" />
                <p className="text-xs text-muted-foreground">{role.rationale}</p>
              </div>
            ))}
          </div>
        )}

        {/* Next Steps */}
        {recommendation.next_steps && recommendation.next_steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <ArrowRight className="h-4 w-4 text-blue-600" />
              Recommended Next Steps
            </h4>
            <div className="space-y-2">
              {recommendation.next_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-lg">
                  <span className="text-xs font-bold text-blue-600 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Assessments */}
        {recommendation.follow_up_assessments && recommendation.follow_up_assessments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Suggested Follow-up Assessments</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.follow_up_assessments.map((assessment, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {assessment}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};