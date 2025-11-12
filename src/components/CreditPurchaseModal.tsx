import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Coins, Star, Zap, Rocket, Lock, TrendingUp } from "lucide-react";
import "@/types/phonepe";

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
        .from("credit_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching credit packages:", error);
      toast({
        title: "Error",
        description: "Failed to load credit packages",
        variant: "destructive",
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
      const { data, error } = await supabase.functions.invoke("create-phonepe-payment", {
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
        throw new Error("Failed to create payment order");
      }

      // Open PhonePe payment
      if (window.PhonePeCheckout) {
        if (isMobile) {
          // Mobile: Use REDIRECT mode
          window.PhonePeCheckout.transact({
            tokenUrl: data.data.checkoutUrl,
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
              console.log("PhonePe callback response:", response);

              if (response === "USER_CANCEL") {
                toast({
                  title: "Payment Cancelled",
                  description: "You cancelled the payment process.",
                  variant: "destructive",
                });
              } else if (response === "CONCLUDED") {
                toast({
                  title: "Payment Processing",
                  description: "Your payment is being processed. Credits will be added shortly.",
                  variant: "default",
                });

                // Refresh page to update credit balance
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }

              setPurchasing(null);
            },
          });

          // Close modal immediately to prevent z-index/overlay conflicts
          onOpenChange(false);
          setPurchasing(null);
        }
      } else {
        throw new Error("PhonePe checkout not available");
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
      setPurchasing(null);
    }
  };

  const getPackageGradient = (pkg: CreditPackage) => {
    if (pkg.is_popular) return "from-purple-500/20 via-pink-500/20 to-purple-500/20";
    if (pkg.credits >= 1000) return "from-amber-500/20 via-orange-500/20 to-amber-500/20";
    return "from-blue-500/20 via-cyan-500/20 to-blue-500/20";
  };

  const getPackageBorder = (pkg: CreditPackage) => {
    if (pkg.is_popular) return "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
    if (pkg.credits >= 1000) return "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    return "border-blue-500/50";
  };

  const getPackageIcon = (pkg: CreditPackage) => {
    if (pkg.is_popular) return <Rocket className="h-5 w-5 md:h-6 md:w-6" />;
    if (pkg.credits >= 1000) return <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />;
    return <Zap className="h-5 w-5 md:h-6 md:w-6" />;
  };

  const PackagesContent = () => (
    <div className="w-full overflow-x-hidden">
      {/* Hero Header - Safe mobile width */}
      <div className="text-center space-y-2 md:space-y-3 mb-4 md:mb-6 w-full px-2 md:px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 max-w-full">
          <Coins className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
          <span className="text-xs md:text-sm font-semibold truncate">
            Balance: {userData?.credit_balance || 0} credits
          </span>
        </div>

        {/* Safe gradient text with proper containment */}
        <div className="w-full overflow-hidden">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary px-2">POWER UP YOUR TAT! 🚀</h3>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground px-2">12,000+ Officers Trained • 100% Secure 🔒</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 px-2 md:px-0">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-effect border-border/50 overflow-hidden">
              <CardHeader className="space-y-3 p-4 md:p-6">
                <div className="h-5 md:h-6 bg-muted/50 animate-shimmer rounded" />
                <div className="h-3 md:h-4 bg-muted/50 animate-shimmer rounded w-3/4" />
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="h-20 md:h-24 bg-muted/50 animate-shimmer rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 w-full px-2 md:px-0">
          {packages.map((pkg, index) => (
            <Card
              key={pkg.id}
              className={`
                relative glass-effect border-2 transition-all duration-300 
                animate-fade-in bg-gradient-to-br 
                ${getPackageGradient(pkg)} ${getPackageBorder(pkg)} 
                w-full overflow-hidden
                ${!isMobile && "hover:scale-[1.02]"}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge - Fixed positioning */}
              {pkg.is_popular && (
                <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-1/2 z-10 pointer-events-none">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-0.5 md:px-4 md:py-1 shadow-lg text-xs">
                    <Star className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1 fill-white flex-shrink-0" />
                    <span className="whitespace-nowrap">MOST POPULAR! 🔥</span>
                  </Badge>
                </div>
              )}

              {/* Card Header */}
              <CardHeader
                className={`text-center space-y-2 md:space-y-3 p-4 md:p-6 ${pkg.is_popular ? "pt-6 md:pt-8" : "pt-4 md:pt-6"}`}
              >
                <div className="mx-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  {getPackageIcon(pkg)}
                </div>
                <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold break-words px-2">{pkg.name}</CardTitle>
                <CardDescription className="text-xs md:text-sm break-words px-2">{pkg.description}</CardDescription>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="text-center space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                {/* Price Section */}
                <div className="space-y-1.5 md:space-y-2">
                  {/* Price - Safe text sizing */}
                  <div className="w-full overflow-hidden">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">₹{pkg.price}</div>
                  </div>

                  {/* Credits */}
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-wrap">
                    <Coins className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                    <span className="text-base md:text-lg font-semibold text-foreground">{pkg.credits} Credits</span>
                  </div>

                  {/* Per Credit Price */}
                  <div className="text-xs text-muted-foreground">
                    ₹{(pkg.price / pkg.credits).toFixed(1)} per credit
                  </div>
                </div>

                {/* Tests Info */}
                <div className="text-xs text-muted-foreground space-y-0.5 md:space-y-1 px-2">
                  <p>= {Math.floor(pkg.credits / 100)} Complete TAT Tests</p>
                  <p className="text-[10px] md:text-xs">Full AI Analysis Included</p>
                </div>

                {/* CTA Button - Proper touch target */}
                <Button
                  className={`
                    w-full font-bold min-h-[44px] text-sm md:text-base lg:text-lg
                    ${
                      pkg.is_popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                        : ""
                    } 
                    transition-all duration-200
                    ${!isMobile && "hover:shadow-xl"}
                  `}
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.id}
                  variant={pkg.is_popular ? "default" : "outline"}
                >
                  {purchasing === pkg.id ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs md:text-sm lg:text-base">Preparing...</span>
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm lg:text-base">GET THIS PACK 🔥</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trust Footer */}
      <div className="text-center space-y-1.5 md:space-y-2 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border/50 w-full px-2 md:px-4">
        <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground flex-wrap">
          <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
          <span className="text-center">100% Secure Payment • UPI, Cards, Net Banking</span>
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground">
          Credits never expire • Use them anytime, forever ∞
        </p>
      </div>
    </div>
  );

  // Render mobile drawer or desktop dialog
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] px-0 pb-6 overflow-hidden">
          <DrawerHeader className="text-left px-4 pb-2">
            <DrawerTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Coins className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
              <span>Purchase Credits</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto overflow-x-hidden px-0 pb-safe">
            <PackagesContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Coins className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Purchase Credits
          </DialogTitle>
        </DialogHeader>
        <PackagesContent />
      </DialogContent>
    </Dialog>
  );
};
