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

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-purple-500 to-pink-600';
  };

  return (
    <Card className="glass-effect border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-6 w-6 text-accent" />
          🎖️ OFFICER POTENTIAL ASSESSMENT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating - Hero Section */}
        <div className={`${getScoreGradient(assessment.overall_rating)} rounded-2xl p-6 text-white space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">OVERALL OFFICER RATING</span>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-base px-4 py-1.5">
              {assessment.suitability}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black drop-shadow-lg">{assessment.overall_rating}</span>
            <span className="text-4xl font-bold">%</span>
          </div>
          <Progress value={assessment.overall_rating} className="h-4 bg-white/20 [&>div]:bg-white" />
        </div>

        {/* 6 Military Qualities - Enhanced Cards */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg mb-4">🎯 CORE OFFICER QUALITIES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Effective Intelligence", value: assessment.effective_intelligence, icon: "🧠" },
              { label: "Planning & Organizing", value: assessment.planning_organizing, icon: "📋" },
              { label: "Social Adaptability", value: assessment.social_adaptability, icon: "🤝" },
              { label: "Cooperation", value: assessment.cooperation, icon: "👥" },
              { label: "Sense of Responsibility", value: assessment.sense_of_responsibility, icon: "⚖️" },
              { label: "Courage & Determination", value: assessment.courage_determination, icon: "💪" }
            ].map((quality, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/10 hover:border-primary/30 transition-all space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold flex items-center gap-2">
                    <span className="text-xl">{quality.icon}</span>
                    {quality.label}
                  </span>
                  <span className="text-2xl font-black text-primary">{quality.value}%</span>
                </div>
                <Progress value={quality.value} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
              </div>
            ))}
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