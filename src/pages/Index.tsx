import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { BookOpen, Users, Award, CheckCircle, ArrowRight, Brain, Target, TrendingUp, Download, Microscope, GraduationCap, FileText, TestTube, MessageCircle } from "lucide-react";
import heroImage from "@/assets/army-hero.jpeg";
import henryMurrayImage from "@/assets/henry-murray.jpg";
import tatMethodologyImage from "@/assets/tat-methodology.jpg";
import psychodynamicAnalysisImage from "@/assets/psychodynamic-analysis.jpg";
import researchFrameworkImage from "@/assets/research-framework.jpg";
import { testPhonePeTokenGeneration } from "@/utils/testPhonePeToken";
import { toast } from "sonner";
const Index = () => {
  const navigate = useNavigate();
  const {
    isSignedIn,
    isLoaded,
    user
  } = useUser();
  const {
    signOut
  } = useClerk();
  const features = [{
    image: tatMethodologyImage,
    title: "Murray's TAT Methodology",
    description: "Based on Henry Murray's original Thematic Apperception Test framework developed at Harvard Psychological Clinic"
  }, {
    image: psychodynamicAnalysisImage,
    title: "Psychodynamic Analysis",
    description: "Deep psychological assessment through projective storytelling and personality dynamics evaluation"
  }, {
    image: researchFrameworkImage,
    title: "Research-Based Framework",
    description: "Grounded in decades of psychological research and validated assessment methodologies"
  }];
  const stats = [{
    label: "Research Foundation",
    value: "Since 1935",
    icon: Award
  }, {
    label: "Scientific Validity",
    value: "Harvard Clinic",
    icon: Users
  }, {
    label: "Psychological Depth",
    value: "Projective Analysis",
    icon: CheckCircle
  }];
  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/murray.pdf';
    link.download = 'murray-tat-research.pdf';
    link.click();
  };
  const testPhonePeFunction = async () => {
    toast.info("Testing PhonePe token generation...");
    const result = await testPhonePeTokenGeneration();
    if (result.success) {
      toast.success("PhonePe token generated successfully!");
      console.log("Token result:", result.data);
    } else {
      toast.error(`Error: ${result.error}`);
      console.error("Token error:", result.error);
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-gradient" style={{background: 'var(--gradient-hero)'}}>
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TAT Pro</h1>
              <p className="text-xs text-primary font-semibold">Elite SSB Prep 🎯</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="gap-2 hover:scale-105 transition-transform">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Blog</span>
              </Button>
            </Link>
            
            <Button onClick={() => window.open('https://wa.link/1mj98f', '_blank')} variant="outline" size="sm" className="gap-2 hover:scale-105 transition-transform">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </Button>
            
            {!isSignedIn ? <div className="flex items-center gap-2">
                <Link to="/auth/signin">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-3 sm:px-4 min-h-[40px]">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4 min-h-[40px] shadow-glow hover:scale-105 transition-transform">Join Now</Button>
                </Link>
              </div> : <div className="flex items-center gap-2 md:gap-4">
                <Button onClick={() => navigate("/dashboard/pending")} className="shadow-glow hover:scale-105 transition-transform" size="sm">
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
              </div>}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 animate-gradient" 
               style={{background: 'var(--gradient-hero)', backgroundSize: '200% 200%'}}></div>
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{
          backgroundImage: `url(${heroImage})`
        }}></div>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 px-4 py-2 text-sm md:text-base bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 font-semibold animate-pulse-glow" variant="outline">
                🎯 Elite TAT Preparation • 12,000+ Future Officers
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight">
                CRUSH YOUR 
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">SSB TAT LIKE A PRO</span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                Master the psychological edge. Train with AI-powered analysis based on proven TAT methodology. 
                Join thousands of future officers crushing their assessments. 💪
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                {!isSignedIn ? <Link to="/auth/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg font-bold shadow-action hover:scale-105 transition-all min-h-[56px]">
                      START FREE NOW 🚀
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link> : <Button size="lg" className="px-10 py-6 text-lg font-bold shadow-action hover:scale-105 transition-all min-h-[56px]" onClick={() => navigate("/dashboard/pending")}>
                    CONTINUE TRAINING
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>}
                
              </div>

              <p className="text-white/80 text-sm mb-12">✓ No credit card required • ✓ Instant access • ✓ Start in 30 seconds</p>
              
              {/* Gamified Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-3xl mx-auto">
                <div className="glass-effect p-4 md:p-6 rounded-2xl hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-5xl font-black text-white mb-2">12K+</div>
                  <div className="text-xs md:text-sm text-white/80 font-semibold">Officers Trained</div>
                </div>
                <div className="glass-effect p-4 md:p-6 rounded-2xl hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-5xl font-black text-white mb-2">96%</div>
                  <div className="text-xs md:text-sm text-white/80 font-semibold">Success Rate</div>
                </div>
                <div className="glass-effect p-4 md:p-6 rounded-2xl hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-5xl font-black text-white mb-2">#1</div>
                  <div className="text-xs md:text-sm text-white/80 font-semibold">TAT Platform</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Murray Foundation Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                <div>
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-semibold" variant="outline">
                    🎓 Harvard Research • Military-Proven Since WWII
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-foreground leading-tight">
                    Battle-Tested Psychology Meets Modern Tech
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                    Dr. Henry Murray developed the TAT at Harvard in 1935 - and it's been the secret weapon of military 
                    selection boards worldwide ever since. This isn't just theory - it's the REAL psychological framework 
                    that defense forces use to identify future leaders.
                  </p>
                  <div className="glass-effect p-6 rounded-2xl mb-6 border-l-4 border-primary hover:scale-105 transition-transform">
                    <h4 className="font-bold text-foreground mb-3 flex items-center gap-2 text-lg">
                      <Award className="h-6 w-6 text-primary" />
                      Why Military Organizations Trust TAT
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      For 80+ years, TAT has been the gold standard for assessing leadership potential, emotional intelligence, 
                      and decision-making under pressure. Used by SSB, NDA, AFCAT, and defense forces globally. 
                      <span className="font-semibold text-foreground"> Now YOU can master it.</span>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={downloadPDF} variant="outline" className="gap-2 hover:scale-105 transition-transform min-h-[48px]">
                      <Download className="h-5 w-5" />
                      Get Research PDF
                    </Button>
                    {!isSignedIn && (
                      <Link to="/auth/signup">
                        <Button className="gap-2 shadow-glow hover:scale-105 transition-transform min-h-[48px] w-full sm:w-auto">
                          Start Training Now
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
                  <img 
                    src={henryMurrayImage} 
                    alt="Dr. Henry Murray, founder of the Thematic Apperception Test" 
                    loading="eager"
                    decoding="async"
                    className="w-full max-w-sm mx-auto rounded-3xl shadow-float border-4 border-primary/30 hover:scale-105 transition-transform" 
                  />
                  <div className="mt-6 text-center glass-effect p-4 rounded-2xl max-w-sm mx-auto">
                    <p className="font-bold text-foreground text-lg">Dr. Henry Murray</p>
                    <p className="text-sm text-primary font-semibold">Harvard Psychological Clinic</p>
                    <p className="text-xs text-muted-foreground">TAT Creator • 1893-1988</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-foreground">
                Your Elite Training System 💪
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Proven methodology + AI analysis = Your unfair advantage in SSB selection
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => <Card key={index} className="shadow-glow border-primary/20 hover:scale-105 transition-all duration-300 glass-effect group">
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden mx-auto mb-4 shadow-float border-2 border-primary/20 group-hover:border-primary/50 transition-all">
                      <img 
                        src={feature.image} 
                        alt={feature.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      />
                    </div>
                    <CardTitle className="text-lg md:text-xl text-foreground font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground leading-relaxed text-sm md:text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20 font-semibold px-4 py-2" variant="outline">
                ⭐ 12,000+ Future Officers Trust Us
              </Badge>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-foreground leading-tight">
                Real Stories, Real Results 💪
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                See what other SSB aspirants are saying about their journey to excellence
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
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
                      <span key={i} className="text-champion-gold">⭐</span>
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
                      <span key={i} className="text-champion-gold">⭐</span>
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
                      <span key={i} className="text-champion-gold">⭐</span>
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
            <div className="mt-12 md:mt-16 text-center">
              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-primary">12,000+</p>
                  <p className="text-sm text-muted-foreground">Happy Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-accent">96%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-secondary">4.9/5</p>
                  <p className="text-sm text-muted-foreground">Rating ⭐</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research Methodology Section */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 opacity-50" style={{background: 'var(--gradient-card)'}}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-semibold" variant="outline">
                ⚡ AI-Powered Analysis • Real-Time Feedback
              </Badge>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-foreground leading-tight">
                Train Like An Elite, Score Like A Champion
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">
                Get instant psychological insights that military boards look for. No guesswork, just results. 🎯
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
              <Card className="glass-effect shadow-glow hover:scale-105 transition-all border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background: 'var(--gradient-success)'}}>
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold">Story Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center text-sm md:text-base">
                    AI breaks down your stories to reveal leadership traits, emotional intelligence, and officer-like qualities
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-effect shadow-glow hover:scale-105 transition-all border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background: 'var(--gradient-champion)'}}>
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold">Personality Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center text-sm md:text-base">
                    Understand your psychological profile like never before. Know your strengths, work on weaknesses
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass-effect shadow-glow hover:scale-105 transition-all border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background: 'var(--gradient-elite)'}}>
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold">Score Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center text-sm md:text-base">
                    Track your progress with every test. See real improvement with data-backed feedback and benchmarks
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center max-w-3xl mx-auto glass-effect p-8 md:p-12 rounded-3xl">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-foreground">
                Ready To Dominate Your SSB TAT? 🚀
              </h3>
              <p className="text-base md:text-lg text-muted-foreground mb-8">
                Join 12,000+ future officers who are crushing their preparation. Start training in 30 seconds - FREE.
              </p>
              
              {isLoaded && (
                !isSignedIn ? (
                  <Link to="/auth/signup" className="inline-block">
                    <Button size="lg" className="px-10 py-6 text-lg font-bold shadow-action hover:scale-105 transition-all min-h-[56px]">
                      START FREE NOW 🔥
                      <ArrowRight className="h-6 w-6 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" className="px-10 py-6 text-lg font-bold shadow-action hover:scale-105 transition-all min-h-[56px]" onClick={() => navigate("/dashboard/pending")}>
                    GO TO DASHBOARD
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                )
              )}
              
              <p className="text-sm text-muted-foreground mt-4">
                ✓ Free forever • ✓ No payment required • ✓ Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t glass-effect py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'var(--gradient-hero)'}}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">TAT Pro</p>
                  <p className="text-xs text-primary font-semibold">Elite SSB Prep Platform 🎯</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering 12,000+ future officers with AI-powered TAT training.
              </p>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Company:</strong> MYLATH HOLDINGS</p>
                <p><strong className="text-foreground">Email:</strong> support@tatpro.com</p>
                <p><strong className="text-foreground">Phone:</strong> +91 9605214280</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><a href="/about-us" className="hover:text-foreground transition-colors">About Us</a></p>
                <p><a href="/about-tat" className="hover:text-foreground transition-colors">About TAT</a></p>
                <p><a href="/5-day-ssb-interview-procedure" className="hover:text-foreground transition-colors">SSB Procedure</a></p>
                <p><a href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</a></p>
                <p><a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a></p>
                <p><a href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</a></p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              © 2024 TAT Pro by MYLATH HOLDINGS. Empowering future officers. 💪
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <a href="/privacy-policy" className="hover:text-primary transition-colors font-medium">Privacy</a>
              <a href="/refund-policy" className="hover:text-primary transition-colors font-medium">Refund</a>
              <a href="/terms-and-conditions" className="hover:text-primary transition-colors font-medium">Terms</a>
              <a href="/about-tat" className="hover:text-primary transition-colors font-medium">About</a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;