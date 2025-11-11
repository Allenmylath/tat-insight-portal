import { Trophy, Medal, Award, Sparkles, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ScoreHeroProps {
  score: number;
  testTitle: string;
  onShare?: () => void;
}

export const ScoreHero = ({ score, testTitle, onShare }: ScoreHeroProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
        if (score >= 70) {
          setShowConfetti(true);
        }
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getMedalIcon = () => {
    if (score >= 85) return <Trophy className="h-16 w-16 md:h-20 md:w-20 animate-bounce-in" />;
    if (score >= 70) return <Medal className="h-16 w-16 md:h-20 md:w-20 animate-bounce-in" />;
    if (score >= 50) return <Award className="h-14 w-14 md:h-16 md:w-16 animate-bounce-in" />;
    return <Target className="h-14 w-14 md:h-16 md:w-16 animate-bounce-in" />;
  };

  const getGradient = () => {
    if (score >= 85) return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600";
    if (score >= 70) return "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600";
    if (score >= 50) return "bg-gradient-to-br from-orange-400 via-orange-500 to-red-500";
    return "bg-gradient-to-br from-purple-400 via-purple-500 to-pink-600";
  };

  const getMessage = () => {
    if (score >= 85) return "YOU'RE A FUTURE OFFICER 💪";
    if (score >= 70) return "OUTSTANDING PERFORMANCE! 🔥";
    if (score >= 50) return "SOLID PROGRESS! 🚀";
    return "KEEP PUSHING, CHAMPION! 💪";
  };

  const getPercentile = () => {
    if (score >= 85) return "Top 10%";
    if (score >= 70) return "Top 25%";
    if (score >= 50) return "Top 50%";
    return "Keep Training";
  };

  const handleShare = () => {
    const text = `I just scored ${score}% on my TAT! 🎯 #FutureOfficer #TATExpert`;
    if (navigator.share) {
      navigator.share({
        title: "TAT Test Score",
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Score copied to clipboard!");
    }
    onShare?.();
  };

  return (
    <div className={`relative ${getGradient()} rounded-3xl p-6 md:p-10 overflow-hidden`}>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute animate-confetti text-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center space-y-4">
        {/* Medal Icon */}
        <div className="flex justify-center text-white">
          {getMedalIcon()}
        </div>

        {/* Motivational Message */}
        <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg animate-bounce-in">
          {getMessage()}
        </h2>

        {/* Score Display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl animate-counter">
              {displayScore}
            </span>
            <span className="text-4xl md:text-5xl font-bold text-white/90">%</span>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-base md:text-lg px-4 py-2">
            {getPercentile()} of all candidates!
          </Badge>
        </div>

        {/* Share Button */}
        <div className="pt-4">
          <Button
            onClick={handleShare}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm gap-2"
            size="lg"
          >
            <Share2 className="h-4 w-4" />
            Share My Success 📱
          </Button>
        </div>

        {/* Test Title */}
        <p className="text-white/80 text-sm md:text-base font-medium">
          {testTitle}
        </p>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-4 animate-float">
        <Sparkles className="h-6 w-6 text-white/40" />
      </div>
      <div className="absolute bottom-8 left-8 animate-float" style={{ animationDelay: "1s" }}>
        <TrendingUp className="h-8 w-8 text-white/30" />
      </div>
    </div>
  );
};
