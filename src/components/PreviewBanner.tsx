import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PreviewBanner = () => {
  const navigate = useNavigate();

  return (
    <Alert className="border-primary/50 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 shadow-lg mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-primary" />
          <div>
            <AlertDescription className="text-base font-semibold text-foreground">
              You're viewing a preview
            </AlertDescription>
            <AlertDescription className="text-sm text-muted-foreground">
              Login to access all features and start taking tests
            </AlertDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth/signin')}
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/auth/signup')}
            className="gap-2"
          >
            Get Started
          </Button>
        </div>
      </div>
    </Alert>
  );
};
