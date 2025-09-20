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
      case 'Very High': return 'bg-red-500/20 text-red-700';
      case 'High': return 'bg-orange-500/20 text-orange-700';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-700';
      case 'Low': return 'bg-green-500/20 text-green-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Murray Psychological Needs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {needs.map((need, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{need.name}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getIntensityColor(need.intensity)}>
                  {need.intensity}
                </Badge>
                <span className="text-sm font-medium">{need.score}%</span>
              </div>
            </div>
            <Progress value={need.score} className="h-2" />
            <p className="text-xs text-muted-foreground">{need.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};