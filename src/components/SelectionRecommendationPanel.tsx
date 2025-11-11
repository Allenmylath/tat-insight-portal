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

  const getRecommendationGradient = (rec: string) => {
    switch (rec) {
      case 'Strongly Recommend': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'Recommend': return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'Consider': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'Not Recommended': return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-600';
    }
  };

  return (
    <Card className="glass-effect border-2 border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-6 w-6 text-green-600" />
          🎯 YOUR PATH FORWARD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Recommendation - Hero */}
        <div className={`${getRecommendationGradient(recommendation.overall_recommendation)} rounded-2xl p-6 text-white space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">SELECTION STATUS</span>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-base px-4 py-1.5">
              {recommendation.overall_recommendation}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-black drop-shadow-lg">
              {recommendation.confidence_level}% CONFIDENCE
            </p>
            <Progress value={recommendation.confidence_level} className="h-4 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>

        {/* Key Strengths - Positive First */}
        {recommendation.key_strengths && recommendation.key_strengths.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              💪 YOUR SUPERPOWERS
            </h4>
            <div className="grid gap-3">
              {recommendation.key_strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border-2 border-green-500/20 hover:border-green-500/40 transition-all">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base font-medium">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Development - Reframed Positively */}
        {recommendation.areas_for_development && recommendation.areas_for_development.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              🚀 LEVEL UP THESE SKILLS
            </h4>
            <div className="grid gap-3">
              {recommendation.areas_for_development.map((area, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl border-2 border-orange-500/20 hover:border-orange-500/40 transition-all">
                  <AlertCircle className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base font-medium">{area}</span>
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

        {/* Next Steps - Action Oriented */}
        {recommendation.next_steps && recommendation.next_steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-lg">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              🎯 YOUR ACTION PLAN
            </h4>
            <div className="grid gap-3">
              {recommendation.next_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                    {index + 1}
                  </div>
                  <span className="text-base font-medium flex-1">{step}</span>
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