import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

interface ProPricingCardProps {
  onUpgrade: () => void;
}

export const ProPricingCard = ({ onUpgrade }: ProPricingCardProps) => {
  const features = [
    "SSB Interview Questions for every test",
    "Unlimited TAT tests",
    "Advanced psychological analytics",
    "Priority support",
    "Expert consultation access"
  ];

  return (
    <Card className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-primary">RECOMMENDED</Badge>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-2xl">Pro Monthly</CardTitle>
        <CardDescription>
          Everything you need for SSB preparation
        </CardDescription>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">₹899</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Only ₹29.97 per day</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          size="lg" 
          className="w-full"
          onClick={onUpgrade}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Upgrade to Pro
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Join 500+ Pro members preparing for SSB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
