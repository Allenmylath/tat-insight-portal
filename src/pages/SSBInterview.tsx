import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, BookOpen, Award, CheckCircle, ArrowRight, Brain, Target, Clock, Users, Shield, Star, MessageCircle, ChevronRight } from "lucide-react";
import heroImage from "@/assets/army-hero.jpeg";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

const SSBInterview = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [showSSBDialog, setShowSSBDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSSBDialog(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const ssbStages = [
    { stage: "Stage I", tests: "OIR Test, PPDT", duration: "Day 1-2", icon: BookOpen },
    { stage: "Stage II", tests: "Psychology Tests (TAT, WAT, SRT, SD)", duration: "Day 3", icon: Brain },
    { stage: "Stage II", tests: "GTO Tasks (Group Testing)", duration: "Day 4-5", icon: Users },
    { stage: "Stage II", tests: "Personal Interview", duration: "Day 5", icon: MessageCircle },
  ];

  const tatImportance = [
    { title: "High Weightage", description: "TAT carries 25-30% of total psychology marks", icon: Award },
    { title: "Personality Assessment", description: "Reveals leadership, decision-making & emotional intelligence", icon: Brain },
    { title: "Most Challenging", description: "70% candidates struggle due to lack of practice", icon: Target },
    { title: "Practice Improves Scores", description: "Regular practice increases quality and speed significantly", icon: CheckCircle },
  ];

  const platformFeatures = [
    { title: "Authentic TAT Images", description: "Practice with actual SSB-style TAT pictures", icon: BookOpen },
    { title: "Timer-Based Tests", description: "Realistic 4-minute per image time constraints", icon: Clock },
    { title: "AI Analysis", description: "Get detailed feedback on your stories", icon: Brain },
    { title: "Progress Tracking", description: "Monitor improvement over time", icon: Target },
  ];

  const testimonials = [
    {
      name: "Capt. Rajesh Kumar",
      selection: "Selected - Army, 2023",
      text: "TAT practice on this platform helped me structure my thoughts better. The timer feature made me comfortable with the actual SSB pressure.",
      rating: 5
    },
    {
      name: "Lt. Priya Sharma",
      selection: "Selected - Navy, 2024",
      text: "The AI feedback was invaluable. It helped me understand what assessors look for in TAT stories. Highly recommended for serious aspirants.",
      rating: 5
    },
    {
      name: "Flt. Lt. Arjun Singh",
      selection: "Selected - Air Force, 2023",
      text: "After practicing 100+ TAT images here, I felt completely confident during my actual SSB. The practice made all the difference.",
      rating: 5
    },
  ];

  const otherResources = [
    { title: "PPDT Practice Tips", description: "Master Picture Perception & Discussion Test", icon: Users },
    { title: "WAT Guide", description: "Word Association Test strategies", icon: Brain },
    { title: "SRT Preparation", description: "Situation Reaction Test techniques", icon: Target },
    { title: "Interview Tips", description: "Personal interview preparation", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      <title>SSB Interview Preparation | TAT Practice & Complete Guide - TATTests.me</title>
      <meta name="description" content="Master your SSB interview with expert TAT practice, PPDT tips, and complete psychological test preparation. Join thousands clearing Services Selection Board exams." />

      {/* SSB Dialog */}
      <Dialog open={showSSBDialog} onOpenChange={setShowSSBDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              SSB Interview Preparation
            </DialogTitle>
            <DialogDescription className="text-base pt-4 space-y-4">
              <p className="font-semibold text-foreground">
                Preparing for your SSB Interview?
              </p>
              <p>
                TAT (Thematic Apperception Test) is a crucial component of the SSB psychological assessment. 
                Master it with our scientifically-designed practice platform!
              </p>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  ✓ Practice with authentic TAT images<br />
                  ✓ Get AI-powered analysis and feedback<br />
                  ✓ Understand scoring patterns<br />
                  ✓ Build confidence before your actual SSB
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            {!isSignedIn ? (
              <>
                <Link to="/auth/signup" className="w-full">
                  <Button className="w-full" size="lg" variant="hero">
                    Start Practice
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth/signin" className="w-full">
                  <Button className="w-full" size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Button className="w-full" size="lg" variant="hero" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-military rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TAT Pro</h1>
              <p className="text-xs text-muted-foreground">SSB Preparation</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button onClick={() => window.open('https://wa.link/1mj98f', '_blank')} variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </Button>
            
            {!isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/auth/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="hero" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <Button onClick={() => navigate("/dashboard")} variant="hero">
                  Dashboard
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut(() => navigate("/"))}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-8 px-6 py-3 text-lg bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 shadow-lg font-semibold" variant="outline">
                Complete SSB Interview Preparation Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Master Your 
                <span className="text-primary block">SSB Interview</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Ace all SSB psychological tests including TAT, PPDT, WAT, SRT & more. 
                Join 10,000+ aspirants preparing for Services Selection Board.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                {!isSignedIn ? (
                  <Link to="/auth/signup">
                    <Button size="lg" variant="hero" className="px-8 py-6 text-lg">
                      Start TAT Practice Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" variant="hero" className="px-8 py-6 text-lg" onClick={() => navigate("/dashboard")}>
                    Continue to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                )}
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg" onClick={() => window.open('https://wa.link/1mj98f', '_blank')}>
                  Talk to Expert
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>10,000+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>500+ Selections</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Trusted Since 2023</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SSB Overview Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Understanding the SSB Interview Process
              </h2>
              <p className="text-lg text-muted-foreground">
                The Services Selection Board interview is a 5-day comprehensive assessment designed to evaluate Officer Like Qualities (OLQs)
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {ssbStages.map((stage, index) => (
                  <Card key={index} className="shadow-elegant border-primary/10 hover:shadow-military transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-military rounded-lg flex items-center justify-center flex-shrink-0">
                          <stage.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{stage.stage}</CardTitle>
                          <CardDescription className="text-base font-semibold text-foreground">{stage.tests}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{stage.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-accent/30 p-8 rounded-lg border-l-4 border-primary">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Psychology Tests: The Critical Phase
                </h3>
                <p className="text-muted-foreground mb-4">
                  Stage II Psychology Tests, especially TAT, WAT, and SRT, are often the deciding factors in SSB selection. 
                  These tests reveal your personality, thought process, and suitability for officer roles in Armed Forces.
                </p>
                <p className="text-foreground font-semibold">
                  💡 Success Tip: Psychology tests require extensive practice. Most successful candidates spend 60-70% of their preparation time on these tests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why TAT Matters Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <Badge className="mb-6 px-4 py-2 bg-primary/20 text-primary border-primary/30" variant="outline">
                Most Critical Test
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                TAT: The Make-or-Break Test in SSB
              </h2>
              <p className="text-lg text-muted-foreground">
                Thematic Apperception Test is where most candidates lose valuable marks. Here's why mastering TAT is crucial for your selection.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
              {tatImportance.map((item, index) => (
                <Card key={index} className="shadow-elegant border-primary/10">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-saffron rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                        <CardDescription className="text-base">{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-elegant">
              <h3 className="text-2xl font-bold mb-4 text-center">What TAT Reveals About You</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground"><strong className="text-foreground">Leadership Qualities:</strong> Your ability to take charge in challenging situations</p>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground"><strong className="text-foreground">Decision-Making:</strong> How quickly and effectively you respond to ambiguous scenarios</p>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground"><strong className="text-foreground">Emotional Intelligence:</strong> Your empathy, motivation, and psychological maturity</p>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground"><strong className="text-foreground">Officer Like Qualities:</strong> Initiative, responsibility, and team spirit</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TAT Practice Platform Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Your Complete TAT Practice Solution
              </h2>
              <p className="text-lg text-muted-foreground">
                Practice like the real SSB with our comprehensive TAT training platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="shadow-elegant border-primary/10 hover:border-primary/30 transition-all duration-300 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-military rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="max-w-4xl mx-auto bg-gradient-military p-8 rounded-lg shadow-elegant text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your TAT Practice?</h3>
              <p className="text-white/90 mb-6 text-lg">
                Join thousands of aspirants who improved their TAT performance through dedicated practice
              </p>
              {!isSignedIn ? (
                <Link to="/auth/signup">
                  <Button size="lg" variant="saffron" className="px-8 py-6 text-lg">
                    Start Free Practice Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" variant="saffron" className="px-8 py-6 text-lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Success Stories from Selected Candidates
              </h2>
              <p className="text-lg text-muted-foreground">
                Real testimonials from officers who cleared SSB using our TAT practice platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="shadow-elegant border-primary/10">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-military text-white font-bold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <CardDescription className="text-sm">{testimonial.selection}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Other SSB Resources Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Complete SSB Preparation Resources
              </h2>
              <p className="text-lg text-muted-foreground">
                Beyond TAT, we cover the entire SSB ecosystem to ensure your complete preparation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {otherResources.map((resource, index) => (
                <Card key={index} className="shadow-elegant border-primary/10 hover:shadow-military transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 bg-gradient-navy rounded-lg flex items-center justify-center mx-auto mb-4">
                      <resource.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                More resources and guides coming soon...
              </p>
              <Button variant="outline" onClick={() => window.open('https://wa.link/1mj98f', '_blank')}>
                Get Notified
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                Ready to Crack Your SSB Interview?
              </h2>
              <p className="text-xl text-muted-foreground mb-4">
                Start with TAT Practice - The Most Critical Test
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Join 10,000+ serious aspirants preparing for Services Selection Board
              </p>
              
              {!isSignedIn ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/auth/signup">
                    <Button size="lg" variant="hero" className="px-8 py-6 text-lg">
                      Create Free Account
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg" onClick={() => window.open('https://wa.link/1mj98f', '_blank')}>
                    Talk to Expert
                    <MessageCircle className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <Button size="lg" variant="hero" className="px-8 py-6 text-lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              )}

              <div className="mt-12 pt-8 border-t">
                <p className="text-sm text-muted-foreground mb-4">What you get:</p>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Unlimited TAT Practice</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>AI-Powered Feedback</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-military rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">TAT Pro</p>
                  <p className="text-xs text-muted-foreground">SSB Preparation Platform</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Company:</strong> MYLATH HOLDINGS</p>
                <p><strong className="text-foreground">Email:</strong> support@tatpro.com</p>
                <p><strong className="text-foreground">Phone:</strong> +91 9605214280</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/about-tat" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  About TAT
                </Link>
                <Link to="/about-us" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
                <Link to="/privacy-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/refund-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
                <Link to="/terms-and-conditions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MYLATH HOLDINGS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SSBInterview;
