import { Trophy, Flame, Star, Target, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AchievementBadgeProps {
  type: "first_test" | "streak" | "high_score" | "top_performer" | "improvement" | "all_tests";
  count?: number;
}

export const AchievementBadge = ({ type, count }: AchievementBadgeProps) => {
  const getAchievementConfig = () => {
    switch (type) {
      case "first_test":
        return {
          icon: Target,
          label: "First Test Completed",
          color: "bg-blue-500/20 text-blue-700 border-blue-500/50",
          glow: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
        };
      case "streak":
        return {
          icon: Flame,
          label: `${count}-Day Streak`,
          color: "bg-orange-500/20 text-orange-700 border-orange-500/50",
          glow: "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
        };
      case "high_score":
        return {
          icon: Star,
          label: "Scored 80%+",
          color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
          glow: "shadow-[0_0_15px_rgba(234,179,8,0.5)]",
        };
      case "top_performer":
        return {
          icon: Trophy,
          label: "Top 10% Performer",
          color: "bg-green-500/20 text-green-700 border-green-500/50",
          glow: "shadow-[0_0_15px_rgba(34,197,94,0.5)]",
        };
      case "improvement":
        return {
          icon: TrendingUp,
          label: `+${count}% Improvement`,
          color: "bg-purple-500/20 text-purple-700 border-purple-500/50",
          glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
        };
      case "all_tests":
        return {
          icon: Zap,
          label: "All Tests Completed",
          color: "bg-pink-500/20 text-pink-700 border-pink-500/50",
          glow: "shadow-[0_0_15px_rgba(236,72,153,0.5)]",
        };
      default:
        return {
          icon: Trophy,
          label: "Achievement",
          color: "bg-primary/20 text-primary",
          glow: "",
        };
    }
  };

  const config = getAchievementConfig();
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.color} ${config.glow} px-3 py-1.5 gap-2 animate-bounce-in border-2`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </Badge>
  );
};
