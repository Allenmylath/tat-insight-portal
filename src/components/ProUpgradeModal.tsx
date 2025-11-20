import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProUpgradeModal = ({ open, onOpenChange }: ProUpgradeModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-pro-subscription', {
        body: {}
      });

      if (error) {
        console.error('Subscription error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.checkoutUrl) {
        // Redirect to PhonePe payment page
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      toast.error(err.message || 'Failed to initiate subscription. Please try again.');
      setLoading(false);
    }
  };

  const features = [
    { name: 'TAT Tests', free: '200 credits (one-time)', pro: 'Unlimited ✅' },
    { name: 'Basic Analysis', free: true, pro: true },
    { name: 'SSB Interview Questions', free: false, pro: true },
    { name: 'Advanced Analytics', free: false, pro: true },
    { name: 'Priority Support', free: false, pro: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Unlock Your Full Potential with Pro</DialogTitle>
          </div>
          <DialogDescription>
            Get personalized SSB interview questions and unlimited access to TAT tests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pricing Card */}
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Badge className="mb-2">MOST POPULAR</Badge>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">₹500<span className="text-lg font-normal text-muted-foreground">/month</span></h3>
                  <p className="text-sm text-muted-foreground">Only ₹16.67 per day</p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full mt-4"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Comparison */}
          <div>
            <h4 className="font-semibold mb-4 text-center">Compare Plans</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Feature</th>
                    <th className="text-center p-3 font-medium">Free</th>
                    <th className="text-center p-3 font-medium bg-primary/10">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 font-medium">{feature.name}</td>
                      <td className="p-3 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{feature.free}</span>
                        )}
                      </td>
                      <td className="p-3 text-center bg-primary/5">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{feature.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold mb-3">What You Get with Pro:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>6-8 Personalized SSB Questions</strong> for every TAT test based on your psychological profile</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited TAT Tests</strong> - Practice as much as you need without worrying about credits</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Advanced Analytics</strong> - Deeper insights into your personality patterns and traits</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Priority Support</strong> - Get help when you need it most</span>
              </li>
            </ul>
          </div>

          {/* Social Proof */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Join 500+ Pro members preparing for SSB</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
