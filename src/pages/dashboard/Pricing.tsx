import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Users, BarChart3 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const Pricing = () => {
  const { isPro, userData } = useUserData();

  const plans = [
    {
      name: "Free Plan",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started with basic psychological assessments",
      features: [
        "3 Basic TAT Tests",
        "Basic personality analysis",
        "General feedback report",
        "Email support",
        "Progress tracking"
      ],
      limitations: [
        "Limited test selection",
        "Basic analysis only",
        "No detailed insights"
      ],
      buttonText: "Current Plan",
      popular: false,
      current: !isPro
    },
    {
      name: "Pro Plan",
      price: "₹299",
      period: "/month",
      description: "Comprehensive psychological assessment with detailed insights",
      features: [
        "All 7+ TAT Tests",
        "Advanced AI psychological analysis",
        "Detailed personality reports",
        "Career compatibility insights",
        "Emotional intelligence scoring",
        "Social dynamics assessment",
        "Personalized development plans",
        "Priority support",
        "Export reports (PDF)",
        "Progress analytics",
        "Retake tests unlimited"
      ],
      buttonText: isPro ? "Current Plan" : "Upgrade to Pro",
      popular: true,
      current: isPro
    }
  ];

  const benefits = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep psychological insights with AI-powered analysis"
    },
    {
      icon: Crown,
      title: "Premium Tests",
      description: "Access to advanced TAT scenarios and assessments"
    },
    {
      icon: Users,
      title: "Career Guidance",
      description: "Personalized career recommendations based on your profile"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive reports immediately after completion"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of psychological assessment with our comprehensive Pro plan. 
          Get detailed insights and personalized recommendations.
        </p>
      </div>

      {/* Current Plan Status */}
      {userData && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPro ? (
                  <Crown className="h-8 w-8 text-primary" />
                ) : (
                  <Star className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <h3 className="font-semibold text-foreground">
                    Current Plan: {isPro ? "Pro Member" : "Free Plan"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isPro 
                      ? userData.membership_expires_at 
                        ? `Expires on ${new Date(userData.membership_expires_at).toLocaleDateString()}`
                        : "Active membership"
                      : "Upgrade to unlock all features"
                    }
                  </p>
                </div>
              </div>
              {isPro && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Active
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`shadow-elegant ${plan.popular ? 'border-primary ring-1 ring-primary/20' : ''} ${plan.current ? 'bg-muted/30' : ''}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plan.name === "Pro Plan" ? (
                    <Crown className="h-5 w-5 text-primary" />
                  ) : (
                    <Star className="h-5 w-5 text-muted-foreground" />
                  )}
                  {plan.name}
                </CardTitle>
                {plan.popular && (
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">
                        • {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                className="w-full" 
                variant={plan.popular ? "hero" : plan.current ? "outline" : "government"}
                disabled={plan.current}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Why Upgrade to Pro?</h2>
          <p className="text-muted-foreground">
            Unlock advanced features and get the most comprehensive psychological assessment
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
            Our team is here to help you choose the right plan for your needs.
          </p>
          <Button variant="outline">Contact Support</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;