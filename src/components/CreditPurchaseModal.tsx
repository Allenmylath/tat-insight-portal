import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from '@/hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Coins, Star, Zap, Rocket, Lock, TrendingUp } from 'lucide-react';
import '@/types/phonepe';

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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open) {
      fetchCreditPackages();
    }
  }, [open]);

  // Cleanup: Close any stuck PhonePe iframe on unmount
  useEffect(() => {
    return () => {
      if (window.PhonePeCheckout?.closePage) {
        window.PhonePeCheckout.closePage();
      }
    };
  }, []);

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
      // Create PhonePe payment order
      const { data, error } = await supabase.functions.invoke('create-phonepe-payment', {
        body: {
          user_id: userData.id,
          package_id: packageItem.id,
          amount: packageItem.price,
          credits: packageItem.credits,
          package_name: packageItem.name,
        },
      });

      if (error) throw error;

      if (!data.success || !data.data?.checkoutUrl) {
        throw new Error('Failed to create payment order');
      }

      // Open PhonePe payment
      if (window.PhonePeCheckout) {
        if (isMobile) {
          // Mobile: Use REDIRECT mode
          window.PhonePeCheckout.transact({
            tokenUrl: data.data.checkoutUrl
          });
          
          // Show feedback and close modal
          toast({
            title: "Redirecting to Payment",
            description: "You'll be redirected to PhonePe to complete your payment.",
          });
          
          setPurchasing(null);
          onOpenChange(false);
        } else {
          // Desktop: Use IFRAME mode and close modal to prevent overlay conflicts
          window.PhonePeCheckout.transact({
            tokenUrl: data.data.checkoutUrl,
            type: "IFRAME",
            callback: (response: string) => {
              console.log('PhonePe callback response:', response);
              
              if (response === 'USER_CANCEL') {
                toast({
                  title: "Payment Cancelled",
                  description: "You cancelled the payment process.",
                  variant: "destructive"
                });
              } else if (response === 'CONCLUDED') {
                toast({
                  title: "Payment Processing",
                  description: "Your payment is being processed. Credits will be added shortly.",
                  variant: "default"
                });
                
                // Refresh page to update credit balance
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
              
              setPurchasing(null);
            }
          });
          
          // Close modal immediately to prevent z-index/overlay conflicts
          onOpenChange(false);
          setPurchasing(null);
        }
      } else {
        throw new Error('PhonePe checkout not available');
      }

    } catch (error) {
      console.error('Error processing purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
      setPurchasing(null);
    }
  };

  const getPackageGradient = (pkg: CreditPackage) => {
    if (pkg.is_popular) return 'from-purple-500/20 via-pink-500/20 to-purple-500/20';
    if (pkg.credits >= 1000) return 'from-amber-500/20 via-orange-500/20 to-amber-500/20';
    return 'from-blue-500/20 via-cyan-500/20 to-blue-500/20';
  };

  const getPackageBorder = (pkg: CreditPackage) => {
    if (pkg.is_popular) return 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]';
    if (pkg.credits >= 1000) return 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
    return 'border-blue-500/50';
  };

  const getPackageIcon = (pkg: CreditPackage) => {
    if (pkg.is_popular) return <Rocket className="h-6 w-6" />;
    if (pkg.credits >= 1000) return <TrendingUp className="h-6 w-6" />;
    return <Zap className="h-6 w-6" />;
  };

    const PackagesContent = () => (
      <div className="w-full overflow-x-hidden">
        {/* Hero Header */}
        <div className="text-center space-y-3 mb-6 w-full overflow-x-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Coins className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold">
              Current Balance: {userData?.credit_balance || 0} credits
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient break-words px-2">
            POWER UP YOUR TAT! 🚀
          </h3>
          <p className="text-sm text-muted-foreground break-words px-2">
            12,000+ Officers Trained • 100% Safe & Secure 🔒
          </p>
        </div>

      {/* Loading State */}
      {loading ? (
        <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-effect border-border/50">
              <CardHeader className="space-y-3">
                <div className="h-6 bg-muted/50 animate-shimmer rounded" />
                <div className="h-4 bg-muted/50 animate-shimmer rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted/50 animate-shimmer rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 md:gap-6 w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          {packages.map((pkg, index) => (
            <Card 
              key={pkg.id} 
              className={`relative glass-effect border-2 transition-all duration-300 active:scale-[0.98] md:hover:scale-105 animate-fade-in bg-gradient-to-br ${getPackageGradient(pkg)} ${getPackageBorder(pkg)} w-full max-w-full overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {pkg.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1 shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    MOST POPULAR! 🔥
                  </Badge>
                </div>
              )}
              
              <CardHeader className={`text-center space-y-3 ${isMobile ? 'pt-6 pb-4' : 'pt-8 pb-6'}`}>
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">
                  {getPackageIcon(pkg)}
                </div>
                <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                  {pkg.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className={`text-center space-y-4 ${isMobile ? 'pb-6' : 'pb-8'}`}>
                <div className="space-y-2">
                  <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent`}>
                    ₹{pkg.price}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-lg font-semibold text-foreground">
                      {pkg.credits} Credits
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₹{(pkg.price / pkg.credits).toFixed(1)} per credit
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>= {Math.floor(pkg.credits / 100)} Complete TAT Tests</p>
                  <p className="text-[10px]">Full AI Analysis Included</p>
                </div>
                
                <Button 
                  className={`w-full font-bold ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'} ${
                    pkg.is_popular 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl' 
                      : ''
                  } transition-all duration-300 active:scale-95`}
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.id}
                  variant={pkg.is_popular ? "default" : "outline"}
                >
                  {purchasing === pkg.id ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Preparing...
                    </span>
                  ) : (
                    <>GET THIS PACK 🔥</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trust Footer */}
      <div className="text-center space-y-2 mt-6 pt-6 border-t border-border/50 overflow-x-hidden">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Lock className="h-4 w-4" />
          <span className="break-words px-2">100% Secure Payment • UPI, Cards, Net Banking</span>
        </div>
        <p className="text-xs text-muted-foreground break-words px-2">
          Credits never expire • Use them anytime, forever ∞
        </p>
      </div>
    </div>
  );

  // Render mobile drawer or desktop dialog
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] px-4 pb-8 overflow-x-hidden">
          <DrawerHeader className="text-left px-0">
            <DrawerTitle className="flex items-center gap-2 text-xl">
              <Coins className="h-5 w-5 text-primary" />
              Purchase Credits
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto overflow-x-hidden">
            <PackagesContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-primary" />
            Purchase Credits
          </DialogTitle>
        </DialogHeader>
        <PackagesContent />
      </DialogContent>
    </Dialog>
  );
};