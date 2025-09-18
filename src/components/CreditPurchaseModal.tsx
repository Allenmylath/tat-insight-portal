import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from '@/hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { Coins, Star } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  is_popular: boolean;
}

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreditPurchaseModal = ({ open, onOpenChange }: CreditPurchaseModalProps) => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { userData } = useUserData();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCreditPackages();
    }
  }, [open]);

  const fetchCreditPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      toast({
        title: "Error",
        description: "Failed to load credit packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageItem: CreditPackage) => {
    if (!userData) return;

    setPurchasing(packageItem.id);
    try {
      // For now, just show a placeholder toast
      // In production, this would integrate with PhonePe/Razorpay
      toast({
        title: "Payment Integration Required",
        description: `Selected ${packageItem.name} for ₹${packageItem.price}. Payment gateway integration needed.`,
        variant: "default"
      });

      // Simulate adding credits for demo purposes
      // In production, this would only happen after successful payment
      const { error } = await supabase.rpc('add_credits_after_purchase', {
        p_user_id: userData.id,
        p_purchase_id: crypto.randomUUID(),
        p_credits_purchased: packageItem.credits
      });

      if (error) throw error;

      toast({
        title: "Credits Added!",
        description: `Successfully added ${packageItem.credits} credits to your account.`,
        variant: "default"
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Purchase Credits
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.is_popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                {pkg.is_popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold">₹{pkg.price}</div>
                    <div className="text-muted-foreground">
                      {pkg.credits} Credits
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{(pkg.price / pkg.credits).toFixed(1)} per credit
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id}
                    variant={pkg.is_popular ? "default" : "outline"}
                  >
                    {purchasing === pkg.id ? "Processing..." : "Purchase"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Each TAT test consumes 100 credits (₹100)</p>
          <p>Secure payment processing with multiple payment options</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};