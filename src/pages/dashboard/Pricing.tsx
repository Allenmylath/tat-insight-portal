import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Users, BarChart3, Coins } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useState } from "react";
import { CreditPurchaseModal } from "@/components/CreditPurchaseModal";
import { ProPricingCard } from "@/components/ProPricingCard";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";

const Pricing = () => {
  const { userData, isPro } = useUserData();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<'subscription' | 'credits'>('subscription');

  const creditPackages = [
    {
      name: "Basic Pack",
      credits: 100,
      price: "₹100",
      testsIncluded: 1,
      description: "Perfect for trying out TAT analysis",
      features: [
        "100 Credits",
        "1 Complete TAT Test",
        "Detailed personality analysis",
        "Professional report",
        "Email support",
        "Credits never expire"
      ],
      buttonText: "Buy Credits",
      popular: false,
      pricePerTest: "₹100/test"
    },
    {
      name: "Value Pack",
      credits: 500,
      price: "₹500",
      testsIncluded: 5,
      description: "Great value for multiple assessments",
      features: [
        "500 Credits",
        "5 Complete TAT Tests",
        "Advanced AI analysis",
        "Detailed personality insights",
        "Career compatibility reports",
        "Priority support",
        "Credits never expire"
      ],
      buttonText: "Buy Credits",
      popular: true,
      pricePerTest: "₹100/test"
    },
    {
      name: "Bulk Pack",
      credits: 1000,
      price: "₹1000",
      testsIncluded: 10,
      description: "Best value for extensive psychological assessment",
      features: [
        "1000 Credits",
        "10 Complete TAT Tests",
        "Premium AI analysis",
        "Comprehensive reports",
        "Career & personality insights",
        "24/7 Priority support",
        "Credits never expire",
        "Best value per test"
      ],
      buttonText: "Buy Credits",
      popular: false,
      pricePerTest: "₹100/test",
      bestValue: true
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Pay Per Use",
      description: "Only pay for the tests you take - no monthly commitments"
    },
    {
      icon: Coins,
      title: "Credits Never Expire",
      description: "Your credits remain valid forever - use them whenever you need"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics", 
      description: "Deep psychological insights with AI-powered analysis"
    },
    {
      icon: Crown,
      title: "Professional Reports",
      description: "Comprehensive TAT analysis and personality assessment reports"
    }
  ];

  const currentBalance = userData?.credit_balance || 0;
  const testsAvailable = Math.floor(currentBalance / 100);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Subscribe for unlimited access or purchase credits for pay-per-use testing
        </p>
        
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            variant={viewMode === 'subscription' ? 'default' : 'outline'}
            onClick={() => setViewMode('subscription')}
          >
            Subscription
          </Button>
          <Button 
            variant={viewMode === 'credits' ? 'default' : 'outline'}
            onClick={() => setViewMode('credits')}
          >
            One-Time Credits
          </Button>
        </div>
      </div>

      {/* Current Credit Balance */}
      {userData && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Current Balance: {currentBalance} Credits
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testsAvailable > 0 
                      ? `You can take ${testsAvailable} test${testsAvailable > 1 ? 's' : ''}`
                      : "You need credits to take tests"
                    }
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowCreditModal(true)} className="bg-primary text-primary-foreground">
                Top Up Credits
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pro Subscription */}
      {viewMode === 'subscription' && !isPro && (
        <div className="max-w-md mx-auto">
          <ProPricingCard onUpgrade={() => setShowUpgradeModal(true)} />
        </div>
      )}

      {/* Credit Packages */}
      {viewMode === 'credits' && (
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {creditPackages.map((pack, index) => (
          <Card 
            key={index} 
            className={`shadow-elegant ${pack.popular ? 'border-primary ring-2 ring-primary/20' : ''} ${pack.bestValue ? 'border-accent ring-2 ring-accent/20' : ''}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  {pack.name}
                </CardTitle>
                {pack.popular && (
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                {pack.bestValue && (
                  <Badge className="bg-accent text-accent-foreground">
                    Best Value
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{pack.price}</span>
                  <span className="text-sm text-muted-foreground">({pack.pricePerTest})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{pack.credits} credits</span>
                  <span>•</span>
                  <span>{pack.testsIncluded} test{pack.testsIncluded > 1 ? 's' : ''}</span>
                </div>
                <CardDescription>{pack.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {pack.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={pack.popular ? "hero" : pack.bestValue ? "government" : "outline"}
                onClick={() => setShowCreditModal(true)}
              >
                {pack.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Benefits Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Why Choose Our Credit System?</h2>
          <p className="text-muted-foreground">
            Flexible, transparent pricing with no monthly commitments
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6 space-y-3">
                <benefit.icon className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-medium text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ or Contact */}
      <Card className="text-center">
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-foreground">Have Questions?</h3>
          <p className="text-sm text-muted-foreground">
            Our team is here to help you understand our credit system and choose the right package.
          </p>
          <Button variant="outline">Contact Support</Button>
        </CardContent>
      </Card>

      <CreditPurchaseModal 
        open={showCreditModal} 
        onOpenChange={setShowCreditModal} 
      />
      <ProUpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
      />
    </div>
  );
};

export default Pricing;