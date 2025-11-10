import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, User, BookOpen, Award, CheckCircle, ArrowRight, Brain, Target, TrendingUp, Image, BarChart3, Clock, MessageCircle, Calendar, Shield, Zap, ThumbsUp, ThumbsDown, CheckSquare, Sparkles, Users, Trophy } from "lucide-react";
import heroImage from "@/assets/army-hero.jpeg";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";
const SSBInterview = () => {
  const navigate = useNavigate();
  const {
    isSignedIn,
    user
  } = useUser();
  const {
    signOut
  } = useClerk();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  useEffect(() => {
    // Show sticky bar after scrolling 50% of page instead of intrusive popup
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollPercent = (scrolled / (docHeight - windowHeight)) * 100;
      
      setShowStickyBar(scrollPercent > 20);
    };
    
    // Show welcome dialog on exit intent instead of immediate popup
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isSignedIn) {
        setShowWelcomeDialog(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isSignedIn]);
  
  const ssbSection = useScrollAnimation({
    threshold: 0.2
  });
  const tatSection = useScrollAnimation({
    threshold: 0.2
  });
  const olqsSection = useScrollAnimation({
    threshold: 0.2
  });
  const featuresSection = useScrollAnimation({
    threshold: 0.2
  });
  const guidelinesSection = useScrollAnimation({
    threshold: 0.2
  });
  const strategySection = useScrollAnimation({
    threshold: 0.2
  });
  const ssbProcess = [{
    day: "Day 1",
    title: "Screening",
    content: "OIR & PPDT",
    icon: Shield
  }, {
    day: "Day 2",
    title: "Psychology Tests",
    content: "TAT, WAT, SRT, SD",
    highlight: true,
    icon: Brain
  }, {
    day: "Day 3",
    title: "GTO Tasks",
    content: "Group Testing",
    icon: Target
  }, {
    day: "Day 4",
    title: "Interview",
    content: "Personal Interview",
    icon: MessageCircle
  }, {
    day: "Day 5",
    title: "Conference",
    content: "Final Assessment",
    icon: Award
  }];
  const olqs = ["Effective Intelligence", "Reasoning Ability", "Organizing Ability", "Power of Expression", "Social Adjustment", "Cooperation", "Sense of Responsibility", "Initiative", "Self Confidence", "Speed of Decision", "Influence Group", "Liveliness", "Determination", "Courage", "Stamina"];
  const platformFeatures = [{
    icon: Image,
    title: "Authentic TAT Practice",
    description: "Military-themed images similar to actual SSB. Practice with 30-second viewing and 4-minute writing time limits."
  }, {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Get instant feedback on your stories. Our AI detects OLQs, analyzes themes, and provides improvement suggestions."
  }, {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Monitor improvement over time, identify weak OLQs, build consistency, and boost confidence before SSB."
  }];
  const dos = [{
    text: "Start with clear setting and characters"
  }, {
    text: "Show proactive decision-making"
  }, {
    text: "Include positive resolution"
  }, {
    text: "Demonstrate leadership and teamwork"
  }, {
    text: "Keep it realistic and relatable"
  }, {
    text: "Complete story within time"
  }];
  const donts = [{
    text: "Avoid negative/tragic endings"
  }, {
    text: "Don't leave stories incomplete"
  }, {
    text: "Avoid passive characters"
  }, {
    text: "Don't make unrealistic stories"
  }, {
    text: "Avoid violence or crime themes"
  }, {
    text: "Don't copy common templates"
  }];
  const prepStrategy = [{
    week: "Week 1-2",
    focus: "Understand TAT Basics",
    icon: BookOpen
  }, {
    week: "Week 3-4",
    focus: "Daily Practice (2-3 stories/day)",
    icon: Target
  }, {
    week: "Week 5-6",
    focus: "Analyze Feedback & Improve",
    icon: BarChart3
  }, {
    week: "Week 7-8",
    focus: "Timed Practice (Exam Conditions)",
    icon: Clock
  }, {
    week: "Final Week",
    focus: "Build Confidence with Mock Tests",
    icon: Award
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-effect backdrop-blur-lg sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center" style={{background: 'var(--gradient-hero)'}}>
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <Link to="/" className="text-lg md:text-xl font-extrabold text-foreground hover:text-primary transition-colors font-display">
              TAT Pro 🎯
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Button onClick={() => window.open('https://wa.link/1mj98f', '_blank')} variant="outline" size="sm" className="gap-2 min-h-[40px] hidden sm:flex">
              <MessageCircle className="h-4 w-4" />
              <span>Help</span>
            </Button>
            
            {!isSignedIn ? <div className="flex items-center gap-2">
                <Link to="/auth/signin" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="min-h-[40px]">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm" className="px-4 md:px-6 font-bold min-h-[40px] shadow-action">
                    START FREE 🚀
                  </Button>
                </Link>
              </div> : <div className="flex items-center gap-2 md:gap-4">
                <Button onClick={() => navigate("/dashboard/pending")} variant="default" className="min-h-[40px]">Dashboard</Button>
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
                  <DropdownMenuContent className="w-56" align="end">
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
              </div>}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 animate-gradient opacity-70" style={{background: 'var(--gradient-hero)'}}></div>
          <div className="absolute inset-0 opacity-5 bg-cover bg-center" style={{
          backgroundImage: `url(${heroImage})`
        }}></div>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <Badge className="mb-6 md:mb-8 px-4 md:px-8 py-2 md:py-3 text-sm md:text-base glass-effect border-primary/30 font-bold animate-pulse-glow" variant="outline">
                <Trophy className="h-4 w-4 mr-2 inline" />
                12,000+ Future Officers Training Here • Join The Elite 🎖️
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 text-white leading-tight font-display">
                CRUSH YOUR SSB TAT
                <span className="block bg-gradient-to-r from-accent via-secondary to-champion-gold bg-clip-text text-transparent mt-2 md:mt-3">
                  Like A Champion 🔥
                </span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
                Get AI-Powered Instant Feedback on Day 2 TAT Tests. Master The Psychology Game & Dominate Your SSB Selection Board. 💪
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 md:mb-12">
                {!isSignedIn ? <Link to="/auth/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto px-8 md:px-12 py-6 md:py-7 text-lg md:text-xl font-black shadow-action hover:scale-105 transition-all min-h-[56px] md:min-h-[64px] animate-pulse-glow">
                      START FREE NOW 🚀
                      <ArrowRight className="h-6 w-6 ml-2" />
                    </Button>
                  </Link> : <Button size="lg" className="px-8 md:px-12 py-6 md:py-7 text-lg md:text-xl font-black hover:scale-105 transition-all min-h-[56px] md:min-h-[64px]" onClick={() => navigate("/dashboard/pending")}>
                    GO TO DASHBOARD
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>}
              </div>
              
              {/* Trust indicators */}
              <div className="glass-effect border border-white/20 rounded-2xl p-4 md:p-6 mb-10 md:mb-16 max-w-xl mx-auto">
                <p className="text-white font-semibold text-sm md:text-base flex items-center justify-center gap-2 flex-wrap">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Free Forever</span>
                  <span className="text-white/50">•</span>
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>No Payment Required</span>
                  <span className="text-white/50">•</span>
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Instant Access</span>
                </p>
              </div>
              
              {/* Stats - Gamified */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
                <div className="glass-effect border border-white/20 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3" style={{background: 'var(--gradient-success)'}}>
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-xl md:text-3xl font-black text-white">Day 2</div>
                  <div className="text-xs md:text-sm text-white/70 font-semibold">SSB Test Day</div>
                </div>
                <div className="glass-effect border border-white/20 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3" style={{background: 'var(--gradient-action)'}}>
                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-xl md:text-3xl font-black text-white">30 Sec</div>
                  <div className="text-xs md:text-sm text-white/70 font-semibold">Per Image</div>
                </div>
                <div className="glass-effect border border-white/20 rounded-2xl p-4 md:p-6 hover:scale-105 transition-all">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3" style={{background: 'var(--gradient-champion)'}}>
                    <Image className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-xl md:text-3xl font-black text-white">11-12</div>
                  <div className="text-xs md:text-sm text-white/70 font-semibold">TAT Images</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SSB Process Section */}
        <section className="py-16 bg-muted/30" ref={ssbSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
                  Service Selection Board
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Understanding the SSB Interview Process
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  The 5-day Service Selection Board interview is your gateway to becoming an officer in the Indian Armed Forces. 
                  TAT is a crucial component of Day 2 Psychology Tests.
                </p>
              </div>

              {/* 5-Day Timeline */}
              <div className="relative">
                {/* Progress Line - Desktop */}
                <div className="hidden md:block absolute top-[80px] left-0 right-0 h-1 bg-border mx-auto" style={{
                width: 'calc(100% - 120px)',
                marginLeft: '60px'
              }}>
                  <div className="h-full bg-gradient-to-r from-primary via-primary to-primary w-[40%] animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 relative">
                  {ssbProcess.map((day, index) => <div key={index} className="relative">
                      {/* Connector Dot */}
                      <div className={`hidden md:flex absolute top-[68px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 z-10 transition-all duration-500 ${day.highlight ? 'bg-primary border-primary shadow-lg shadow-primary/50 scale-110 animate-pulse' : 'bg-background border-border'}`}>
                        {day.highlight && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>}
                      </div>
                      
                      <Card 
                        onClick={() => navigate("/dashboard/pending")}
                        className={`text-center transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${day.highlight ? 'border-2 border-primary bg-primary/5 shadow-lg' : 'border border-border hover:border-primary/50'} ${ssbSection.isVisible ? 'animate-fade-in' : 'opacity-0'}`} 
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: "both"
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className={`mx-auto mb-3 transition-transform duration-300 ${day.highlight ? 'scale-110' : ''}`}>
                            <day.icon className={`h-10 w-10 mx-auto mb-2 transition-colors duration-300 ${day.highlight ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} style={{
                          animationDuration: '2s'
                        }} />
                          </div>
                          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-2 transition-all duration-300 ${day.highlight ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                            {day.day}
                          </div>
                          <CardTitle className="text-base">{day.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{day.content}</p>
                        </CardContent>
                      </Card>
                      
                      {/* Mobile connector arrow */}
                      {index < ssbProcess.length - 1 && <div className="md:hidden flex justify-center py-2">
                          <ArrowRight className={`h-6 w-6 ${day.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>}
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TAT Details Section */}
        <section className="py-16 bg-background" ref={tatSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    TAT in SSB: What You Need to Know
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      When & Format
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Conducted on <strong>Day 2</strong> of SSB (Psychology Tests)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>11-12 ambiguous images</strong> shown sequentially</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>30 seconds</strong> to view each image</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>4 minutes</strong> to write your story</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      What Assessors Look For
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Positive themes and constructive endings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Decision-making ability in stories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Leadership qualities and problem-solving</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Social responsibility and teamwork</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Emotional stability and maturity</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-destructive" />
                    Common Challenges Candidates Face
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Time pressure (only 4 minutes per story)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Image className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Interpreting ambiguous military-themed images</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Maintaining consistency in character traits</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Avoiding negative or passive stories</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OLQs Section */}
        <section className="py-16 bg-muted/30" ref={olqsSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  15 Officer Like Qualities (OLQs) Assessed
                </h3>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  TAT reveals these personality traits through your story themes. Understanding OLQs helps you craft better narratives.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {olqs.map((olq, index) => <div key={index} className="bg-card border border-primary/20 rounded-lg p-4 text-center hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">{olq}</p>
                  </div>)}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-16 bg-background" ref={featuresSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                How This Platform Helps You Prepare
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to master TAT and ace your SSB Day 2 Psychology Tests
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {platformFeatures.map((feature, index) => <Card key={index} className="border-primary/20 hover:border-primary hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-background via-accent/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <Badge className="mb-4 bg-champion-gold/10 text-champion-gold-foreground border-champion-gold/20 font-bold px-4 py-2" variant="outline">
                ⭐ Real Success Stories
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground leading-tight font-display">
                Future Officers Crushing Their TAT 💪
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands who transformed their SSB preparation with our platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12">
              {/* Testimonial 1 */}
              <Card className="glass-effect border-primary/20 hover:scale-105 transition-all duration-300 shadow-glow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      R
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Rahul Sharma</h4>
                      <p className="text-sm text-muted-foreground">NDA Recommended 🎖️</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-champion-gold text-lg">⭐</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    "This platform is a game-changer! Got recommended in my first attempt. The AI analysis helped me understand exactly what assessors look for. 10/10 would recommend! 🔥"
                  </p>
                </CardContent>
              </Card>

              {/* Testimonial 2 */}
              <Card className="glass-effect border-accent/20 hover:scale-105 transition-all duration-300 shadow-glow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-bold text-lg">
                      P
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Priya Kaur</h4>
                      <p className="text-sm text-muted-foreground">AFCAT Selected ✈️</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-champion-gold text-lg">⭐</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    "Improved my TAT scores by 40% in just 2 weeks! The instant feedback is insane. Best investment in my SSB prep journey. Absolutely crushing it now! 💯"
                  </p>
                </CardContent>
              </Card>

              {/* Testimonial 3 */}
              <Card className="glass-effect border-secondary/20 hover:scale-105 transition-all duration-300 shadow-glow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-lg">
                      V
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Vikram Singh</h4>
                      <p className="text-sm text-muted-foreground">CDS Cleared 🏆</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-champion-gold text-lg">⭐</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    "From confused to confident in 30 days! The scientific approach with Murray's needs framework gave me real insights. Worth every minute! 🚀"
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trust indicators */}
            <div className="glass-effect rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-primary/20">
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-6 w-6 text-primary" />
                    <p className="text-3xl md:text-4xl font-black text-primary">12K+</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-semibold">Active Users</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-6 w-6 text-accent" />
                    <p className="text-3xl md:text-4xl font-black text-accent">96%</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-semibold">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-6 w-6 text-secondary" />
                    <p className="text-3xl md:text-4xl font-black text-secondary">4.9/5</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-semibold">Rating ⭐</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines Section */}
        <section className="py-16 bg-muted/30" ref={guidelinesSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  What Makes a Good TAT Story for SSB?
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Practical guidelines to help you write compelling stories that showcase positive OLQs
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* DO's */}
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <ThumbsUp className="h-6 w-6" />
                      DO's - Follow These
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {dos.map((item, index) => <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item.text}</span>
                        </li>)}
                    </ul>
                  </CardContent>
                </Card>

                {/* DON'Ts */}
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <ThumbsDown className="h-6 w-6" />
                      DON'Ts - Avoid These
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {donts.map((item, index) => <li key={index} className="flex items-start gap-3">
                          <CheckSquare className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item.text}</span>
                        </li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Preparation Strategy */}
        <section className="py-16 bg-background" ref={strategySection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Your SSB TAT Preparation Strategy
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Follow this proven 8-week preparation plan to build confidence and master TAT
                </p>
              </div>

              <div className="space-y-4 mb-12">
                {prepStrategy.map((step, index) => <Card key={index} className="border-primary/20 hover:border-primary hover:scale-105 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <step.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <Badge className="mb-2">{step.week}</Badge>
                          <CardTitle className="text-lg">{step.focus}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>)}
              </div>

              <div className="text-center">
                <div className="bg-card border-2 border-primary/20 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Ready to Start Your SSB TAT Preparation?
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Join thousands of SSB aspirants who are mastering TAT with AI-powered feedback and comprehensive practice
                  </p>
                  
                  {!isSignedIn ? <Link to="/auth/signup">
                      <Button size="lg" className="px-8">
                        Start Free Practice Today <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link> : <Button size="lg" className="px-8" onClick={() => navigate("/dashboard/pending")}>
                      Go to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">TAT Assessment</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted platform for SSB TAT preparation with AI-powered analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about-tat" className="hover:text-primary transition-colors">About TAT</Link></li>
                <li><Link to="/ssb-procedure" className="hover:text-primary transition-colors">SSB Procedure</Link></li>
                <li><Link to="/dashboard/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <button onClick={() => window.open('https://wa.link/1mj98f', '_blank')} className="hover:text-primary transition-colors">
                    WhatsApp Support
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TAT Assessment. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-lg glass-effect border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black flex items-center gap-2 font-display">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              Wait! Before You Go... 🎯
            </DialogTitle>
            <DialogDescription className="text-base pt-4 space-y-4">
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-xl p-5">
                <p className="font-bold text-foreground mb-3 text-lg">
                  🚀 Start Your Officer Journey TODAY - FREE!
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Instant AI Analysis</strong> on your TAT stories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Join 12,000+ aspirants</strong> crushing their prep</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>96% success rate</strong> in SSB selections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>FREE forever</strong> • No payment required</span>
                  </li>
                </ul>
              </div>
              <p className="text-center text-sm text-muted-foreground italic">
                ⏰ Don't let another day pass without proper TAT preparation!
              </p>
            </DialogDescription>
          </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <Button
                size="lg"
                className="font-black text-lg shadow-action hover:scale-105 transition-all min-h-[56px] animate-pulse-glow"
                onClick={() => {
                  setShowWelcomeDialog(false);
                  navigate("/auth/signup");
                }}
              >
                YES! MAKE ME A TAT EXPERT 🔥
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWelcomeDialog(false)}
                className="text-xs"
              >
                I'll browse more (not recommended)
              </Button>
            </div>
        </DialogContent>
      </Dialog>
      
      {/* Sticky Bottom CTA Bar - Mobile Optimized */}
      {showStickyBar && !isSignedIn && (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-primary/30 shadow-2xl animate-slide-in-up">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-bold text-foreground truncate">
                  🎯 12,000+ Officers Training Now
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Start your FREE TAT practice today!
                </p>
              </div>
              <Link to="/auth/signup">
                <Button 
                  size="sm" 
                  className="px-4 md:px-6 py-5 md:py-6 font-black shadow-action hover:scale-105 transition-all whitespace-nowrap text-sm md:text-base"
                >
                  JOIN FREE 🚀
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>;
};
export default SSBInterview;