import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { MurrayNeed } from "@/types/analysis";

interface MurrayNeedsChartProps {
  needs: MurrayNeed[];
}

export const MurrayNeedsChart = ({ needs }: MurrayNeedsChartProps) => {
  if (!needs || needs.length === 0) return null;

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Very High': return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
      case 'High': return 'bg-gradient-to-r from-orange-500 to-amber-600 text-white';
      case 'Moderate': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'Low': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-pink-600';
    if (score >= 60) return '[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-600';
    if (score >= 40) return '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500';
    return '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-600';
  };

  return (
    <Card className="glass-effect border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Brain className="h-6 w-6 text-primary" />
          💪 YOUR PSYCHOLOGICAL SUPERPOWERS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {needs.map((need, index) => (
          <div key={index} className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-base">{need.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{need.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <Badge className={`${getIntensityColor(need.intensity)} font-bold px-3 py-1`}>
                  {need.intensity}
                </Badge>
                <span className="text-2xl font-black text-primary">{need.score}%</span>
              </div>
            </div>
            <Progress value={need.score} className={`h-3 ${getProgressColor(need.score)}`} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};