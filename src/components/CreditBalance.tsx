import { useUserData } from '@/hooks/useUserData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

interface CreditBalanceProps {
  onPurchaseClick?: () => void;
  showPurchaseButton?: boolean;
}

export const CreditBalance = ({ onPurchaseClick, showPurchaseButton = true }: CreditBalanceProps) => {
  const { userData, loading } = useUserData();

  if (loading || !userData) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const isLowBalance = userData.credit_balance < 100;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isLowBalance ? "destructive" : "secondary"} 
        className="flex items-center gap-1"
      >
        <Coins className="h-3 w-3" />
        {userData.credit_balance} credits
      </Badge>
      
      {showPurchaseButton && (
        <Button 
          size="sm" 
          variant={isLowBalance ? "default" : "outline"}
          onClick={onPurchaseClick}
        >
          {isLowBalance ? "Buy Credits" : "Top Up"}
        </Button>
      )}
    </div>
  );
};