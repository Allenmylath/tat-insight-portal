import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LogOut,
  User,
  BookOpen,
  Award,
  CheckCircle,
  ArrowRight,
  Brain,
  Target,
  TrendingUp,
  Image,
  BarChart3,
  Clock,
  MessageCircle,
  Calendar,
  Shield,
  ThumbsUp,
  ThumbsDown,
  CheckSquare,
  Sparkles,
  Users,
  Trophy,
  Star,
  Flame,
  Eye,
  Play,
  UserPlus,
  Lightbulb,
  Crosshair,
  AlertTriangle,
} from "lucide-react";
import heroImage from "@/assets/army-hero.jpeg";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";

const SSBInterview = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeUsers, setActiveUsers] = useState(847);
  const [recentSignups, setRecentSignups] = useState(23);

  useEffect(() => {
    // Simulate real-time active users
    const userInterval = setInterval(() => {
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 8000);

    // Simulate recent signups counter
    const signupInterval = setInterval(() => {
      setRecentSignups((prev) => Math.min(prev + 1, 50));
    }, 15000);

    // Show sticky bar after scrolling 20% of page
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollPercent = (scrolled / (docHeight - windowHeight)) * 100;

      setShowStickyBar(scrollPercent > 15);
    };

    // Exit intent for mobile (when user scrolls up rapidly at top)
    let lastScrollY = window.scrollY;
    const handleExitIntent = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100 && lastScrollY > currentScrollY && !isSignedIn) {
        setShowWelcomeDialog(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleExitIntent);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleExitIntent);
      clearInterval(userInterval);
      clearInterval(signupInterval);
    };
  }, [isSignedIn]);

  const ssbSection = useScrollAnimation({
    threshold: 0.2,
  });
  const tatSection = useScrollAnimation({
    threshold: 0.2,
  });
  const featuresSection = useScrollAnimation({
    threshold: 0.2,
  });
  const guidelinesSection = useScrollAnimation({
    threshold: 0.2,
  });
  const strategySection = useScrollAnimation({
    threshold: 0.2,
  });

  const ssbProcess = [
    {
      day: "Day 1",
      title: "Screening",
      content: "OIR & PPDT",
      icon: Shield,
    },
    {
      day: "Day 2",
      title: "Psychology Tests",
      content: "TAT, WAT, SRT, SD",
      highlight: true,
      icon: Brain,
    },
    {
      day: "Day 3",
      title: "GTO Tasks",
      content: "Group Testing",
      icon: Target,
    },
    {
      day: "Day 4",
      title: "Interview",
      content: "Personal Interview",
      icon: MessageCircle,
    },
    {
      day: "Day 5",
      title: "Conference",
      content: "Final Assessment",
      icon: Award,
    },
  ];

  const workflowSteps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Sign Up Free",
      description: "Create your free account in 30 seconds. No payment required.",
    },
    {
      number: "2",
      icon: Image,
      title: "Take TAT Test",
      description: "Practice with authentic military-themed TAT images. 30-second viewing, 4-minute writing.",
    },
    {
      number: "3",
      icon: Brain,
      title: "Get AI Analysis",
      description: "Instant psychological analysis using Murray's TAT framework. Understand your personality patterns.",
    },
    {
      number: "4",
      icon: MessageCircle,
      title: "Receive Personalized SSB Questions",
      description: "Get 6-8 interview questions tailored to YOUR psychological profile. Know exactly what interviewers will ask based on your TAT responses.",
      highlight: true,
      proBadge: true,
    },
  ];

  const platformFeatures = [
    {
      icon: Image,
      title: "Authentic TAT Practice",
      description:
        "Military-themed images similar to actual SSB. Practice with 30-second viewing and 4-minute writing time limits.",
      benefit: "Feel confident on exam day",
    },
    {
      icon: Brain,
      title: "Murray's Psychological Analysis",
      description:
        "Get scientific analysis using Henry Murray's TAT framework - the same method used in actual SSB. Understand your needs, presses, and inner states that interviewers will probe.",
      benefit: "Deep insights, not just OLQ scoring",
    },
    {
      icon: Crosshair,
      title: "Personalized SSB Interview Prep",
      description:
        "Pro members get 6-8 personalized SSB questions for every TAT test. Practice answers before the real interview.",
      benefit: "Know your questions in advance",
      proBadge: true,
    },
  ];

  const dos = [
    {
      text: "Start with clear setting and characters",
    },
    {
      text: "Show proactive decision-making",
    },
    {
      text: "Include positive resolution",
    },
    {
      text: "Demonstrate leadership and teamwork",
    },
    {
      text: "Keep it realistic and relatable",
    },
    {
      text: "Complete story within time",
    },
  ];

  const donts = [
    {
      text: "Avoid negative/tragic endings",
    },
    {
      text: "Don't leave stories incomplete",
    },
    {
      text: "Avoid passive characters",
    },
    {
      text: "Don't make unrealistic stories",
    },
    {
      text: "Avoid violence or crime themes",
    },
    {
      text: "Don't copy common templates",
    },
  ];

  const prepStrategy = [
    {
      week: "Week 1-2",
      focus: "Understand TAT Basics",
      icon: BookOpen,
    },
    {
      week: "Week 3-4",
      focus: "Daily Practice (2-3 stories/day)",
      icon: Target,
    },
    {
      week: "Week 5-6",
      focus: "Analyze Feedback & Improve",
      icon: BarChart3,
    },
    {
      week: "Week 7-8",
      focus: "Timed Practice (Exam Conditions)",
      icon: Clock,
    },
    {
      week: "Final Week",
      focus: "Mock Tests & Review Personalized SSB Questions (Pro)",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <header className="border-b glass-effect backdrop-blur-lg sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gradient-hero)" }}
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <Link
              to="/"
              className="text-base sm:text-lg md:text-xl font-extrabold text-foreground hover:text-primary transition-colors font-display"
            >
              TAT Pro 🎯
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <Button
              onClick={() => window.open("https://wa.link/1mj98f", "_blank")}
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm"
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Help</span>
            </Button>

            {!isSignedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link to="/auth/signin" className="hidden xs:block">
                  <Button variant="ghost" size="sm" className="h-8 sm:h-9 md:h-10 px-2 sm:px-3 text-xs sm:text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button
                    size="sm"
                    className="px-3 sm:px-4 md:px-6 font-bold h-8 sm:h-9 md:h-10 shadow-action text-xs sm:text-sm"
                  >
                    START FREE 🚀
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <Button
                  onClick={() => navigate("/dashboard/pending")}
                  variant="default"
                  size="sm"
                  className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 text-xs sm:text-sm"
                >
                  Dashboard
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                          {user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || "U"}
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
        {/* Hero Section - Redesigned for Mobile */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
          {/* Animated gradient background */}
          <div
            className="absolute inset-0 animate-gradient opacity-70"
            style={{ background: "var(--gradient-hero)" }}
          ></div>
          <div
            className="absolute inset-0 opacity-5 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`,
            }}
          ></div>

          {/* Floating elements */}
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-16 sm:w-20 h-16 sm:h-20 bg-accent/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-24 sm:w-32 h-24 sm:h-32 bg-primary/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Live Activity Badge - Mobile Optimized */}
              <Badge
                className="mb-4 sm:mb-6 md:mb-8 px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base bg-white/20 backdrop-blur-md border-2 border-white/40 font-bold animate-pulse-glow inline-flex items-center gap-2 text-white shadow-xl"
                variant="outline"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 animate-pulse drop-shadow-lg" />
                  <span className="hidden xs:inline drop-shadow-lg">
                    <span className="text-orange-300 font-black">{activeUsers}</span> Officers Training Now
                  </span>
                  <span className="xs:hidden text-orange-300 font-black drop-shadow-lg">{activeUsers} Live</span>
                  <span className="hidden sm:inline">•</span>
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 drop-shadow-lg" />
                  <span className="text-green-300 font-black drop-shadow-lg">{recentSignups}</span>
                  <span className="hidden sm:inline drop-shadow-lg">joined today</span>
                  <span className="sm:hidden drop-shadow-lg">today</span>
                </div>
              </Badge>

              {/* Main Headline - Mobile First */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 md:mb-8 text-white leading-[1.1] sm:leading-tight font-display">
                <span className="block">CRUSH YOUR</span>
                <span className="block mt-1 sm:mt-2">SSB TAT 🔥</span>
                <span className="block bg-gradient-to-r from-accent via-secondary to-champion-gold bg-clip-text text-transparent mt-1.5 sm:mt-2 md:mt-3 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                  Like A Champion
                </span>
              </h1>

              {/* Subheadline - Concise for Mobile */}
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed font-medium px-2">
                <span className="hidden sm:inline">Get AI-Powered Instant Feedback on Day 2 TAT Tests. </span>
                Master The Psychology Game & <span className="text-accent font-bold">Dominate Your SSB</span> 💪
              </p>

              {/* CTA Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0">
                {!isSignedIn ? (
                  <>
                    <Link to="/auth/signup" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-6 sm:px-8 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl font-black shadow-action hover:scale-105 transition-all animate-pulse-glow"
                      >
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                        START FREE NOW 🚀
                      </Button>
                    </Link>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-bold bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white/30 hover:border-white hover:scale-105 transition-all shadow-lg"
                      onClick={() => {
                        document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      See How It Works
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 md:px-12 py-6 md:py-7 text-lg md:text-xl font-black hover:scale-105 transition-all"
                    onClick={() => navigate("/dashboard/pending")}
                  >
                    GO TO DASHBOARD
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                )}
              </div>

              {/* Trust indicators - Compact for Mobile */}
              <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-8 sm:mb-10 md:mb-16 max-w-xl mx-auto shadow-xl">
                <p className="text-white font-semibold text-xs sm:text-sm md:text-base flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap drop-shadow-lg">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 drop-shadow-md" />
                  <span>Free Forever</span>
                  <span className="text-white/70 hidden xs:inline">•</span>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 drop-shadow-md" />
                  <span className="hidden xs:inline">No Payment</span>
                  <span className="xs:hidden">Free</span>
                  <span className="text-white/70 hidden sm:inline">•</span>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 drop-shadow-md" />
                  <span>Instant Access</span>
                </p>
              </div>

              {/* Stats - Mobile Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 max-w-3xl mx-auto px-2">
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-all shadow-xl">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2 md:mb-3 shadow-lg"
                    style={{ background: "var(--gradient-success)" }}
                  >
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-3xl font-black text-white drop-shadow-lg">Day 2</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-white/90 font-semibold drop-shadow-md">
                    SSB Test
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-all shadow-xl">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2 md:mb-3 shadow-lg"
                    style={{ background: "var(--gradient-action)" }}
                  >
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-3xl font-black text-white drop-shadow-lg">30 Sec</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-white/90 font-semibold drop-shadow-md">
                    Per Image
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-all shadow-xl">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2 md:mb-3 shadow-lg"
                    style={{ background: "var(--gradient-champion)" }}
                  >
                    <Image className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-3xl font-black text-white drop-shadow-lg">11-12</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-white/90 font-semibold drop-shadow-md">
                    Images
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Workflow Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <Badge
                className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 font-bold px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                variant="outline"
              >
                ⚡ How It Works
              </Badge>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-foreground leading-tight font-display px-2">
                From Signup to <span className="text-primary">SSB Success</span> 🎯
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Your complete journey to cracking the SSB interview
              </p>
            </div>

            {/* Workflow Cards */}
            <div className="max-w-6xl mx-auto">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
                {/* Connection Line - Desktop Only */}
                <div className="hidden lg:block absolute top-[80px] left-0 right-0 h-1 bg-border mx-auto" style={{ width: "calc(100% - 120px)", marginLeft: "60px" }}>
                  <div className="h-full bg-gradient-to-r from-primary via-accent to-champion-gold w-full"></div>
                </div>

                {workflowSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <Card className={`text-center transition-all duration-500 hover:scale-105 hover:shadow-xl ${step.highlight ? "border-2 border-primary bg-gradient-to-br from-primary/10 via-accent/5 to-background shadow-glow" : "border border-border hover:border-primary/50"}`}>
                      <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-6">
                        {/* Step Number Badge */}
                        <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mx-auto mb-2 sm:mb-3 font-black text-sm sm:text-base ${step.highlight ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground"}`}>
                          {step.number}
                        </div>
                        
                        {/* Icon */}
                        <div className="mx-auto mb-2 sm:mb-3">
                          <step.icon className={`h-8 w-8 sm:h-10 sm:w-10 mx-auto ${step.highlight ? "text-primary" : "text-muted-foreground"}`} />
                        </div>

                        {/* Title with Pro Badge */}
                        <CardTitle className="text-sm sm:text-base md:text-lg mb-2 flex items-center justify-center gap-2 flex-wrap">
                          <span>{step.title}</span>
                          {step.proBadge && (
                            <Badge className="bg-champion-gold/10 text-champion-gold-foreground border-champion-gold/30 text-[10px] px-2 py-0.5">
                              PRO
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3 sm:pb-4">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Mobile Arrow */}
                    {index < workflowSteps.length - 1 && (
                      <div className="sm:hidden flex justify-center py-2">
                        <ArrowRight className={`h-5 w-5 ${step.highlight ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA below workflow */}
              {!isSignedIn && (
                <div className="text-center mt-8 sm:mt-12">
                  <Link to="/auth/signup">
                    <Button size="lg" className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-black shadow-action hover:scale-105 transition-all">
                      Start Your Journey - FREE 🚀
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Deep Dive - SSB Questions Feature (THE MOAT) */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-background via-champion-gold/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-8 sm:mb-12">
                <Badge className="mb-3 sm:mb-4 bg-champion-gold/10 text-champion-gold-foreground border-champion-gold/30 font-bold px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" variant="outline">
                  🎯 Our Competitive Advantage
                </Badge>
                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-foreground leading-tight font-display px-2">
                  Why Personalized SSB Questions Are Your <span className="bg-gradient-to-r from-primary via-accent to-champion-gold bg-clip-text text-transparent">Secret Weapon</span> 🎯
                </h2>
              </div>

              {/* The Problem */}
              <Card className="border-red-500/30 bg-red-500/5 mb-6 sm:mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-lg sm:text-xl">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                    The Problem with Generic SSB Prep
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm sm:text-base text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">❌</span>
                    <span>SSB Interviewers probe psychological patterns revealed in YOUR TAT stories</span>
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">❌</span>
                    <span>Generic interview prep won't help - they'll ask questions specific to YOUR responses</span>
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">❌</span>
                    <span>Most candidates are blindsided by unexpected questions targeting their weaknesses</span>
                  </p>
                </CardContent>
              </Card>

              {/* Our Solution */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-background shadow-glow mb-6 sm:mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary text-lg sm:text-xl md:text-2xl">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    Our Solution: AI-Powered Personalized Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <p className="text-sm sm:text-base md:text-lg text-foreground font-semibold">
                    Our AI analyzes your TAT story and predicts 6-8 questions interviewers are likely to ask YOU based on your psychological profile.
                  </p>
                  
                  <div className="space-y-3">
                    <p className="font-semibold text-foreground text-sm sm:text-base">Each question comes with:</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Psychological basis</strong> (why they're asking)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">What they're listening for</strong></span>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Follow-up questions</strong> if you're evasive</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Preparation tips</strong> for strong answers</span>
                      </div>
                    </div>
                  </div>

                  {/* Example */}
                  <div className="bg-background border-2 border-primary/20 rounded-xl p-4 sm:p-6 space-y-3">
                    <Badge className="bg-accent/10 text-accent-foreground border-accent/30 text-xs">Example</Badge>
                    
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <strong className="text-foreground">Your TAT Story revealed:</strong> "Tendency to seek external validation"
                      </p>
                      
                      <div className="bg-primary/5 border-l-4 border-primary p-3 sm:p-4 rounded space-y-2">
                        <p className="font-semibold text-foreground text-sm sm:text-base">
                          Predicted SSB Question:
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground italic">
                          "Tell me about a time when you had to make a difficult decision without consulting others."
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <strong className="text-accent">Why this question:</strong> The interviewer wants to test if you can demonstrate independent decision-making or if you rely too heavily on others' opinions.
                      </p>
                      
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <strong className="text-secondary">What to prepare:</strong> Think of specific examples showing autonomous decision-making with positive outcomes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Upgrade CTA */}
              <Card className="border-2 border-champion-gold/30 bg-gradient-to-br from-champion-gold/10 via-primary/5 to-background shadow-glow">
                <CardHeader className="text-center">
                  <Badge className="mx-auto mb-3 bg-champion-gold/20 text-champion-gold-foreground border-champion-gold/40 font-bold px-4 py-2 text-sm">
                    ⭐ PRO FEATURE
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-black mb-2">
                    Get Personalized SSB Questions
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Available with Pro Membership - ₹500/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3 text-center">
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="text-2xl sm:text-3xl font-black text-primary mb-1">6-8</div>
                      <p className="text-xs text-muted-foreground">Questions Per Test</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="text-2xl sm:text-3xl font-black text-accent mb-1">∞</div>
                      <p className="text-xs text-muted-foreground">Unlimited Tests</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="text-2xl sm:text-3xl font-black text-secondary mb-1">24/7</div>
                      <p className="text-xs text-muted-foreground">Priority Analysis</p>
                    </div>
                  </div>

                  {!isSignedIn ? (
                    <div className="space-y-2">
                      <Link to="/auth/signup">
                        <Button size="lg" className="w-full px-6 py-6 text-base sm:text-lg font-black shadow-action">
                          Start Free & Upgrade to Pro 🚀
                        </Button>
                      </Link>
                      <p className="text-xs text-center text-muted-foreground">Free trial available • Upgrade anytime</p>
                    </div>
                  ) : (
                    <Link to="/dashboard/pricing">
                      <Button size="lg" className="w-full px-6 py-6 text-base sm:text-lg font-black shadow-action">
                        Upgrade to Pro - ₹500/month 🚀
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof Section - NEW - Moved Up */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-background via-accent/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <Badge
                className="mb-3 sm:mb-4 bg-champion-gold/10 text-champion-gold-foreground border-champion-gold/20 font-bold px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                variant="outline"
              >
                ⭐ Real Success Stories
              </Badge>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-foreground leading-tight font-display px-2">
                Future Officers <span className="text-primary">Crushing TAT</span> 💪
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Join thousands transforming their SSB prep
              </p>
            </div>

            {/* Testimonials - Mobile Optimized Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
              {/* Testimonial 1 */}
              <Card className="glass-effect border-primary/20 hover:scale-105 transition-all duration-300 shadow-glow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                      R
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground text-sm sm:text-base truncate">Rahul Sharma</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">NDA Recommended 🎖️</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-champion-gold text-champion-gold" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                    "Game-changer! Got recommended in first attempt. The AI analysis showed me exactly what assessors
                    look for. 10/10! 🔥"
                  </p>
                </CardContent>
              </Card>

              {/* Testimonial 2 */}
              <Card className="glass-effect border-accent/20 hover:scale-105 transition-all duration-300 shadow-glow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                      P
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground text-sm sm:text-base truncate">Priya Kaur</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">AFCAT Selected ✈️</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-champion-gold text-champion-gold" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                    "Improved TAT scores by 40% in just 2 weeks! Instant feedback is insane. Best investment in my SSB
                    prep! 💯"
                  </p>
                </CardContent>
              </Card>

              {/* Testimonial 3 */}
              <Card className="glass-effect border-secondary/20 hover:scale-105 transition-all duration-300 shadow-glow sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                      V
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground text-sm sm:text-base truncate">Vikram Singh</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">CDS Cleared 🏆</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-champion-gold text-champion-gold" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                    "From confused to confident in 30 days! Scientific approach with Murray's framework gave me real
                    insights. Worth it! 🚀"
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trust indicators - Mobile Stack */}
            <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto border border-primary/20">
              <div className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-16">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">12K+</p>
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-semibold">Active Users</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-accent">96%</p>
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-semibold">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary">4.9/5</p>
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-semibold">Rating ⭐</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features - With Benefits */}
        <section className="py-12 sm:py-16 bg-background" ref={featuresSection.ref} id="demo-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
              <Badge
                className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                variant="outline"
              >
                ⚡ Platform Features
              </Badge>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-foreground px-2 leading-tight">
                Everything You Need To <span className="text-primary">Master TAT</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                Ace your SSB Day 2 Psychology Tests with confidence
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
              {platformFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className={`hover:shadow-xl hover:scale-105 transition-all duration-300 group ${feature.proBadge ? "border-2 border-champion-gold/30 bg-gradient-to-br from-champion-gold/5 to-background" : "border-primary/20 hover:border-primary"}`}
                >
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors ${feature.proBadge ? "bg-champion-gold/10" : "bg-primary/10"}`}>
                      <feature.icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${feature.proBadge ? "text-champion-gold-foreground" : "text-primary"}`} />
                    </div>
                    <CardTitle className="text-base sm:text-lg md:text-xl text-foreground mb-2 flex items-center justify-center gap-2 flex-wrap">
                      <span>{feature.title}</span>
                      {feature.proBadge && (
                        <Badge className="bg-champion-gold/10 text-champion-gold-foreground border-champion-gold/30 text-[10px] px-2 py-0.5">
                          PRO
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant="outline" className={`text-[10px] sm:text-xs border-accent/30 ${feature.proBadge ? "text-champion-gold-foreground bg-champion-gold/5" : "text-accent"}`}>
                      {feature.benefit}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground leading-relaxed text-xs sm:text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick CTA */}
            {!isSignedIn && (
              <div className="text-center">
                <Link to="/auth/signup">
                  <Button
                    size="lg"
                    className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-black shadow-action hover:scale-105 transition-all"
                  >
                    Start Practicing Now - FREE 🚀
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* SSB Process Section - Compact for Mobile */}
        <section className="py-12 sm:py-16 bg-muted/30" ref={ssbSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <Badge
                  className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  variant="outline"
                >
                  📋 SSB Interview
                </Badge>
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-foreground px-2 leading-tight">
                  Understanding The <span className="text-primary">5-Day Process</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
                  TAT is crucial on Day 2 Psychology Tests
                </p>
              </div>

              {/* 5-Day Timeline - Mobile Optimized */}
              <div className="relative">
                {/* Progress Line - Hidden on Mobile */}
                <div
                  className="hidden lg:block absolute top-[80px] left-0 right-0 h-1 bg-border mx-auto"
                  style={{
                    width: "calc(100% - 120px)",
                    marginLeft: "60px",
                  }}
                >
                  <div className="h-full bg-gradient-to-r from-primary via-primary to-primary w-[40%] animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-4 relative">
                  {ssbProcess.map((day, index) => (
                    <div key={index} className="relative">
                      {/* Connector Dot - Desktop Only */}
                      <div
                        className={`hidden lg:flex absolute top-[68px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 z-10 transition-all duration-500 ${day.highlight ? "bg-primary border-primary shadow-lg shadow-primary/50 scale-110 animate-pulse" : "bg-background border-border"}`}
                      >
                        {day.highlight && (
                          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>
                        )}
                      </div>

                      <Card
                        onClick={() => navigate("/dashboard/pending")}
                        className={`text-center transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${day.highlight ? "border-2 border-primary bg-primary/5 shadow-lg" : "border border-border hover:border-primary/50"} ${ssbSection.isVisible ? "animate-fade-in" : "opacity-0"}`}
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: "both",
                        }}
                      >
                        <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                          <div
                            className={`mx-auto mb-2 sm:mb-3 transition-transform duration-300 ${day.highlight ? "scale-110" : ""}`}
                          >
                            <day.icon
                              className={`h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-1.5 sm:mb-2 transition-colors duration-300 ${day.highlight ? "text-primary animate-bounce" : "text-muted-foreground"}`}
                              style={{
                                animationDuration: "2s",
                              }}
                            />
                          </div>
                          <div
                            className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 transition-all duration-300 ${day.highlight ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                          >
                            {day.day}
                          </div>
                          <CardTitle className="text-sm sm:text-base">{day.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3 sm:pb-4">
                          <p className="text-xs sm:text-sm text-muted-foreground">{day.content}</p>
                          {day.highlight && (
                            <Badge className="mt-2 bg-primary/10 text-primary border-primary/30 text-[10px]">
                              This is where our platform helps you shine ⭐
                            </Badge>
                          )}
                        </CardContent>
                      </Card>

                      {/* Mobile connector arrow */}
                      {index < ssbProcess.length - 1 && index % 2 === 0 && (
                        <div className="xs:hidden flex justify-center py-1.5">
                          <ArrowRight
                            className={`h-5 w-5 ${day.highlight ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TAT Details Section - Streamlined */}
        <section className="py-12 sm:py-16 bg-background" ref={tatSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-primary/5 border border-primary/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                    TAT in SSB: What You Need To Know
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      When & Format
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          On <strong>Day 2</strong> of SSB
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          <strong>11-12 images</strong> shown
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          <strong>30 seconds</strong> to view
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          <strong>4 minutes</strong> to write
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      What Assessors Look For
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Positive themes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Decision-making ability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Leadership qualities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Social responsibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Emotional stability</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />
                    Common Challenges
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Time pressure (4 minutes)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Ambiguous military images</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Maintaining consistency</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Avoiding negative stories</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Guidelines Section - Simplified */}
        <section className="py-12 sm:py-16 bg-background" ref={guidelinesSection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-foreground px-2 leading-tight">
                  What Makes A <span className="text-primary">Good TAT Story?</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
                  Guidelines to showcase positive OLQs
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* DO's */}
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400 text-base sm:text-lg">
                      <ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6" />
                      DO's - Follow These
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 sm:space-y-3">
                      {dos.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-xs sm:text-sm">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* DON'Ts */}
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-base sm:text-lg">
                      <ThumbsDown className="h-5 w-5 sm:h-6 sm:w-6" />
                      DON'Ts - Avoid These
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 sm:space-y-3">
                      {donts.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-xs sm:text-sm">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Preparation Strategy - Compact */}
        <section className="py-12 sm:py-16 bg-muted/30" ref={strategySection.ref}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-foreground px-2 leading-tight">
                  Your <span className="text-primary">8-Week Prep Plan</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
                  Proven strategy to master TAT
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                {prepStrategy.map((step, index) => (
                  <Card
                    key={index}
                    className="border-primary/20 hover:border-primary hover:scale-105 transition-all duration-300"
                  >
                    <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge className="mb-1 sm:mb-2 text-[10px] xs:text-xs">{step.week}</Badge>
                          <CardTitle className="text-sm sm:text-base md:text-lg leading-tight">{step.focus}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <div className="bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                  <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground leading-tight px-2">
                    Ready To Start Your TAT Prep?
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-6 max-w-2xl mx-auto px-2">
                    Join thousands mastering TAT with AI-powered feedback
                  </p>

                  {!isSignedIn ? (
                    <Link to="/auth/signup">
                      <Button
                        size="lg"
                        className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-black shadow-action hover:scale-105 transition-all"
                      >
                        Start Free Practice Today <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="lg"
                      className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-black"
                      onClick={() => navigate("/dashboard/pending")}
                    >
                      Go to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-muted/30 border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-base sm:text-lg text-foreground">TAT Assessment</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your trusted platform for SSB TAT preparation with AI-powered analysis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-foreground text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link to="/tat-methodology" className="hover:text-primary transition-colors">
                    TAT Methodology
                  </Link>
                </li>
                <li>
                  <Link to="/ssb-procedure" className="hover:text-primary transition-colors">
                    SSB Procedure
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-foreground text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-primary transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-primary transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-foreground text-sm sm:text-base">Contact</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <button
                    onClick={() => window.open("https://wa.link/1mj98f", "_blank")}
                    className="hover:text-primary transition-colors text-left"
                  >
                    WhatsApp Support
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TAT Assessment. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Welcome Dialog - Mobile Enhanced */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg glass-effect border-primary/30 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg xs:text-xl sm:text-2xl font-black flex items-start gap-2 font-display leading-tight pr-8">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse flex-shrink-0 mt-0.5" />
              <span className="break-words">Wait! Before You Go... 🎯</span>
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base pt-2 sm:pt-3 space-y-3 sm:space-y-4">
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-5">
                <p className="font-bold text-foreground mb-2 sm:mb-3 text-sm xs:text-base sm:text-lg break-words">
                  🚀 Start Your Officer Journey TODAY - FREE!
                </p>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <CheckCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      <strong>Instant AI Analysis</strong> on your stories
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <CheckCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      <strong>Join 12,000+ aspirants</strong> crushing prep
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <CheckCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      <strong>96% success rate</strong> in SSB
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <CheckCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      <strong>FREE forever</strong> • No payment
                    </span>
                  </li>
                </ul>
              </div>
              <p className="text-center text-[10px] xs:text-xs sm:text-sm text-muted-foreground italic break-words px-2">
                ⏰ Don't let another day pass without proper TAT prep!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:gap-3 mt-3 sm:mt-4">
            <Button
              size="lg"
              className="font-black text-xs xs:text-sm sm:text-base md:text-lg shadow-action hover:scale-105 transition-all h-11 xs:h-12 sm:h-14 w-full whitespace-normal leading-tight px-3 sm:px-4"
              onClick={() => {
                setShowWelcomeDialog(false);
                navigate("/auth/signup");
              }}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                <span>YES! MAKE ME A TAT EXPERT</span>
                <span className="flex items-center gap-1">
                  🔥 <ArrowRight className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                </span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWelcomeDialog(false)}
              className="text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 w-full"
            >
              I'll browse more (not recommended)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Bottom CTA Bar - Enhanced Mobile */}
      {showStickyBar && !isSignedIn && (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-primary/30 shadow-2xl animate-slide-in-up">
          <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 md:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs xs:text-sm sm:text-base font-bold text-foreground truncate flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 animate-pulse flex-shrink-0" />
                  <span className="hidden xs:inline">🎯 {activeUsers}+ Training Now</span>
                  <span className="xs:hidden">🎯 {activeUsers} Live</span>
                </p>
                <p className="text-[10px] xs:text-xs text-muted-foreground hidden sm:block">
                  Start your FREE TAT practice today!
                </p>
              </div>
              <Link to="/auth/signup">
                <Button
                  size="sm"
                  className="px-3 xs:px-4 sm:px-6 py-4 sm:py-5 md:py-6 font-black shadow-action hover:scale-105 transition-all whitespace-nowrap text-xs xs:text-sm sm:text-base"
                >
                  <span className="hidden xs:inline">JOIN FREE 🚀</span>
                  <span className="xs:hidden">START 🚀</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SSBInterview;
