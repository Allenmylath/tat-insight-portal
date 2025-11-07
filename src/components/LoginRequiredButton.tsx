import { Button, ButtonProps } from "@/components/ui/button";
import { Lock, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

interface LoginRequiredButtonProps extends ButtonProps {
  returnUrl?: string;
  requiresCredits?: boolean;
  creditsNeeded?: number;
  currentBalance?: number;
  insufficientCreditsText?: string;
}

export const LoginRequiredButton = ({ 
  children, 
  returnUrl = "/dashboard",
  requiresCredits = false,
  creditsNeeded = 100,
  currentBalance = 0,
  insufficientCreditsText = "Insufficient Credits",
  ...props 
}: LoginRequiredButtonProps) => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  // Check authentication first, then credits
  const hasInsufficientCredits = requiresCredits && isSignedIn && currentBalance < creditsNeeded;

  const handleClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      navigate(`/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else if (hasInsufficientCredits) {
      e.preventDefault();
      // Button is disabled, do nothing
    } else if (props.onClick) {
      props.onClick(e as any);
    }
  };

  // Determine button content
  let buttonContent = children;
  let icon = null;

  if (!isSignedIn) {
    buttonContent = "Login to Continue";
    icon = <Lock className="h-4 w-4" />;
  } else if (hasInsufficientCredits) {
    buttonContent = insufficientCreditsText;
    icon = <Coins className="h-4 w-4" />;
  }

  return (
    <Button 
      {...props} 
      onClick={handleClick} 
      disabled={props.disabled || hasInsufficientCredits}
      className={`gap-2 ${props.className || ''}`}
    >
      {icon}
      {buttonContent}
    </Button>
  );
};
