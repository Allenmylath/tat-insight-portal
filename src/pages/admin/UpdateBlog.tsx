import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UpdateBlog() {
  const [loading, setLoading] = useState(false);

  const updateBlogPost = async () => {
    setLoading(true);
    try {
      const updatedContent = `<h1>How the Thematic Apperception Test (TAT) Is Used in the Indian SSB: Complete Guide for Aspirants</h1>

<p>If you are doing <strong>SSB interview preparation</strong> or <strong>AFCAT interview preparation</strong>, one of the most important psychological assessments you must understand is the <strong>Thematic Apperception Test (TAT)</strong>. Along with the <strong>Word Association Test (WAT)</strong> and <strong>Situation Reaction Test (SRT)</strong>, the TAT forms the core of the psychological evaluation in both <strong>SSB</strong> and <strong>AFSB interviews</strong>.</p>

<p>This guide breaks down <em>exactly</em> how SSB psychologists use Murray's TAT, how it connects with WAT/SRT, and how you can prepare effectively—whether you're training through an <strong>SSB preparation academy</strong>, taking <strong>mock interviews</strong>, or studying on your own.</p>

<img src="/tat-test-cards.jpg" alt="TAT Test Cards for SSB Interview" style="width: 100%; max-width: 800px; height: auto; margin: 2rem auto; display: block; border-radius: 8px;" />

<h2>What Is the TAT in SSB?</h2>

<p>The <strong>Thematic Apperception Test</strong> is a projective psychological tool based on <strong>Henry Murray's theory of needs and press</strong>. In the <strong>SSB interview</strong>, TAT is used to understand:</p>

<ul>
<li>Your <em>unconscious motivations</em></li>
<li>Your <em>problem-solving style</em></li>
<li>Your <em>leadership and social behaviour patterns</em></li>
<li>Your <em>ability to handle stress and uncertainty</em></li>
<li>Your <em>compatibility with the Armed Forces Officer profile</em></li>
</ul>

<p>You are shown <strong>12 pictures</strong> (one blank) and told to write a story for each. Psychologists evaluate these stories to understand your <em>real personality</em>, beyond rehearsed answers.</p>

<h2>Why SSB Uses Murray's TAT</h2>

<p>Unlike academic tests, SSB wants to know:</p>

<ul>
<li><strong>How you think</strong>, not just <em>what</em> you think</li>
<li>Your <strong>Officer-Like Qualities (OLQs)</strong> under time pressure</li>
<li>Whether your values, decision-making, and emotional responses fit the military environment</li>
</ul>

<p>The TAT reveals your natural tendencies, not memorised points from coaching.</p>

<p>Psychologists compare your TAT responses with:</p>

<ul>
<li><strong>WAT</strong> (Word Association Test)</li>
<li><strong>SRT</strong> (Situation Reaction Test)</li>
<li><strong>Self-Description Test (SD)</strong></li>
</ul>

<p>This cross-verification ensures authenticity and consistency.</p>

<img src="/ssb-interview-preparation.jpg" alt="SSB Interview Preparation" style="width: 100%; max-width: 800px; height: auto; margin: 2rem auto; display: block; border-radius: 8px;" />

<h2>How Psychologists Evaluate Your TAT Stories</h2>

<p>Psychologists look for:</p>

<h3>✔ 1. Character Initiative</h3>
<p>Do you take responsibility in the story? Officers must be <strong>proactive</strong>.</p>

<h3>✔ 2. Problem-Solving & Planning</h3>
<p>Does the hero act logically and confidently? This reflects your <strong>leadership ability</strong>.</p>

<h3>✔ 3. Emotional Stability</h3>
<p>Do your stories show panic, fear, overthinking, or anger? Indian Armed Forces require <strong>calm decision-makers</strong>.</p>

<h3>✔ 4. Social Effectiveness</h3>
<p>Are you cooperative, empathetic, team-oriented? SSB looks for <strong>team leaders, not lone wolves</strong>.</p>

<h3>✔ 5. Goal Orientation</h3>
<p>Clear goals → clear personality. Vague stories suggest confusion.</p>

<h3>✔ 6. Alignment with OLQs</h3>
<p>Your story should reflect:</p>
<ul>
<li>Responsibility</li>
<li>Courage</li>
<li>Determination</li>
<li>Initiative</li>
<li>Social adjustment</li>
<li>Self-confidence</li>
<li>Planning & organising</li>
</ul>

<h2>How TAT, WAT & SRT Work Together</h2>

<p>SSB psychologists don't judge a single story. They <strong>cross-match your personality</strong> across three tests.</p>

<h3>Example of consistency check:</h3>

<table>
<thead>
<tr>
<th>TAT Hero Behaviour</th>
<th>WAT Response</th>
<th>SRT Reaction</th>
<th>Psychologist Conclusion</th>
</tr>
</thead>
<tbody>
<tr>
<td>Confident leader</td>
<td>Positive associations</td>
<td>Quick, logical reactions</td>
<td>Consistent = Recommended</td>
</tr>
<tr>
<td>Weak leadership</td>
<td>Negative words</td>
<td>Over-reactive</td>
<td>Inconsistent = Not recommended</td>
</tr>
</tbody>
</table>

<p>This is why memorised coaching answers fail—<em>you cannot fake consistency across 200+ responses</em>.</p>

<h2>The Blank Story – The Hardest Part of TAT</h2>

<p>The final slide is blank. This reveals your:</p>

<ul>
<li>Long-term goals</li>
<li>Motivations</li>
<li>Ambitions</li>
<li>Self-image</li>
</ul>

<p>Psychologists use it to understand <em>your true aspirations</em>, especially for <strong>AFCAT AFSB</strong>, <strong>NDA SSB</strong>, <strong>ACC SSB interview</strong>, or <strong>TES entry</strong>.</p>

<h2>How to Prepare for TAT (SSB-Proven Method)</h2>

<p>Whether you're taking coaching in:</p>

<ul>
<li><strong>SSB coaching in Bangalore</strong></li>
<li><strong>SSB coaching in Delhi</strong></li>
<li><strong>SSB coaching near me</strong></li>
<li><strong>SSB preparation academy</strong></li>
<li><strong>AFSB coaching</strong></li>
</ul>

<p>…or preparing at home, follow these steps:</p>

<h3>1. Build Real Personality, Not "SSB Answers"</h3>

<p>SSB selects those who project <em>natural confidence</em>, not memorised content. Work on:</p>

<ul>
<li>Discipline</li>
<li>Communication</li>
<li>Fitness</li>
<li>Responsibility</li>
<li>Positive outlook</li>
</ul>

<h3>2. Practice 20–30 Pictures</h3>

<p>Focus on:</p>

<ul>
<li>Clear goal</li>
<li>Positive action</li>
<li>Resourceful planning</li>
<li>Effective leadership</li>
<li>Social responsibility</li>
</ul>

<h3>3. Analyse Good Model Stories</h3>

<p>Look at how recommended candidates structure their stories:</p>

<ul>
<li>Hero</li>
<li>Problem</li>
<li>Action</li>
<li>Result</li>
<li>Future outlook</li>
</ul>

<h3>4. Use Mock Tests</h3>

<p>An <strong>AFCAT mock interview</strong>, <strong>TAT mock test</strong>, or <strong>SSB interview coaching</strong> can help improve performance by giving realistic feedback.</p>

<h2>TAT in the 5-Day SSB Interview Schedule</h2>

<p>Here's where TAT fits in the famous <strong>5-day SSB interview</strong>:</p>

<h3>Day 1: Screening</h3>
<p>OIR + PPDT (not TAT)</p>

<h3>Day 2: Psychology Tests</h3>
<p>This is when TAT happens. Followed by:</p>
<ul>
<li>WAT</li>
<li>SRT</li>
<li>SD</li>
</ul>

<h3>Day 3 & 4: GTO Tasks</h3>
<p>To verify the personality seen in TAT.</p>

<h3>Day 5: Final Interview & Conference</h3>
<p>Psychologists, GTOs, and Interviewing Officers cross-verify your personality.</p>

<h2>Final Thoughts: TAT Is the Heart of SSB Psychology</h2>

<p>If you want to crack your <strong>SSB interview</strong>, <strong>AFCAT AFSB interview</strong>, or <strong>ACC SSB interview</strong>, understanding TAT is essential.</p>

<p>TAT reveals:</p>

<ul>
<li>Your real thoughts</li>
<li>Your leadership traits</li>
<li>Your OLQs</li>
<li>Your behaviour under stress</li>
<li>Your suitability for the Indian Armed Forces</li>
</ul>

<p>With the right <strong>SSB preparation</strong>, <strong>mock interviews</strong>, and consistent practice, you can master it.</p>`;

      const { error } = await supabase
        .from("blog_posts" as any)
        .update({
          content: updatedContent,
          featured_image_url: "/tat-test-cards.jpg",
        })
        .eq("slug", "tat-test-indian-ssb-complete-guide");

      if (error) throw error;

      toast.success("Blog post updated successfully!");
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Failed to update blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Update Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will update the TAT blog post to remove the keywords section
            and add images.
          </p>
          <Button onClick={updateBlogPost} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Blog Post"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
