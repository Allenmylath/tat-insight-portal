import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Brain, FileText, Target } from "lucide-react";
import { LoginRequiredButton } from "@/components/LoginRequiredButton";
import { PreviewBanner } from "@/components/PreviewBanner";
import { useUser } from "@clerk/clerk-react";

const ScorsGMethodology = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>SCORS-G Methodology: Complete Guide to Social Cognition and Object Relations Scale | TATTests.me</title>
        <meta
          name="description"
          content="Comprehensive guide to SCORS-G methodology for TAT assessment. Learn about the eight dimensions of personality assessment, online administration, and clinical scoring methods."
        />
        <meta
          name="keywords"
          content="SCORS-G, social cognition, object relations scale, TAT scoring, personality assessment, psychological testing, narrative assessment, online TAT"
        />
        <link rel="canonical" href="https://www.tattests.me/thematic-apperception-test" />
      </Helmet>

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col justify-center">
        {!isSignedIn && <PreviewBanner />}

        {/* Hero Section */}
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              The Narrative Mind: A Comprehensive Guide to SCORS-G and the Modernization of the Thematic Apperception
              Test
            </h1>
            <p className="text-xl text-muted-foreground">By Allen</p>
          </header>

          {/* Download Section */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <FileText className="h-10 w-10 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-1">SCORS-G Training Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    Download the complete SCORS-G manual for in-depth methodology
                  </p>
                </div>
                <Button
                  onClick={() => {
                    window.open(
                      "https://ianqebxtpviuekwfhjtq.supabase.co/storage/v1/object/public/murraypdf/scors-g-manual.pdf",
                      "_blank",
                    );
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Introduction: The Challenge of Projective Assessment</h2>
            <p className="text-lg leading-relaxed mb-4">
              For decades, the Thematic Apperception Test (TAT) has stood as a titan in the field of psychological
              assessment. As the second most commonly used performance-based task, it offers a unique window into the
              human psyche through storytelling. However, the TAT has historically faced a "reliability problem." Unlike
              self-report questionnaires, narrative data is messy, complex, and subjective. How does a clinician
              objectively score a story about a boy and a violin?
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Enter the <strong>Social Cognition and Object Relations Scale – Global Rating Method (SCORS-G)</strong>.
              Developed to bridge the gap between rich clinical intuition and empirical rigor, the SCORS-G provides a
              standardized framework for assessing the quality of a patient's object relations (how they relate to
              others) and social cognition (how they understand the social world).
            </p>
            <p className="text-lg leading-relaxed">
              This article explores the dimensions of the SCORS-G, its scoring criteria, and recent breakthroughs
              suggesting this method is robust enough to survive the transition from the consulting room to the digital
              realm.
            </p>
          </section>

          {/* Chapter 1 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Chapter 1: Origins and Evolution</h2>

            <h3 className="text-2xl font-semibold mb-4">From Q-Sort to Global Ratings</h3>
            <p className="text-lg leading-relaxed mb-4">
              The SCORS-G is an evolution of the original Social Cognition and Object Relations Scale (SCORS-Q)
              developed by Drew Westen in 1995. The original method utilized a Q-sort procedure, which required raters
              to sort cards and complex criteria—a process that, while detailed, necessitated intensive training and
              significant time investment.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Recognizing the need for a more clinically practical tool, researchers developed the "Global" rating
              method (SCORS-G) in 1997. This adaptation allows clinicians to assign a single Likert-scale score (ranging
              from 1 to 7) to various dimensions of personality functioning based on the narrative data. This shift made
              the tool more accessible for large-scale surveys of psychologists and psychiatrists regarding patient
              personality functioning.
            </p>

            <h3 className="text-2xl font-semibold mb-4 mt-8">The Clinical Value</h3>
            <p className="text-lg leading-relaxed mb-4">
              The SCORS-G has demonstrated substantial reliability and validity in assessing narratives from diverse
              sources, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg mb-6">
              <li>
                <strong>TAT Narratives:</strong> Assessing college students, outpatients, and inpatients
              </li>
              <li>
                <strong>Early Memories:</strong> Analyzing relationship paradigms from earliest recollections
              </li>
              <li>
                <strong>Dreams:</strong> Understanding unconscious relational patterns
              </li>
              <li>
                <strong>Psychotherapy Narratives:</strong> Tracking changes in personality and object relations over the
                course of treatment
              </li>
            </ul>
          </section>

          {/* Chapter 2 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Chapter 2: The Eight Dimensions of SCORS-G</h2>
            <p className="text-lg leading-relaxed mb-6">
              The core of the SCORS-G system lies in its eight distinct dimensions. Each is scored on a scale of 1
              (pathological/maladaptive) to 7 (healthy/adaptive), with a score of 4 typically serving as a default for
              bland or limited information.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-3">1. Complexity of Representation of People (COM)</h3>
                <p className="text-lg leading-relaxed mb-2">
                  This dimension measures the ability to distinguish self from others and to view people as complex
                  beings with mixed motivations.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> The subject is egocentric or confused, blurring the lines between
                    their own thoughts and those of others
                  </li>
                  <li>
                    <strong>Mid-Range (3):</strong> People are described in simplistic, "split" terms—either all good or
                    all bad
                  </li>
                  <li>
                    <strong>Health (7):</strong> The subject displays psychological mindedness, insight, and the ability
                    to see others as differentiated, complex individuals
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">2. Affective Quality of Representations (AFF)</h3>
                <p className="text-lg leading-relaxed mb-2">
                  AFF captures the emotional tone of the narrative and the subject's expectations of relationships.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> The relational world is viewed as malevolent, caustic, or abusive
                  </li>
                  <li>
                    <strong>Mid-Range (5):</strong> A mixed view, neither primarily positive nor negative, but must
                    contain some positive elements to reach this score
                  </li>
                  <li>
                    <strong>Health (7):</strong> Generally positive expectations of relationships; the view is favorable
                    and affirmative without being "pollyannaish"
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">3. Emotional Investment in Relationships (EIR)</h3>
                <p className="text-lg leading-relaxed mb-2">
                  This scale assesses the depth and maturity of interpersonal connections.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> Focus is primarily on the self's needs; relationships are tumultuous
                    or nonexistent
                  </li>
                  <li>
                    <strong>Mid-Range (3):</strong> Relationships are shallow, or the narrative only alludes to others
                    without real engagement
                  </li>
                  <li>
                    <strong>Health (7):</strong> Deep, committed relationships characterized by mutual sharing,
                    intimacy, and respect
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">
                  4. Emotional Investment in Values and Moral Standards (EIM)
                </h3>
                <p className="text-lg leading-relaxed mb-2">
                  EIM evaluates the internalization of moral codes and conscience.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> Behavior is selfish, aggressive, or self-indulgent with no remorse
                    or guilt
                  </li>
                  <li>
                    <strong>Mid-Range (3):</strong> "Childlike" morality; rules are followed only to avoid punishment,
                    or the subject is morally rigid and harsh
                  </li>
                  <li>
                    <strong>Health (7):</strong> Abstract moral thought; willingness to question convention for higher
                    principles; genuine compassion
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">5. Understanding of Social Causality (SC)</h3>
                <p className="text-lg leading-relaxed mb-2">
                  This dimension measures the logic and coherence of the subject's understanding of human behavior.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> Narratives are confused, distorted, or extremely sparse; it is
                    difficult to understand why people are doing what they are doing
                  </li>
                  <li>
                    <strong>Mid-Range (3):</strong> Simple but sensible understanding; minor gaps or incongruities may
                    exist
                  </li>
                  <li>
                    <strong>Health (7):</strong> Highly coherent accounts; deep understanding of how thoughts and
                    feelings drive actions and impact others
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">
                  6. Experience and Management of Aggressive Impulses (AGG)
                </h3>
                <p className="text-lg leading-relaxed mb-2">
                  AGG looks at how anger and aggression are processed and expressed.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> Physically assaultive, destructive, or sadistic behavior; loss of
                    control
                  </li>
                  <li>
                    <strong>Mid-Range (3):</strong> Passive-aggressive behavior, denigration, or failure to protect the
                    self from abuse
                  </li>
                  <li>
                    <strong>Health (7):</strong> Ability to express anger and assert the self appropriately without
                    destruction
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">7. Self-Esteem (SE)</h3>
                <p className="text-lg leading-relaxed mb-2">This measures the subjective value placed on the self.</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> The self is viewed as loathsome, evil, rotten, or contaminating
                  </li>
                  <li>
                    <strong>Mid-Range (3):</strong> Low self-esteem (inadequate/inferior) or unrealistic grandiosity
                  </li>
                  <li>
                    <strong>Health (7):</strong> Realistically positive feelings about the self
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">8. Identity and Coherence of Self (ICS)</h3>
                <p className="text-lg leading-relaxed mb-2">
                  ICS assesses the stability and integration of the personality.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li>
                    <strong>Pathology (1):</strong> Fragmented sense of self; multiple personalities
                  </li>
                  <li>
                    <strong>Mid-Range (3):</strong> Unstable sense of self; widely fluctuating feelings about who one is
                  </li>
                  <li>
                    <strong>Health (7):</strong> Integrated identity with long-term ambitions and goals
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* First Signup Nudge */}
          <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5 my-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 flex-col md:flex-row">
                <Brain className="h-16 w-16 text-primary flex-shrink-0" />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Discover Your SCORS-G Profile</h3>
                  <p className="text-muted-foreground mb-4">
                    Take a professional TAT assessment and receive comprehensive SCORS-G analysis across all eight
                    dimensions of personality functioning
                  </p>
                  <LoginRequiredButton returnUrl="/dashboard" className="bg-primary hover:bg-primary/90" size="lg">
                    Start Your Assessment →
                  </LoginRequiredButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter 3 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Chapter 3: Modernizing the TAT – The Online Frontier</h2>
            <p className="text-lg leading-relaxed mb-4">
              While the dimensions of the SCORS-G are well-established, the administration of the TAT itself is
              undergoing a digital revolution. Traditional administration involves sitting face-to-face with an
              examiner, viewing hard copies of cards, and speaking stories aloud. This process is time-consuming and
              raises accessibility issues.
            </p>

            <h3 className="text-2xl font-semibold mb-4 mt-8">The Digital Shift</h3>
            <p className="text-lg leading-relaxed mb-4">
              New research by Slavin-Mulford, Vincent, Coleman, et al. (2024), titled{" "}
              <em>"Moving Toward an Online Thematic Apperception Test (TAT),"</em> investigates whether the TAT can be
              moved out of the lab and onto the screen without sacrificing data quality.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Prior research in lab settings had already established that when participants <strong>type</strong> their
              own narratives, they produce richer responses than when they narrate stories out loud to an examiner. The
              current study extended this by comparing three specific conditions among 134 college students:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-lg mb-6">
              <li>
                <strong>Lab/Hard Copy:</strong> Traditional viewing of cards in a lab
              </li>
              <li>
                <strong>Lab/Computer:</strong> Viewing images on a screen in a lab
              </li>
              <li>
                <strong>Online/Remote:</strong> Taking the TAT remotely via computer
              </li>
            </ol>

            <h3 className="text-2xl font-semibold mb-4 mt-8">The Verdict: Stability Across Mediums</h3>
            <p className="text-lg leading-relaxed mb-4">
              The results of this 2024 study are promising for the future of remote assessment. Using the SCORS-G method
              to score the typed narratives, researchers found that{" "}
              <strong>SCORS-G ratings were not affected by card presentation or setting</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Whether the participant held a physical card or looked at a screen, and whether they were in a controlled
              lab or taking the test online, the psychological richness (as measured by SCORS-G) remained stable. This
              suggests that the TAT can be administered online without a "diminution in the quality of SCORS-G ratings,"
              significantly opening the door for broader, more accessible psychological testing.
            </p>
          </section>

          {/* Chapter 4 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Chapter 4: Scoring in Practice and Reliability</h2>

            <h3 className="text-2xl font-semibold mb-4">The "Addendum" Rules</h3>
            <p className="text-lg leading-relaxed mb-4">
              The SCORS-G manual provides an "Addendum" to help raters navigate ambiguity. For example, when scoring{" "}
              <strong>Affective Quality (AFF)</strong> or <strong>Self-Esteem (SE)</strong>, a score of 5 is considered
              the "beginning range of positive scores". However, if a story has significant "spoilage" (a mix of
              positive and negative elements where the negative dominates or ruins the positive), the score likely drops
              to a 3 or lower.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Similarly, for <strong>Identity (ICS)</strong>, if a character is contemplating suicide, the score is
              almost always in the pathological range (1, 2, or 3), regardless of other narrative elements.
            </p>

            <h3 className="text-2xl font-semibold mb-4 mt-8">Achieving Reliability</h3>
            <p className="text-lg leading-relaxed mb-4">
              Reliability is the cornerstone of the SCORS-G method. The manual outlines a rigorous training protocol
              where trainees must score practice protocols to achieve an Intraclass Correlation Coefficient (ICC) of
              greater than .60.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              To achieve this "Good" scoring reliability, trainees are encouraged to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg mb-6">
              <li>Train on the exact same card stimuli set (e.g., TAT cards 1, 2, 3BM, 4, & 13MF) used in research</li>
              <li>
                Use "anchor" protocols—narratives that have been empirically identified as having low variance and high
                consensus among experts—to calibrate their internal rating scales
              </li>
              <li>
                Review scoring differences greater than 1 point (e.g., a rater giving a 2 when the consensus is 5) to
                identify outliers
              </li>
            </ul>
          </section>

          {/* Second Signup Nudge */}
          <Card className="border-primary/50 bg-gradient-to-r from-accent/5 to-primary/5 my-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 flex-col md:flex-row">
                <Target className="h-16 w-16 text-accent flex-shrink-0" />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Ready for Professional Analysis?</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI-powered system uses SCORS-G methodology to provide detailed insights into your personality
                    structure and object relations
                  </p>
                  <LoginRequiredButton returnUrl="/dashboard" className="bg-accent hover:bg-accent/90" size="lg">
                    Get Your Analysis →
                  </LoginRequiredButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Conclusion</h2>
            <p className="text-lg leading-relaxed mb-4">
              The SCORS-G represents a critical intersection of psychodynamic theory and empirical methodology. By
              breaking down complex narrative data into eight quantifiable dimensions, it allows clinicians to assess
              the structural integrity of a patient's internal world. With the recent findings by Slavin-Mulford et al.
              (2024) confirming the validity of online administration, the SCORS-G is poised to remain a vital tool in
              the digital age of psychology.
            </p>
          </section>

          {/* References */}
          <section className="mb-12 bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">References</h2>
            <ol className="list-decimal list-inside space-y-3 text-base">
              <li>
                Stein, M., Hilsenroth, M., Slavin-Mulford, J., & Pinsker, J. (2011).{" "}
                <em>Social Cognition and Object Relations Scale: Global Rating Method (SCORS-G; 4th ed.)</em>.
                Unpublished manuscript, Massachusetts General Hospital and Harvard Medical School, Boston, MA.
              </li>
              <li>
                Slavin-Mulford, J. M., Vincent, E. M., Coleman, S. G., Ravula, H. P., Coleman, J. J., & Wilcox, M. M.
                (2024). Moving Toward an Online Thematic Apperception Test (TAT): The Impact of Administration
                Modifications on Narrative Length and Story Richness. <em>Journal of Personality Assessment</em>,
                374-383.{" "}
                <a
                  href="https://doi.org/10.1080/00223891.2024.2425660"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://doi.org/10.1080/00223891.2024.2425660
                </a>
              </li>
            </ol>
          </section>

          {/* Final CTA */}
          <Card className="border-primary bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Unlock Your Complete Psychological Profile</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Experience the power of SCORS-G analysis combined with modern AI technology
              </p>
              <ul className="text-left max-w-2xl mx-auto mb-8 space-y-3">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <span className="text-base">Comprehensive 8-dimension SCORS-G assessment</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <span className="text-base">Online TAT administration validated by research</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <span className="text-base">Detailed personality and object relations insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <span className="text-base">Military selection board assessment preparation</span>
                </li>
              </ul>
              <LoginRequiredButton size="lg" className="text-lg px-8 py-6 h-auto" returnUrl="/dashboard">
                Create Free Account & Start Assessment
              </LoginRequiredButton>
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
};

export default ScorsGMethodology;
