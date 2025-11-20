import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useUserData } from '@/hooks/useUserData';

interface ProUpgradeBannerProps {
  onUpgrade: () => void;
}

export const ProUpgradeBanner = ({ onUpgrade }: ProUpgradeBannerProps) => {
  const { userData, isPro } = useUserData();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userData) return;
    
    const dismissKey = `proBannerDismissed_${userData.id}`;
    const dismissedData = localStorage.getItem(dismissKey);
    
    if (dismissedData) {
      const { timestamp } = JSON.parse(dismissedData);
      const daysSinceDismissal = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissal < 7) {
        setDismissed(true);
      } else {
        // Clear old dismissal
        localStorage.removeItem(dismissKey);
      }
    }
  }, [userData]);

  const handleDismiss = () => {
    if (!userData) return;
    
    const dismissKey = `proBannerDismissed_${userData.id}`;
    localStorage.setItem(dismissKey, JSON.stringify({ timestamp: Date.now() }));
    setDismissed(true);
  };

  // Don't show if user is Pro or banner is dismissed
  if (isPro || dismissed || !userData) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <p className="text-sm md:text-base font-medium">
              Unlock SSB Interview Questions for All Your Tests - Go Pro for ₹500/month
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onUpgrade}
              className="whitespace-nowrap"
            >
              Learn More
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
