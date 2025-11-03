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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [showSSBDialog, setShowSSBDialog] = useState(false);
  useEffect(() => {
    // Show popup after 2 seconds on page load
    const timer = setTimeout(() => {
      setShowSSBDialog(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  const features = [{
    icon: Microscope,
    title: "Murray's TAT Methodology",
    description: "Based on Henry Murray's original Thematic Apperception Test framework developed at Harvard Psychological Clinic"
  }, {
    icon: Brain,
    title: "Psychodynamic Analysis",
    description: "Deep psychological assessment through projective storytelling and personality dynamics evaluation"
  }, {
    icon: GraduationCap,
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
  return <div className="min-h-screen bg-background">
      {/* SSB Dialog */}
      <Dialog open={showSSBDialog} onOpenChange={setShowSSBDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
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
            {!isSignedIn ? <>
                <Link to="/auth/signup" className="w-full">
                  <Button size="lg" variant="hero" className="w-full">
                    Start Practice
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth/signin" className="w-full">
                  
                </Link>
              </> : <Button className="w-full" size="lg" variant="hero" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-saffron rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-gradient-foreground" />
            </div>
            
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button onClick={() => window.open('https://wa.link/1mj98f', '_blank')} variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Contact Us</span>
            </Button>
            
            {!isSignedIn ? <div className="flex items-center gap-2">
                <Link to="/auth/signin">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="default" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                    Sign Up
                  </Button>
                </Link>
              </div> : <div className="flex items-center gap-2 md:gap-4">
                <Button onClick={() => navigate("/dashboard")} variant="government">
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
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{
          backgroundImage: `url(${heroImage})`
        }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-8 px-6 py-3 text-lg bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 shadow-lg font-semibold" variant="outline">
                Scientific TAT Assessment • Founded on Murray's Research
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Scientific 
                <span className="text-primary block">Thematic Apperception Analysis</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Advanced psychological assessment platform based on Henry Murray's original TAT methodology. 
                Experience evidence-based personality evaluation through projective storytelling techniques.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!isSignedIn ? <Link to="/auth/signup">
                    <Button size="lg" variant="hero" className="px-8 py-6 text-lg">
                      Start your TAT test
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link> : <Button size="lg" variant="hero" className="px-8 py-6 text-lg" onClick={() => navigate("/dashboard")}>
                    Continue Assessment
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>}
                <Button size="lg" variant="government" className="px-8 py-6 text-lg" onClick={() => navigate("/about-tat")}>
                  Learn More
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                {stats.map((stat, index) => <div key={index} className="text-center">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>)}
              </div>
            </div>
          </div>
        </section>

        {/* Murray Foundation Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                <div>
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
                    Founded by Dr. Henry Murray • Harvard Psychological Clinic
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                    Rooted in Scientific Excellence
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    The Thematic Apperception Test was developed by Dr. Henry Murray at Harvard University's 
                    Psychological Clinic in 1935. This groundbreaking projective technique revolutionized 
                    personality assessment by revealing unconscious drives, emotions, and thought patterns 
                    through narrative storytelling.
                  </p>
                  <div className="bg-accent/30 p-6 rounded-lg mb-6 border-l-4 border-primary">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Military Applications Since WWII
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Since World War II, TAT has been extensively used by military organizations worldwide 
                      for personnel selection and psychological evaluation. Its proven effectiveness in 
                      assessing leadership potential, emotional stability, and decision-making capabilities 
                      under pressure has made it a cornerstone of military recruitment processes.
                    </p>
                  </div>
                  <blockquote className="border-l-4 border-primary pl-6 mb-6 italic text-muted-foreground">
                    "The TAT is based on the well-recognized fact that when a person interprets an ambiguous 
                    social situation he is apt to expose his own personality as much as the phenomenon to which he is attending."
                    <cite className="block mt-2 text-sm font-semibold text-primary">— Dr. Henry Murray</cite>
                  </blockquote>
                  <Button onClick={downloadPDF} variant="government" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Murray's Research (PDF)
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-saffron/20 rounded-full blur-3xl"></div>
                  <img src={henryMurrayImage} alt="Dr. Henry Murray, founder of the Thematic Apperception Test" className="w-full max-w-sm mx-auto rounded-full shadow-elegant border-4 border-primary/20" />
                  <div className="mt-6 text-center">
                    <p className="font-semibold text-foreground">Dr. Henry Murray</p>
                    <p className="text-sm text-muted-foreground">Harvard Psychological Clinic</p>
                    <p className="text-sm text-muted-foreground">TAT Creator • 1893-1988</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Scientific Assessment Framework
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience Murray's revolutionary approach to personality assessment through validated psychological methodologies
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => <Card key={index} className="shadow-elegant border-primary/10 hover:shadow-saffron transition-all duration-300 hover:border-primary/30">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-saffron rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-gradient-foreground" />
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

        {/* Research Methodology Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Evidence-Based Psychological Assessment
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Experience the scientific rigor of Murray's projective methodology, refined through decades of psychological research
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="shadow-elegant border-primary/10">
                <CardHeader className="text-center">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">Projective Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Reveal unconscious personality traits through ambiguous stimulus interpretation and narrative construction
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-elegant border-primary/10">
                <CardHeader className="text-center">
                  <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">Psychodynamic Insight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Explore underlying motivations, conflicts, and personality dynamics through thematic analysis
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-elegant border-primary/10">
                <CardHeader className="text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">Clinical Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Backed by extensive clinical research and validated against established psychological assessment standards
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Begin Your Scientific Assessment Journey
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience the depth and precision of Murray's TAT methodology in a modern, comprehensive assessment platform
              </p>
              
              {!isSignedIn ? <Link to="/auth/signup">
                  <Button size="lg" variant="hero" className="px-8 py-6 text-lg">
                    Get Started Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link> : <Button size="lg" variant="hero" className="px-8 py-6 text-lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-saffron rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-gradient-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">TAT Pro</p>
                  <p className="text-xs text-muted-foreground">SSC Assessment Platform</p>
                </div>
              </div>
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
              <div className="space-y-2">
                <Link to="/about-tat" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  About TAT
                </Link>
                <Link to="/5-day-ssb-interview-procedure" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  SSB Procedure
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
    </div>;
};
export default SSBInterview;