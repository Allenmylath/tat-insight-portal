import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, BookOpen, Award, CheckCircle, ArrowRight, Brain, Target, TrendingUp, Image, BarChart3, Clock, MessageCircle, Calendar, Shield, Zap, ThumbsUp, ThumbsDown, CheckSquare } from "lucide-react";
import heroImage from "@/assets/army-hero.jpeg";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const SSBInterview = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  
  const [showSSBDialog, setShowSSBDialog] = useState(false);

  const ssbSection = useScrollAnimation({ threshold: 0.2 });
  const tatSection = useScrollAnimation({ threshold: 0.2 });
  const olqsSection = useScrollAnimation({ threshold: 0.2 });
  const featuresSection = useScrollAnimation({ threshold: 0.2 });
  const guidelinesSection = useScrollAnimation({ threshold: 0.2 });
  const strategySection = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    const timer = setTimeout(() => setShowSSBDialog(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const ssbProcess = [
    { day: "Day 1", title: "Screening", content: "OIR & PPDT", icon: Shield },
    { day: "Day 2", title: "Psychology Tests", content: "TAT, WAT, SRT, SD", highlight: true, icon: Brain },
    { day: "Day 3", title: "GTO Tasks", content: "Group Testing", icon: Target },
    { day: "Day 4", title: "Interview", content: "Personal Interview", icon: MessageCircle },
    { day: "Day 5", title: "Conference", content: "Final Assessment", icon: Award }
  ];

  const olqs = [
    "Effective Intelligence", "Reasoning Ability", "Organizing Ability",
    "Power of Expression", "Social Adjustment", "Cooperation",
    "Sense of Responsibility", "Initiative", "Self Confidence",
    "Speed of Decision", "Influence Group", "Liveliness",
    "Determination", "Courage", "Stamina"
  ];

  const platformFeatures = [
    {
      icon: Image,
      title: "Authentic TAT Practice",
      description: "Military-themed images similar to actual SSB. Practice with 30-second viewing and 4-minute writing time limits."
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get instant feedback on your stories. Our AI detects OLQs, analyzes themes, and provides improvement suggestions."
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Monitor improvement over time, identify weak OLQs, build consistency, and boost confidence before SSB."
    }
  ];

  const dos = [
    { text: "Start with clear setting and characters" },
    { text: "Show proactive decision-making" },
    { text: "Include positive resolution" },
    { text: "Demonstrate leadership and teamwork" },
    { text: "Keep it realistic and relatable" },
    { text: "Complete story within time" }
  ];

  const donts = [
    { text: "Avoid negative/tragic endings" },
    { text: "Don't leave stories incomplete" },
    { text: "Avoid passive characters" },
    { text: "Don't make unrealistic stories" },
    { text: "Avoid violence or crime themes" },
    { text: "Don't copy common templates" }
  ];

  const prepStrategy = [
    { week: "Week 1-2", focus: "Understand TAT Basics", icon: BookOpen },
    { week: "Week 3-4", focus: "Daily Practice (2-3 stories/day)", icon: Target },
    { week: "Week 5-6", focus: "Analyze Feedback & Improve", icon: BarChart3 },
    { week: "Week 7-8", focus: "Timed Practice (Exam Conditions)", icon: Clock },
    { week: "Final Week", focus: "Build Confidence with Mock Tests", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dialog */}
      <Dialog open={showSSBDialog} onOpenChange={setShowSSBDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              SSB Interview Preparation
            </DialogTitle>
            <DialogDescription className="text-base pt-4 space-y-4">
              <p className="font-semibold text-foreground">Preparing for your SSB Interview?</p>
              <p>TAT (Thematic Apperception Test) is a crucial component of the SSB psychological assessment. Master it with our scientifically-designed practice platform!</p>
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
                  <Button size="lg" className="w-full">
                    Start Practice <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth/signin" className="w-full">
                  <Button size="lg" variant="outline" className="w-full">Sign In</Button>
                </Link>
              </>
            ) : (
              <Button className="w-full" size="lg" onClick={() => navigate("/dashboard")}>
                Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              TAT Assessment
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              onClick={() => window.open('https://wa.link/1mj98f', '_blank')} 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Contact Us</span>
            </Button>
            
            {!isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/auth/signin">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <Button onClick={() => navigate("/dashboard")} variant="default">Dashboard</Button>
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
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5"></div>
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center" 
            style={{ backgroundImage: `url(${heroImage})` }}
          ></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-8 px-6 py-3 text-lg bg-primary text-primary-foreground shadow-lg font-semibold" variant="default">
                Master SSB Day 2 TAT • Join 10,000+ SSB Aspirants
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Ace Your SSB Interview
                <span className="block text-primary mt-2">Master the Thematic Apperception Test</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                TAT is Part of Day 2 Psychology Tests in SSB. Practice with AI-Powered Feedback & Build Confidence for Army, Navy, and Air Force Selection.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                {!isSignedIn ? (
                  <Link to="/auth/signup">
                    <Button size="lg" className="px-8 py-6 text-lg">
                      Start TAT Practice <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" className="px-8 py-6 text-lg" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-lg" 
                  onClick={() => navigate("/ssb-procedure")}
                >
                  Learn About SSB
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">Day 2</div>
                  <div className="text-sm text-muted-foreground">SSB Day</div>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">30 Seconds</div>
                  <div className="text-sm text-muted-foreground">Time Per Image</div>
                </div>
                <div className="text-center">
                  <Image className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">11-12 TAT</div>
                  <div className="text-sm text-muted-foreground">Total Images</div>
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
                <div className="hidden md:block absolute top-[80px] left-0 right-0 h-1 bg-border mx-auto" style={{ width: 'calc(100% - 120px)', marginLeft: '60px' }}>
                  <div className="h-full bg-gradient-to-r from-primary via-primary to-primary w-[40%] animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 relative">
                  {ssbProcess.map((day, index) => (
                    <div key={index} className="relative">
                      {/* Connector Dot */}
                      <div className={`hidden md:flex absolute top-[68px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 z-10 transition-all duration-500 ${
                        day.highlight 
                          ? 'bg-primary border-primary shadow-lg shadow-primary/50 scale-110 animate-pulse' 
                          : 'bg-background border-border'
                      }`}>
                        {day.highlight && (
                          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>
                        )}
                      </div>
                      
                      <Card 
                        className={`text-center transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                          day.highlight 
                            ? 'border-2 border-primary bg-primary/5 shadow-lg' 
                            : 'border border-border hover:border-primary/50'
                        } ${ssbSection.isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                        style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
                      >
                        <CardHeader className="pb-3">
                          <div className={`mx-auto mb-3 transition-transform duration-300 ${day.highlight ? 'scale-110' : ''}`}>
                            <day.icon className={`h-10 w-10 mx-auto mb-2 transition-colors duration-300 ${
                              day.highlight ? 'text-primary animate-bounce' : 'text-muted-foreground'
                            }`} style={{ animationDuration: '2s' }} />
                          </div>
                          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-2 transition-all duration-300 ${
                            day.highlight 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}>
                            {day.day}
                          </div>
                          <CardTitle className="text-base">{day.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{day.content}</p>
                        </CardContent>
                      </Card>
                      
                      {/* Mobile connector arrow */}
                      {index < ssbProcess.length - 1 && (
                        <div className="md:hidden flex justify-center py-2">
                          <ArrowRight className={`h-6 w-6 ${day.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                      )}
                    </div>
                  ))}
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
                {olqs.map((olq, index) => (
                  <div 
                    key={index} 
                    className="bg-card border border-primary/20 rounded-lg p-4 text-center hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">{olq}</p>
                  </div>
                ))}
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
              {platformFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-primary/20 hover:border-primary hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
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
                </Card>
              ))}
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
                      {dos.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item.text}</span>
                        </li>
                      ))}
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
                      {donts.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckSquare className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item.text}</span>
                        </li>
                      ))}
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
                {prepStrategy.map((step, index) => (
                  <Card 
                    key={index} 
                    className="border-primary/20 hover:border-primary hover:scale-105 transition-all duration-300"
                  >
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
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <div className="bg-card border-2 border-primary/20 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Ready to Start Your SSB TAT Preparation?
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Join thousands of SSB aspirants who are mastering TAT with AI-powered feedback and comprehensive practice
                  </p>
                  
                  {!isSignedIn ? (
                    <Link to="/auth/signup">
                      <Button size="lg" className="px-8">
                        Start Free Practice Today <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button size="lg" className="px-8" onClick={() => navigate("/dashboard")}>
                      Go to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}
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
                  <button 
                    onClick={() => window.open('https://wa.link/1mj98f', '_blank')}
                    className="hover:text-primary transition-colors"
                  >
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
    </div>
  );
};

export default SSBInterview;