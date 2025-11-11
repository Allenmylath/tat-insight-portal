import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, TrendingUp } from "lucide-react";
import { AchievementBadge } from "./AchievementBadge";

interface GamificationPanelProps {
  testsCompleted: number;
  averageScore: number;
  streak?: number;
  achievements?: string[];
}

export const GamificationPanel = ({
  testsCompleted,
  averageScore,
  streak = 0,
  achievements = [],
}: GamificationPanelProps) => {
  const calculateLevel = () => {
    if (testsCompleted >= 30) return "Master";
    if (testsCompleted >= 20) return "Expert";
    if (testsCompleted >= 10) return "Advanced";
    if (testsCompleted >= 5) return "Intermediate";
    return "Beginner";
  };

  const calculateXP = () => {
    const baseXP = testsCompleted * 100;
    const bonusXP = Math.floor(averageScore * 2);
    return baseXP + bonusXP;
  };

  const getNextLevelXP = () => {
    const level = calculateLevel();
    switch (level) {
      case "Beginner": return 500;
      case "Intermediate": return 1000;
      case "Advanced": return 2000;
      case "Expert": return 3000;
      default: return 5000;
    }
  };

  const currentXP = calculateXP();
  const nextLevelXP = getNextLevelXP();
  const progressToNextLevel = (currentXP / nextLevelXP) * 100;

  return (
    <Card className="glass-effect border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Your Officer Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level & XP */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-gradient-to-r from-primary to-accent text-white text-lg px-4 py-1">
                {calculateLevel()} Level
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">XP Progress</p>
              <p className="text-lg font-bold">
                {currentXP} / {nextLevelXP}
              </p>
            </div>
          </div>
          <Progress value={progressToNextLevel} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {nextLevelXP - currentXP} XP to next level!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{testsCompleted}</p>
            <p className="text-xs text-muted-foreground">Tests</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/10">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{averageScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-500/10">
            <span className="text-3xl mb-2 block">🔥</span>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {achievements.includes("first_test") && <AchievementBadge type="first_test" />}
              {streak >= 5 && <AchievementBadge type="streak" count={streak} />}
              {averageScore >= 80 && <AchievementBadge type="high_score" />}
            </div>
          </div>
        )}

        {/* Next Milestone */}
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm font-medium mb-1">🎯 Next Milestone</p>
          <p className="text-xs text-muted-foreground">
            {testsCompleted < 5 && `Complete ${5 - testsCompleted} more tests to reach Intermediate!`}
            {testsCompleted >= 5 && testsCompleted < 10 && `Complete ${10 - testsCompleted} more tests to reach Advanced!`}
            {testsCompleted >= 10 && testsCompleted < 20 && `Complete ${20 - testsCompleted} more tests to reach Expert!`}
            {testsCompleted >= 20 && testsCompleted < 30 && `Complete ${30 - testsCompleted} more tests to reach Master!`}
            {testsCompleted >= 30 && "You've reached Master level! 🏆"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
