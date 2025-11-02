import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Calendar, 
  ClipboardCheck, 
  Users, 
  Brain, 
  Trophy,
  Stethoscope,
  ArrowRight,
  CheckCircle,
  Home,
  FileText,
  Target,
  MessageSquare,
  BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SSBProcedure = () => {
  const days = [
    {
      day: "Day 0",
      title: "Reporting Day",
      icon: ClipboardCheck,
      activities: [
        "Report to designated SSB Centre as per call letter",
        "Can report through Movement Control Officer (MCO) a day earlier",
        "Temporary chest numbers allotted",
        "Initial documentation and formalities"
      ]
    },
    {
      day: "Day 1",
      title: "Screening Day (Stage I)",
      icon: FileText,
      activities: [
        "Officer Intelligence Rating (OIR) Test - 2 sets × 30 minutes",
        "Picture Perception & Description Test (PP&DT)",
        "Group Discussion",
        "Results declared post-lunch",
        "Selected candidates proceed to Stage II with new chest number"
      ],
      critical: true
    },
    {
      day: "Day 2",
      title: "Psychological Tests",
      icon: Brain,
      activities: [
        "Thematic Apperception Test (TAT) - 12 pictures",
        "Word Association Test (WAT) - 60 words",
        "Situation Reaction Test (SRT) - 60 situations",
        "Self-Description Test (SD)",
        "Personal Interview begins"
      ],
      critical: true
    },
    {
      day: "Day 3",
      title: "GTO Tasks - Part I",
      icon: Users,
      activities: [
        "Group Discussion",
        "Group Planning Exercise (GPE)",
        "Progressive Group Task (PGT)",
        "Half Group Task (HGT)",
        "Lecturette",
        "Individual Obstacles"
      ]
    },
    {
      day: "Day 4",
      title: "GTO Tasks - Part II",
      icon: Target,
      activities: [
        "Command Task",
        "Final Group Task (FGT)",
        "Personal Interview continues/concludes",
        "Assessment of teamwork, leadership, problem-solving"
      ]
    },
    {
      day: "Day 5",
      title: "Conference Day",
      icon: Trophy,
      activities: [
        "Board Conference with panel of officers",
        "Questions about stay, performance, and batchmates",
        "Borderline candidates face situation-based questions",
        "Results announced",
        "Recommended candidates proceed to medical"
      ],
      critical: true
    }
  ];

  const olqCategories = [
    {
      category: "Organization and Planning",
      qualities: ["Organizing Ability", "Power of Expression"]
    },
    {
      category: "Social Adjustment",
      qualities: ["Effective Intelligence", "Reasoning Ability", "Speed of Decision", "Sense of Responsibility"]
    },
    {
      category: "Social Effectiveness",
      qualities: ["Cooperation", "Social Adaptability", "Initiative", "Self-Confidence", "Determination", "Courage"]
    },
    {
      category: "Mental Strength",
      qualities: ["Stamina", "Liveliness", "Group Influence"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="default">Start Practice</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="mb-4" variant="secondary">Complete Guide</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              SSB 5-Day Interview Procedure
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive breakdown of the Service Selection Board's rigorous evaluation process to assess Officer Like Qualities (OLQs) for the Indian Armed Forces.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 container">
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                The Service Selection Board (SSB) Interview is a rigorous 5-day evaluation process used by all branches of the Indian Armed Forces (Army, Navy, Air Force, and Coast Guard) to assess whether candidates possess Officer Like Qualities (OLQs) necessary to serve as officers.
              </p>
              <p>
                The selection process is based on the principle of <strong className="text-foreground">Mansa, Vacha, and Karmana</strong> (thoughts, speech, and deeds).
              </p>
              <div className="pt-4">
                <h4 className="font-semibold text-foreground mb-2">Who Appears for SSB?</h4>
                <p>Candidates who qualify written exams for CDS, NDA, AFCAT, INET, and various special entries including Technical/Non-Technical Short Service Commission, Territorial Army, and other commissioned entries.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Day-by-Day Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold text-foreground">Day-by-Day Breakdown</h2>
              <p className="text-muted-foreground">Complete schedule of the 5-day SSB procedure</p>
            </div>

            <div className="space-y-6">
              {days.map((day, index) => (
                <Card key={index} className={`shadow-elegant ${day.critical ? 'border-primary/40' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-saffron flex items-center justify-center flex-shrink-0">
                        <day.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{day.day}: {day.title}</CardTitle>
                          {day.critical && <Badge variant="destructive">Critical</Badge>}
                        </div>
                        <CardDescription>Key activities and assessments</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Psychological Tests Detail */}
      <section className="py-16 container">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-foreground">Key Psychological Tests</h2>
            <p className="text-muted-foreground">Understanding the most critical assessments</p>
          </div>

          {/* Featured TAT Test - Full Width */}
          <Card className="shadow-elegant border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 md:col-span-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">Thematic Apperception Test (TAT)</CardTitle>
                    <Badge variant="default" className="bg-gradient-saffron">Most Critical</Badge>
                  </div>
                  <CardDescription>The cornerstone of SSB psychological assessment</CardDescription>
                </div>
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 shadow-elegant">
                    Practice TAT Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Format</p>
                  <p>12 pictures (11 hazy + 1 blank slide)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Time Allocation</p>
                  <p>30 seconds viewing, 4 minutes writing per picture</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Assessment Focus</p>
                  <p>Imaginative and creative skills, situational perception</p>
                </div>
              </div>
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-muted-foreground italic">
                  <strong className="text-foreground">Why TAT matters:</strong> This is the most significant round showing the true representation of a candidate's thoughts, personality, and officer-like qualities. Practice is essential for success.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Other Psychological Tests */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Word Association Test (WAT)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Format:</strong> 60 words displayed</p>
                <p><strong className="text-foreground">Time:</strong> 15 seconds per word</p>
                <p><strong className="text-foreground">Tests:</strong> Spontaneous thinking and personality traits</p>
                <p className="pt-2 text-sm"><em>Write immediate sentence responses without overthinking</em></p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Situation Reaction Test (SRT)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Format:</strong> 60 different situations in a booklet</p>
                <p><strong className="text-foreground">Time:</strong> 30 minutes total</p>
                <p><strong className="text-foreground">Tests:</strong> Decision-making skills, officer-like thinking</p>
                <p className="pt-2 text-sm"><em>Critical test revealing conscious and subconscious mind</em></p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Self-Description Test (SD)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Format:</strong> Written self-assessment</p>
                <p><strong className="text-foreground">Content:</strong> Opinions of parents, teachers, friends, colleagues</p>
                <p><strong className="text-foreground">Tests:</strong> Self-awareness, strengths, weaknesses</p>
                <p className="pt-2 text-sm"><em>Be genuine, avoid false praise or excessive negativity</em></p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* OLQs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold text-foreground">15 Officer Like Qualities (OLQs)</h2>
              <p className="text-muted-foreground">Qualities assessed throughout the SSB procedure</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {olqCategories.map((cat, index) => (
                <Card key={index} className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-lg">{cat.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cat.qualities.map((quality, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{quality}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Tests */}
      <section className="py-16 container">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Additional Tests & Medical</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  CPSS (Pilot Selection)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">For:</strong> Flying Officer aspirants only</p>
                <p><strong className="text-foreground">When:</strong> After Day 4 or post-recommendation</p>
                <p><strong className="text-foreground">Includes:</strong> Instrument Battery Test, Sensory Motor Apparatus Test (SMAT), Control Velocity Test (CVT)</p>
                <Badge variant="destructive" className="mt-2">Once-in-a-lifetime test</Badge>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Examination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">For:</strong> Recommended candidates only</p>
                <p><strong className="text-foreground">Permanent rejection reasons:</strong> Weak eyesight/color blindness, hearing issues, tattoos (specific locations), certain surgical history</p>
                <p><strong className="text-foreground">Temporary rejection:</strong> Can appeal at AMB with ₹40 fee</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-elegant border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Key Takeaways</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "SSB is a comprehensive personality evaluation, not just a test",
                    "Be genuine throughout - consistency is monitored across all tests",
                    "Physical fitness, mental alertness, and officer-like qualities are paramount",
                    "The process tests how you think, speak, and act under various circumstances",
                    "Prepare by developing genuine OLQs rather than just learning techniques",
                    "Even rejection shouldn't discourage you - many clear on subsequent attempts"
                  ].map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Ready to Start Your SSB Preparation?</h2>
          <p className="text-xl text-muted-foreground">
            Practice with our TAT methodology and prepare for your SSB interview with confidence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                Start Practice <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/tat-test-info">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" /> Learn About TAT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li><Link to="/about-us" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/tat-test-info" className="hover:text-foreground transition-colors">TAT Test Info</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <p className="text-sm text-muted-foreground">
                Email: support@tatpractice.com<br />
                Phone: +91 XXXX XXXX
              </p>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-sm text-muted-foreground">
            © 2024 TAT Practice Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SSBProcedure;
