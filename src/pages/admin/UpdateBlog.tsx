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
      const updatedContent = `<h1>How the Thematic Apperception Test (TAT) Is Used in the Indian SSB</h1>

<p>The Thematic Apperception Test (TAT) is one of the most critical psychological assessments in the SSB interview process. If you're preparing for your SSB or AFSB interview, understanding how TAT works and what psychologists look for can significantly improve your performance.</p>

<p>In this comprehensive guide, we'll explore the science behind TAT, how it's evaluated, and proven strategies to excel in this crucial test.</p>

<img src="/tat-test-cards.jpg" alt="TAT Test Cards for SSB Interview" style="width: 100%; max-width: 800px; height: auto; margin: 2rem auto; display: block; border-radius: 8px;" />

<h2>Understanding the TAT: What It Really Measures</h2>

<p>The Thematic Apperception Test was developed by psychologist Henry Murray in the 1930s based on his theory of personality needs and environmental pressures. In the SSB context, TAT serves as a window into your unconscious mind, revealing:</p>

<ul>
<li><strong>Your natural leadership tendencies</strong> – How you approach challenges and influence others</li>
<li><strong>Problem-solving approach</strong> – Your ability to think logically under time constraints</li>
<li><strong>Emotional maturity</strong> – How you handle stress, setbacks, and uncertainty</li>
<li><strong>Social awareness</strong> – Your understanding of human dynamics and relationships</li>
<li><strong>Value system</strong> – The principles that guide your decisions</li>
</ul>

<p>During the test, you'll be shown 12 ambiguous images (including one blank slide) for 30 seconds each. You then have 4 minutes to write a story about each image, answering: What is happening? What led to this? What are the characters thinking and feeling? What will happen next?</p>

<h2>Why the Indian Armed Forces Use TAT</h2>

<p>The military environment demands officers who can make quick decisions under pressure, lead diverse teams, and maintain composure in challenging situations. Unlike academic tests that measure what you know, TAT reveals <em>who you are</em>.</p>

<p>Traditional interviews can be rehearsed. People can memorize answers and present an artificial persona. But TAT, being projective in nature, bypasses conscious defenses. When you create stories spontaneously, you unconsciously project your own personality traits, motivations, and thought patterns onto the characters.</p>

<p>The beauty of TAT is that there are no "right" or "wrong" answers. What matters is consistency, authenticity, and alignment with Officer-Like Qualities (OLQs).</p>

<img src="/ssb-interview-preparation.jpg" alt="SSB Interview Preparation" style="width: 100%; max-width: 800px; height: auto; margin: 2rem auto; display: block; border-radius: 8px;" />

<h2>How SSB Psychologists Evaluate Your TAT Stories</h2>

<p>Psychologists don't read your stories looking for specific plots or themes. Instead, they analyze the underlying patterns in your narrative choices. Here's what they examine:</p>

<h3>Character Agency and Initiative</h3>
<p>Does your protagonist take charge of situations, or do they wait for others to solve problems? Officers must be proactive decision-makers who take responsibility for outcomes.</p>

<p><strong>Strong indicator:</strong> "Rahul noticed the bridge was damaged. He immediately assessed the situation, gathered his team, and formulated a plan to build a temporary crossing using available resources."</p>

<p><strong>Weak indicator:</strong> "Rahul saw the broken bridge. He felt worried and hoped someone would come to help them."</p>

<h3>Problem-Solving Approach</h3>
<p>Do your characters approach challenges systematically, or do they react impulsively? Military leaders need structured thinking and the ability to plan under pressure.</p>

<p><strong>Look for:</strong> Clear problem identification → Logical analysis → Practical solution → Implementation → Follow-through</p>

<h3>Emotional Intelligence</h3>
<p>How do your characters handle setbacks? Do they panic, blame others, or maintain composure? The Armed Forces need emotionally stable officers who can manage stress and support their team during difficult times.</p>

<p><strong>Positive traits:</strong> Resilience, optimism, calmness, empathy, self-control</p>
<p><strong>Red flags:</strong> Excessive anger, fear, anxiety, helplessness, or aggression</p>

<h3>Social Effectiveness</h3>
<p>Are your characters collaborative team players or isolated individuals? Modern military operations require officers who can work effectively with diverse teams, build consensus, and motivate others.</p>

<p><strong>Strong stories show:</strong> Cooperation, mentoring, conflict resolution, team coordination, and mutual support</p>

<h3>Goal Orientation and Clarity</h3>
<p>Do your characters have clear objectives, or do they drift without purpose? Effective officers have clarity of purpose and work systematically toward meaningful goals.</p>

<p>Vague, meandering stories often indicate confused thinking or lack of direction. Strong stories have a clear beginning, middle, and end with purposeful action throughout.</p>

<h3>Alignment with Officer-Like Qualities</h3>
<p>Your stories should naturally reflect the 15 OLQs assessed by SSB:</p>

<ul>
<li>Effective Intelligence</li>
<li>Reasoning Ability</li>
<li>Organizing Ability</li>
<li>Power of Expression</li>
<li>Social Adjustment</li>
<li>Cooperation</li>
<li>Sense of Responsibility</li>
<li>Initiative</li>
<li>Self-Confidence</li>
<li>Speed of Decision</li>
<li>Ability to Influence the Group</li>
<li>Liveliness</li>
<li>Determination</li>
<li>Courage</li>
<li>Stamina</li>
</ul>

<h2>The Cross-Verification Process: TAT, WAT, and SRT</h2>

<p>Here's a crucial insight: SSB psychologists never evaluate TAT in isolation. They cross-reference your TAT stories with:</p>

<ul>
<li><strong>Word Association Test (WAT):</strong> Your immediate associations with 60 words</li>
<li><strong>Situation Reaction Test (SRT):</strong> Your responses to 60 hypothetical situations</li>
<li><strong>Self-Description (SD):</strong> How you describe yourself and how others see you</li>
</ul>

<p>This multi-test approach creates a comprehensive personality profile. If you show confident leadership in TAT but negative, fearful responses in WAT, the inconsistency raises questions about authenticity.</p>

<h3>Example of Consistency Analysis:</h3>

<table>
<thead>
<tr>
<th>TAT Pattern</th>
<th>WAT Responses</th>
<th>SRT Reactions</th>
<th>Assessment Outcome</th>
</tr>
</thead>
<tbody>
<tr>
<td>Proactive problem-solver</td>
<td>Positive, action-oriented words</td>
<td>Quick, practical solutions</td>
<td><strong>Consistent Profile</strong> → Strong Recommendation</td>
</tr>
<tr>
<td>Passive, dependent characters</td>
<td>Negative associations</td>
<td>Blame-oriented responses</td>
<td><strong>Consistent Profile</strong> → Not Recommended</td>
</tr>
<tr>
<td>Confident leadership</td>
<td>Fear-based associations</td>
<td>Avoidance behaviors</td>
<td><strong>Inconsistent</strong> → Needs Further Evaluation</td>
</tr>
</tbody>
</table>

<p>This is why memorized "SSB stories" don't work. You cannot maintain consistency across 200+ spontaneous responses unless the patterns genuinely reflect your personality.</p>

<h2>The Blank Slide: Your True Self Revealed</h2>

<p>The 12th and final TAT image is completely blank. This is perhaps the most revealing slide because without any visual prompts, your story comes entirely from your inner world.</p>

<p>This blank slide reveals:</p>

<ul>
<li><strong>Your aspirations:</strong> What you naturally think about and dream of achieving</li>
<li><strong>Your values:</strong> What matters most to you when there are no external influences</li>
<li><strong>Your self-concept:</strong> How you see yourself and your potential</li>
<li><strong>Your motivations:</strong> What drives you at a fundamental level</li>
</ul>

<p>Strong candidates often use this slide to express genuine military aspirations, social service goals, or personal growth narratives. Weak responses tend to be vague, fantastical, or disconnected from reality.</p>

<h2>Proven Preparation Strategies for TAT Success</h2>

<p>Here's how to prepare effectively for TAT, whether you're training with a coaching academy or preparing independently:</p>

<h3>1. Develop Genuine OLQs, Don't Fake Them</h3>

<p>The biggest mistake candidates make is trying to "act" like an officer during SSB. Psychologists can spot artificial behavior instantly. Instead, spend months before your SSB developing authentic Officer-Like Qualities:</p>

<ul>
<li><strong>Take on leadership roles:</strong> Volunteer to organize events, lead projects, or mentor juniors</li>
<li><strong>Build decision-making skills:</strong> Put yourself in situations requiring quick judgment</li>
<li><strong>Develop fitness and discipline:</strong> Regular physical training builds mental toughness</li>
<li><strong>Expand your awareness:</strong> Read news, understand social issues, develop opinions</li>
<li><strong>Practice responsibility:</strong> Take ownership of outcomes in your daily life</li>
</ul>

<h3>2. Practice with Diverse Images</h3>

<p>Practice writing 4-minute stories for at least 30-40 different images. Focus on:</p>

<ul>
<li>Clear protagonist with agency</li>
<li>Realistic, solvable problems</li>
<li>Practical solutions with available resources</li>
<li>Positive outcomes through effort</li>
<li>Social consciousness and responsibility</li>
</ul>

<h3>3. Analyze Your Story Patterns</h3>

<p>After writing 10-15 practice stories, review them objectively:</p>

<ul>
<li>Are your characters proactive or reactive?</li>
<li>Do you focus on problems or solutions?</li>
<li>Are your stories realistic or fantastical?</li>
<li>Do you show teamwork or individual heroism?</li>
<li>What emotions dominate your narratives?</li>
</ul>

<p>This self-analysis helps you understand your natural tendencies and work on areas needing improvement.</p>

<h3>4. Time Your Responses</h3>

<p>Practice writing complete stories in exactly 4 minutes. This trains you to:</p>

<ul>
<li>Organize thoughts quickly</li>
<li>Write concisely without sacrificing completeness</li>
<li>Manage time pressure effectively</li>
<li>Avoid incomplete narratives</li>
</ul>

<h3>5. Get Objective Feedback</h3>

<p>Have someone knowledgeable review your practice stories. Professional feedback from experienced instructors can identify patterns you might miss. Many candidates benefit from mock psychological tests that simulate the actual SSB environment.</p>

<h2>TAT in the 5-Day SSB Process</h2>

<p>Understanding where TAT fits in the overall SSB schedule helps you prepare mentally:</p>

<h3>Day 1: Screening</h3>
<p>Officer Intelligence Rating (OIR) test and Picture Perception & Description Test (PPDT). Only those who clear screening proceed to the remaining days.</p>

<h3>Day 2: Psychological Testing</h3>
<p>This is when TAT happens, usually in the morning session. The same day includes WAT, SRT, and Self-Description. All these tests contribute to your psychological profile.</p>

<h3>Day 3-4: Group Testing</h3>
<p>Group Testing Officer (GTO) tasks verify the personality traits observed in your psychological tests through practical group activities.</p>

<h3>Day 5: Interview and Conference</h3>
<p>The Interviewing Officer discusses your background, and the final conference decides your recommendation based on all assessments.</p>

<h2>Common TAT Mistakes to Avoid</h2>

<h3>1. Writing Unrealistic Stories</h3>
<p>Avoid supernatural elements, excessive coincidences, or impossible solutions. Keep your stories grounded in reality.</p>

<h3>2. Making Characters Passive</h3>
<p>If your protagonist is always being helped by others or waiting for circumstances to change, it reflects poor leadership qualities.</p>

<h3>3. Overusing Negative Emotions</h3>
<p>Occasional challenges are fine, but stories dominated by fear, anger, or helplessness suggest emotional instability.</p>

<h3>4. Ignoring Social Context</h3>
<p>Stories where characters only think about themselves miss the cooperative aspect essential for military leadership.</p>

<h3>5. Incomplete Narratives</h3>
<p>Ensure your story has a clear beginning, middle, and end. Rushed or incomplete stories indicate poor planning or time management.</p>

<h2>Final Thoughts</h2>

<p>The TAT is not a test you can "crack" through shortcuts or memorized techniques. It's a genuine assessment of your personality, values, and suitability for military leadership. The best preparation is authentic personal development over months or years.</p>

<p>Focus on becoming the kind of person the Armed Forces need: confident but humble, decisive but thoughtful, strong but compassionate. When these qualities become part of your genuine personality, they'll naturally appear in your TAT stories—and throughout your SSB performance.</p>

<p>Remember: The SSB doesn't look for perfect candidates; it looks for genuine candidates with officer potential. Be yourself, but be the best version of yourself.</p>

<p><strong>Ready to start your SSB preparation journey?</strong> Practice consistently, stay authentic, and approach the process with dedication and honesty. Success in SSB comes to those who prepare not just their answers, but their character.</p>`;

      const { error } = await supabase
        .from("blog_posts" as any)
        .update({
          content: updatedContent,
          featured_image_url: "/tat-test-cards.jpg",
          excerpt: "Discover how SSB psychologists use the Thematic Apperception Test to assess your personality, leadership potential, and Officer-Like Qualities. Learn proven strategies to excel in TAT with authentic preparation.",
          meta_description: "Comprehensive guide to TAT in SSB interviews. Understand how psychologists evaluate your stories, what they look for, and proven strategies to prepare effectively for this crucial psychological assessment."
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
