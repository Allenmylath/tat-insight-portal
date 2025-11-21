import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoginRequiredButton } from "@/components/LoginRequiredButton";
import { PreviewBanner } from "@/components/PreviewBanner";
import { useUser } from "@clerk/clerk-react";
import { Download, Brain, BookOpen, Eye, CheckCircle2 } from "lucide-react";

const TatMethodology = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>TAT Test Methodology: Complete Guide to Thematic Apperception Test | TATTests.me</title>
        <meta name="description" content="Comprehensive guide to TAT test methodology based on Morris Stein's manual. Learn about psychological assessment, personality analysis, and clinical interpretation of the Thematic Apperception Test." />
        <meta name="keywords" content="TAT test, thematic apperception test, psychological assessment, personality test, Murray's needs, projective testing, clinical psychology" />
        <link rel="canonical" href="https://www.tattests.me/tat-methodology" />
      </Helmet>

      <article className="container max-w-4xl mx-auto px-4 py-12">
        {!isSignedIn && <PreviewBanner />}

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            The Mirror in the Story: Unlocking the Human Psyche with the Thematic Apperception Test
          </h1>
          
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <Button 
              onClick={() => {
                window.open(
                  'https://ianqebxtpviuekwfhjtq.supabase.co/storage/v1/object/public/murraypdf/2015.187637.The-Thematic-Apperception-Test.pdf',
                  '_blank'
                );
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Murray's Original Manual (PDF)
            </Button>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            In the diverse toolkit of clinical psychology, few instruments capture the imagination quite like the <strong>Thematic Apperception Test (TAT)</strong>. Unlike a questionnaire that asks for "Yes" or "No" answers, the TAT asks for a narrative. It presents the subject with a series of provocative, ambiguous pictures and asks a simple question: <em>What is happening here?</em>
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-12 space-y-4">
          <p className="text-foreground leading-relaxed">
            The answers—the stories told by patients—are not merely creative writing exercises. They are windows into the soul. According to <strong>Morris I. Stein, Ph.D.</strong>, in his seminal <em>Revised Edition of the Introductory Manual for Clinical Use with Adults</em> (1955), these stories reveal the hidden drives, conflicts, and environmental perceptions of the individual.
          </p>

          <p className="text-foreground leading-relaxed">
            This article delves deep into Stein's comprehensive manual, exploring the philosophy, administration, and intricate analysis of the TAT. Whether you are a student of psychology or simply fascinated by how we reveal ourselves through storytelling, this guide offers a fascinating look at one of history's most enduring projective techniques.
          </p>
        </section>

        {/* Part I: Philosophy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Part I: The Philosophy – From Art to Science
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              For decades, projective techniques like the TAT were viewed as more "art" than "science," relying heavily on the intuition of the therapist. However, Morris Stein's manual attempts to bridge this gap. He posits that as our understanding of personality increases, the TAT moves from an art form toward a precise scientific instrument.
            </p>

            <p className="text-foreground leading-relaxed">
              The fundamental assumption underlying Stein's technique is refreshing in its simplicity: <strong>behavior is consistent.</strong> He argues that the principles involved in analyzing TAT stories are, in large measure, no different from those employed in studying general behavior. When a patient constructs a story, they are "behaving." They are revealing their personality and problems just as they would in structuring any other unstructured situation in their daily life.
            </p>

            <p className="text-foreground leading-relaxed">
              Stein emphasizes that this method allows for a "blind analysis"—a diagnosis made knowing only the patient's age, sex, and basic status, without access to their full history. By analyzing the protocol "blindly," the psychologist avoids bias and can uncover critical areas the patient might be concealing, even from themselves.
            </p>
          </div>
        </section>

        {/* Part II: The Pictures */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Eye className="h-8 w-8 text-primary" />
            Part II: The Pictures – Windows into Conflict
          </h2>

          <p className="text-foreground leading-relaxed mb-6">
            The TAT consists of thirty pictures, though a typical administration involves selecting twenty specific cards based on the age and sex of the subject. Stein's manual provides a fascinating breakdown of the "common stories" elicited by these images. Knowing what <em>most</em> people say allows the clinician to spot the unique, deviation-filled stories that signal deep psychological friction.
          </p>

          <div className="space-y-8">
            {/* Picture #1 */}
            <div className="border-l-4 border-primary pl-6 space-y-3">
              <h3 className="text-2xl font-semibold">Picture #1: The Boy and the Violin</h3>
              <p className="text-foreground leading-relaxed">
                This famous image shows a young boy contemplating a violin resting on a table.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Theme:</strong> This card inevitably brings up themes of duty, ambition, and parental control.</li>
                <li className="text-foreground"><strong>Common Stories:</strong> Subjects often describe a boy forced by his parents to practice, reacting with passivity, rebellion, or escape into fantasy. Others see a boy dreaming of becoming a great virtuoso.</li>
                <li className="text-foreground"><strong>Clinical Insight:</strong> The story reveals the patient's attitude toward duty and authority. Does the hero break the violin? Does he submit? This mirrors how the patient handles parental dominance or their own aspirations.</li>
              </ul>
            </div>

            {/* Picture #2 */}
            <div className="border-l-4 border-accent pl-6 space-y-3">
              <h3 className="text-2xl font-semibold">Picture #2: The Farm Scene</h3>
              <p className="text-foreground leading-relaxed">
                This card depicts a young woman with books, a man working in the fields, and an older woman looking on.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Theme:</strong> This implies a clash between different environments—the labor of the farm versus the intellectual aspiration of the books.</li>
                <li className="text-foreground"><strong>Common Stories:</strong> The young woman is often seen as desiring to leave the "uncongenial" farm environment to pursue education or a better life, often leading to guilt regarding the family left behind.</li>
                <li className="text-foreground"><strong>Clinical Insight:</strong> This card is a litmus test for family relations and the desire for autonomy. It shows how the patient views their environment (satisfying or repugnant) and their level of aspiration.</li>
              </ul>
            </div>

            {/* Picture #3BM */}
            <div className="border-l-4 border-primary pl-6 space-y-3">
              <h3 className="text-2xl font-semibold">Picture #3BM: The Huddled Form</h3>
              <p className="text-foreground leading-relaxed">
                A figure is huddled on the floor against a couch, with a revolver nearby.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Theme:</strong> Depression and aggression.</li>
                <li className="text-foreground"><strong>Common Stories:</strong> The hero is seen as having been wronged or having done something wrong, leading to despair or suicide.</li>
                <li className="text-foreground"><strong>Clinical Insight:</strong> This is a critical card for assessing suicidal tendencies. Interestingly, perceptual distortions are common here; patients unable to deal with aggression may see the revolver as a toy, while those with gender identity conflicts may struggle to identify the sex of the figure.</li>
              </ul>
            </div>

            {/* Picture #4 */}
            <div className="border-l-4 border-accent pl-6 space-y-3">
              <h3 className="text-2xl font-semibold">Picture #4: The Conflict</h3>
              <p className="text-foreground leading-relaxed">
                A woman clutches the shoulders of a man whose face and body are averted, as if trying to pull away.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Theme:</strong> Heterosexual conflict and the "eternal triangle."</li>
                <li className="text-foreground"><strong>Common Stories:</strong> The man desires to leave—often for another woman or a "plan"—and the woman tries to restrain him.</li>
                <li className="text-foreground"><strong>Clinical Insight:</strong> This reveals the patient's marital adjustment and attitudes toward the opposite sex. Men often project themes of being trapped; women often project themes of trying to control or hold onto a partner.</li>
              </ul>
            </div>

            {/* Picture #6BM */}
            <div className="border-l-4 border-primary pl-6 space-y-3">
              <h3 className="text-2xl font-semibold">Picture #6BM: The Mother and Son</h3>
              <p className="text-foreground leading-relaxed">
                A short elderly woman stands with her back to a tall young man who looks downward perplexedly.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Theme:</strong> The mother-son dynamic.</li>
                <li className="text-foreground"><strong>Common Stories:</strong> The son is leaving home, getting married, or bringing bad news to the mother.</li>
                <li className="text-foreground"><strong>Clinical Insight:</strong> This serves as a direct probe into the patient's dependence on or friction with their mother. It often highlights unresolved oedipal conflicts or the struggle for independence.</li>
              </ul>
            </div>

            {/* Picture #13MF */}
            <div className="border-l-4 border-accent pl-6 space-y-3">
              <h3 className="text-2xl font-semibold">Picture #13MF: The Bed</h3>
              <p className="text-foreground leading-relaxed">
                A young man stands with downcast head buried in his arm; behind him is the figure of a woman lying in bed.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Theme:</strong> Sex, guilt, and death.</li>
                <li className="text-foreground"><strong>Common Stories:</strong> Sexual plots are most frequent. The woman may be a wife, girlfriend, or prostitute, and is often seen as sick, dead, or having just engaged in intercourse.</li>
                <li className="text-foreground"><strong>Clinical Insight:</strong> This card elicits the patient's sexual attitudes and guilt. Aggressive stories (e.g., the woman is murdered) can indicate deep-seated hostility toward women or sexual partners.</li>
              </ul>
            </div>

            {/* Picture #16 */}
            <div className="border-l-4 border-primary pl-6 space-y-3">
              <h3 className="text-2xl font-semibold">Picture #16: The Blank Card</h3>
              <p className="text-foreground leading-relaxed">
                This card is entirely blank.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Theme:</strong> Pure projection.</li>
                <li className="text-foreground"><strong>Common Stories:</strong> Because there is no stimulus, the story comes entirely from the patient's mind.</li>
                <li className="text-foreground"><strong>Clinical Insight:</strong> Patients often describe their most pressing current problem or project their feelings about the therapist and the test itself.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* First Signup Nudge */}
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5 my-12">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Brain className="h-16 w-16 text-primary shrink-0" />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">
                  Ready to Discover Your Own Personality?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Take your own TAT test and receive professional AI-powered psychological analysis based on these proven methodologies.
                </p>
                <LoginRequiredButton 
                  returnUrl="/dashboard/pending"
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Start Your TAT Assessment →
                </LoginRequiredButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part III: Administration */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Part III: Administration – Setting the Stage
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              The validity of the TAT depends heavily on how it is administered. Stein argues that rapport is paramount; the patient must feel psychologically at ease to give free rein to their imagination.
            </p>

            <h3 className="text-2xl font-semibold mt-6 mb-3">The Protocol</h3>
            <p className="text-foreground leading-relaxed">
              The test is ideally administered in two sessions of one hour each, separated by at least one day to reduce fatigue. The instructions are specific: the patient is told they will see pictures and must make up a dramatic story for each. They must describe:
            </p>
            <ol className="list-decimal ml-8 space-y-2 text-foreground">
              <li>What led up to the scene.</li>
              <li>What is happening now.</li>
              <li>What the people are feeling and thinking.</li>
              <li>The outcome.</li>
            </ol>

            <h3 className="text-2xl font-semibold mt-6 mb-3">The Role of the Psychologist</h3>
            <p className="text-foreground leading-relaxed">
              The psychologist must remain "essentially neutral". They must show interest but never betray approval or disapproval, particularly if the patient tells a morbid or aggressive story. If a patient struggles, the psychologist can offer gentle prompts, such as, "Tell me more about what the people are feeling".
            </p>

            <h3 className="text-2xl font-semibold mt-6 mb-3">Recording the Stories</h3>
            <p className="text-foreground leading-relaxed mb-3">
              Stein outlines several methods for recording the stories, each with pros and cons:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="text-foreground"><strong>Manual Recording:</strong> The psychologist writes the story by hand. This allows for observation of behavior but can be exhausting and slow.</li>
              <li className="text-foreground"><strong>Self-Recording:</strong> The patient writes their own stories. This saves the clinician effort but often leads to "polished," less spontaneous literary productions where slips of the tongue are lost.</li>
              <li className="text-foreground"><strong>Mechanical Recording:</strong> Using a recording machine allows for a perfect transcript but might make the patient "mike-conscious" or inhibited.</li>
            </ul>
          </div>
        </section>

        {/* Part IV: Clinical Analysis */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Part IV: Clinical Analysis – The Detective Work
          </h2>

          <div className="space-y-6">
            <p className="text-foreground leading-relaxed">
              Once the stories are collected, the real work begins. Stein's "Technique of Clinical Analysis" breaks down the narrative into specific, scorable factors. This system relies on the "Need-Press" theory developed by Henry Murray.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">1. Identifying the Hero</h3>
                <p className="text-foreground leading-relaxed">
                  The first step is to find the "Hero"—the character with whom the patient identifies. Stein notes that the hero is usually the character who speaks first, occupies the most attention, or is most like the patient in age and sex. The assumption is that the hero's needs are the patient's needs.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">2. Environmental Stimuli (The Press)</h3>
                <p className="text-foreground leading-relaxed mb-3">
                  The clinician must analyze the world the hero inhabits. Is the environment hostile or friendly? Stein uses the concept of "Press" (denoted by <em>p</em>) to categorize these environmental forces.
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-foreground"><strong>p Aggression:</strong> Someone hates, curses, or physically attacks the hero.</li>
                  <li className="text-foreground"><strong>p Dominance:</strong> The hero is coerced, restrained, or induced to do something by parents or authority.</li>
                  <li className="text-foreground"><strong>p Rejection:</strong> A person scorns or turns away from the hero.</li>
                  <li className="text-foreground"><strong>p Lack:</strong> The environment is one of scarcity or poverty.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">3. The Hero's Needs</h3>
                <p className="text-foreground leading-relaxed mb-3">
                  What motivates the hero? Stein lists various needs (denoted by <em>n</em>) that drive the story's action:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-foreground"><strong>n Achievement:</strong> To work with energy and persistence toward a goal (e.g., the boy wanting to be a master violinist).</li>
                  <li className="text-foreground"><strong>n Aggression:</strong> To fight, kill, or verbally belittle others.</li>
                  <li className="text-foreground"><strong>n Autonomy:</strong> To escape restraint, leave home, or defy parents.</li>
                  <li className="text-foreground"><strong>n Harmavoidance:</strong> To run away from danger or fear injury.</li>
                  <li className="text-foreground"><strong>n Succorance:</strong> To seek aid, sympathy, or protection from others.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">4. Cathexes and Inner States</h3>
                <p className="text-foreground leading-relaxed">
                  The analyst also looks at "Cathexes"—objects or ideas the hero likes (positive) or dislikes (negative). For example, does the hero view the gun with fascination or disgust? Furthermore, the "Inner States" are examined: is the hero experiencing joy, conflict, pessimism, or dejection?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Second Signup Nudge */}
        <Card className="border-primary/50 bg-gradient-to-r from-accent/5 to-primary/5 my-12">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <CheckCircle2 className="h-16 w-16 text-accent shrink-0" />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">
                  Understand Your Personality Profile
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get a comprehensive analysis covering Murray's needs, inner states, and military assessment readiness—all powered by advanced AI.
                </p>
                <LoginRequiredButton 
                  returnUrl="/dashboard/pending"
                  variant="default"
                  size="lg"
                >
                  Create Free Account
                </LoginRequiredButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part V: Reading Between the Lines */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Part V: Reading Between the Lines
          </h2>

          <div className="space-y-6">
            <p className="text-foreground leading-relaxed">
              Beyond the plot, Stein urges clinicians to watch <em>how</em> the patient interacts with the test. These "Additional Factors" often reveal more than the stories themselves.
            </p>

            <div>
              <h3 className="text-2xl font-semibold mb-3">Behavioral Manifestations</h3>
              <p className="text-foreground leading-relaxed">
                The body reveals what the mind tries to hide. The psychologist should note pauses, throat clearing, sweating, smoking, or restlessness. These physiological signs often appear when the patient touches on a sensitive "critical area".
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3">Distortions and Omissions</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Does the patient refuse to see the gun in Picture #3BM? Do they ignore the woman in the background of Picture #4?
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>Omissions:</strong> Leaving out parts of a picture (like the rifle in #8BM) suggests the object stimulates deep anxiety or aggressive tendencies the patient wishes to avoid.</li>
                <li className="text-foreground"><strong>Distortions:</strong> Changing the reality of the picture (e.g., seeing a young boy as a female) can indicate gender confusion or a break with reality.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3">Symbolism</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Stein highlights that objects in the pictures often serve as symbols for unconscious drives.
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-foreground"><strong>The Violin (Picture #1):</strong> Often symbolizes the body or sexual organs; preoccupation with its "inner mechanism" can signal sexual curiosity or castration anxiety.</li>
                <li className="text-foreground"><strong>The Rope (Picture #17BM):</strong> Stories of climbing up or down a rope often reveal the patient's ambition or exhibitionistic tendencies, while the nakedness of the figure can trigger masturbatory guilt.</li>
                <li className="text-foreground"><strong>Hypnotism (Picture #12M):</strong> Stories where the young man is hypnotized by the older man may reflect latent homosexual tendencies or passivity.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Part VI: Case Study */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Part VI: The Professional Man – A Case Study
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              To illustrate the power of this method, Stein presents the case of "C.B.," a 35-year-old professional man.
            </p>

            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <p className="text-foreground leading-relaxed">
                In his story for <strong>Picture #1 (The Violin)</strong>, C.B. describes a "small boy" whose parents are musicians. The boy dreams of being a "child prodigy" and equalling the "old masters."
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Stein's Interpretation:</strong> The story is well-organized, showing good intelligence and ego strength. However, the contrast between the "small boy" and the "old masters" suggests feelings of inferiority. The patient has a strong <em>n Achievement</em>, but he feels he has a long way to go to meet his ego-ideals.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <p className="text-foreground leading-relaxed">
                In <strong>Picture #2 (The Farm)</strong>, C.B. describes a peasant family where the daughter insists on going to school despite her mother's arguments.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Stein's Interpretation:</strong> The setting is "the old country," suggesting a psychological distancing from the scene. The conflict is between the heroine and the <em>mother</em> (not the father), suggesting the mother was the dominant, perhaps obstructing, force in the patient's life. The hero's drive for education is self-directed (<em>n Autonomy</em>), and the outcome—success and upward social mobility—confirms the patient's strong ambition.
              </p>
            </div>

            <p className="text-foreground leading-relaxed">
              Through the cluster analysis of these and subsequent stories, Stein constructs a profile of a man who is capable and ambitious but struggles with feelings of inferiority and anticipates interference from his environment (specifically maternal figures).
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Conclusion
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Morris Stein's <em>Thematic Apperception Test Manual</em> serves as a reminder that human personality is a complex narrative. By analyzing the stories we tell, we reveal our deepest needs—our desire to achieve, our fear of failure, our sexual anxieties, and our struggles with authority.
            </p>

            <p className="text-foreground leading-relaxed">
              Stein's work transforms the TAT from a guessing game into a disciplined clinical inquiry. It teaches us that there are no accidental stories. Every hesitation, every hero, and every ending is a piece of the puzzle, waiting for a skilled clinician to put it together.
            </p>
          </div>
        </section>

        {/* Final Strong CTA */}
        <Card className="border-primary bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <Brain className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Unlock Your Psychological Profile Today
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the power of the TAT methodology with modern AI-powered analysis. Get comprehensive insights into your personality structure, needs, and psychological profile.
              </p>
              
              <div className="bg-background/50 rounded-lg p-6 max-w-2xl mx-auto">
                <ul className="text-left space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>AI-powered TAT analysis</strong> based on proven clinical methodologies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>Comprehensive personality report</strong> covering Murray's needs and inner states</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>Military assessment readiness</strong> for SSB and defense service selection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground"><strong>Personal development insights</strong> to understand your motivations and conflicts</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <LoginRequiredButton 
                  returnUrl="/dashboard/pending"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                >
                  Start Free TAT Assessment →
                </LoginRequiredButton>
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => window.location.href = '/thematic-apperception-test'}
                >
                  Explore TAT Research Framework
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                No credit card required • Get started in minutes • Trusted by thousands
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Download reminder */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <p className="text-center text-muted-foreground">
            Want to dive deeper into the original research?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold"
              onClick={() => {
                window.open(
                  'https://ianqebxtpviuekwfhjtq.supabase.co/storage/v1/object/public/murraypdf/2015.187637.The-Thematic-Apperception-Test.pdf',
                  '_blank'
                );
              }}
            >
              Download Murray's Original Manual (PDF)
            </Button>
          </p>
        </div>
      </article>
    </div>
  );
};

export default TatMethodology;
