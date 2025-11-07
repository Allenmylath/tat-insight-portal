import { Button, ButtonProps } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

interface LoginRequiredButtonProps extends ButtonProps {
  returnUrl?: string;
}

export const LoginRequiredButton = ({ 
  children, 
  returnUrl = "/dashboard",
  ...props 
}: LoginRequiredButtonProps) => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      navigate(`/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else if (props.onClick) {
      props.onClick(e as any);
    }
  };

  return (
    <Button {...props} onClick={handleClick} className={`gap-2 ${props.className || ''}`}>
      {!isSignedIn && <Lock className="h-4 w-4" />}
      {!isSignedIn ? "Login to Continue" : children}
    </Button>
  );
};
