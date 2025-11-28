import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Coins, Plus, Minus, Lock } from "lucide-react";
import "@/types/phonepe";

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreditPurchaseModal = ({ open, onOpenChange }: CreditPurchaseModalProps) => {
  const PRICE_PER_TEST = 100;  // ₹100 per test
  const CREDITS_PER_TEST = 100; // 100 credits per test
  const MIN_QUANTITY = 1;
  const MAX_QUANTITY = 50;

  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const { userData } = useUserData();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handlePurchase = async () => {
    if (!userData) return;

    const amount = quantity * PRICE_PER_TEST;
    const credits = quantity * CREDITS_PER_TEST;
    const packageName = `${quantity} Test${quantity > 1 ? 's' : ''} Pack`;

    setPurchasing(true);
    try {
      // Create PhonePe payment order
      const { data, error } = await supabase.functions.invoke("create-phonepe-payment", {
        body: {
          user_id: userData.id,
          package_id: 'custom',
          amount: amount,
          credits: credits,
          package_name: packageName,
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

          toast({
            title: "Redirecting to Payment",
            description: "You'll be redirected to PhonePe to complete your payment.",
          });

          setPurchasing(false);
          onOpenChange(false);
        } else {
          // Desktop: Use IFRAME mode
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

                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }

              setPurchasing(false);
            },
          });

          onOpenChange(false);
          setPurchasing(false);
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
      setPurchasing(false);
    }
  };

  const PackagesContent = () => (
    <div className="w-full space-y-6 px-2 md:px-4">
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            Balance: {userData?.credit_balance || 0} credits
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-primary">Purchase Tests</h3>
        <p className="text-sm text-muted-foreground">₹100 per test • No subscription required</p>
      </div>

      {/* Quantity Selector Card */}
      <Card className="glass-effect border-2 border-primary/20">
        <CardContent className="p-6 space-y-6">
          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => setQuantity(Math.max(MIN_QUANTITY, quantity - 1))}
              disabled={quantity <= MIN_QUANTITY || purchasing}
            >
              <Minus className="h-5 w-5" />
            </Button>

            <div className="text-center min-w-[120px]">
              <div className="text-5xl font-bold text-primary">{quantity}</div>
              <div className="text-sm text-muted-foreground mt-1">
                test{quantity > 1 ? 's' : ''}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))}
              disabled={quantity >= MAX_QUANTITY || purchasing}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex justify-center gap-2 flex-wrap">
            {[1, 3, 5, 10].map((num) => (
              <Button
                key={num}
                variant={quantity === num ? "default" : "outline"}
                size="sm"
                onClick={() => setQuantity(num)}
                disabled={purchasing}
              >
                {num} {num === 1 ? 'Test' : 'Tests'}
              </Button>
            ))}
          </div>

          {/* Total Price */}
          <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-4xl font-bold text-primary">
              ₹{quantity * PRICE_PER_TEST}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              for {quantity} test{quantity > 1 ? 's' : ''} ({quantity * CREDITS_PER_TEST} credits)
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Credits never expire • Use them anytime, forever
            </div>
          </div>

          {/* Buy Button */}
          <Button
            className="w-full h-12 text-base font-bold"
            variant="hero"
            onClick={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Buy Now 🔥
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Trust Footer */}
      <div className="text-center space-y-2 pt-4 border-t border-border/50">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>100% Secure Payment • UPI, Cards, Net Banking</span>
        </div>
        <p className="text-xs text-muted-foreground">
          12,000+ Officers Trained • Trusted Payment Gateway
        </p>
      </div>
    </div>
  );

  // Render mobile drawer or desktop dialog
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] px-0 pb-6">
          <DrawerHeader className="text-left px-4 pb-2">
            <DrawerTitle className="flex items-center gap-2 text-xl">
              <Coins className="h-5 w-5 text-primary" />
              Purchase Tests
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-0 pb-safe">
            <PackagesContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-primary" />
            Purchase Tests
          </DialogTitle>
        </DialogHeader>
        <PackagesContent />
      </DialogContent>
    </Dialog>
  );
};