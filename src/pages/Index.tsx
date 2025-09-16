import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, CheckCircle, ArrowRight, Brain, Target, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";
import { AuthDebug } from "@/components/AuthDebug";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Scientific Assessment",
      description: "Evidence-based thematic apperception tests designed for SSC evaluation standards"
    },
    {
      icon: Target,
      title: "Targeted Preparation", 
      description: "Structured practice tests that mirror actual SSC psychological assessment patterns"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Detailed analytics and performance insights to track your improvement over time"
    }
  ];

  const stats = [
    { label: "Success Rate", value: "94%", icon: Award },
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Tests Completed", value: "50K+", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-saffron rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TAT Pro</h1>
              <p className="text-xs text-muted-foreground">SSC Assessment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button onClick={() => navigate("/dashboard")} variant="government">
                Dashboard
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          ></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" variant="outline">
                Official SSC TAT Preparation Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Master Your 
                <span className="text-primary block">Thematic Apperception Test</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Comprehensive TAT preparation designed specifically for SSC candidates. 
                Practice with authentic scenarios and get detailed performance insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="lg" variant="hero" className="px-8 py-6 text-lg">
                      Start Your Assessment
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Button 
                    size="lg" 
                    variant="hero" 
                    className="px-8 py-6 text-lg"
                    onClick={() => navigate("/dashboard")}
                  >
                    Continue Assessment
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </SignedIn>
                <Button size="lg" variant="government" className="px-8 py-6 text-lg">
                  Learn More
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built specifically for SSC candidates with features that matter most for your success
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-elegant border-primary/10 hover:shadow-saffron transition-all duration-300 hover:border-primary/30">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-saffron rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Ready to Excel in Your SSC Assessment?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of successful candidates who have improved their TAT performance with our comprehensive platform
              </p>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="lg" variant="hero" className="px-8 py-6 text-lg">
                    Get Started Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Button 
                  size="lg" 
                  variant="hero" 
                  className="px-8 py-6 text-lg"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </SignedIn>
            </div>
          </div>
        </section>

        {/* Debug Section - Remove this after testing */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <AuthDebug />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-saffron rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">TAT Pro</p>
                <p className="text-xs text-muted-foreground">SSC Assessment Platform</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2024 TAT Pro. Designed for SSC candidate success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
