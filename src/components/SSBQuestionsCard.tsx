import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Target, RefreshCw, ChevronDown, ChevronUp, Lightbulb, AlertCircle, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserData } from "@/hooks/useUserData";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";

interface SSBQuestion {
  category: string;
  question: string;
  psychological_basis: string;
  what_to_listen_for: string;
  follow_up_if_evasive: string;
}

interface SSBQuestionsCardProps {
  testSessionId: string;
  analysisId: string;
  isPro: boolean;
}

export const SSBQuestionsCard = ({ testSessionId, analysisId, isPro }: SSBQuestionsCardProps) => {
  const [questions, setQuestions] = useState<SSBQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { userData } = useUserData();

  // If not Pro, show upgrade UI
  if (!isPro) {
    return (
      <>
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">SSB Interview Questions</CardTitle>
            <CardDescription className="text-base mt-2">
              Get 6-8 personalized SSB interview questions based on your psychological profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-semibold mb-2 text-sm">🎯 Leadership</h4>
                <p className="text-xs text-muted-foreground">Questions tailored to assess your leadership potential and decision-making abilities</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-semibold mb-2 text-sm">🧠 Psychological Basis</h4>
                <p className="text-xs text-muted-foreground">Each question comes with psychological reasoning for the interviewer's focus</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-semibold mb-2 text-sm">💡 Preparation Tips</h4>
                <p className="text-xs text-muted-foreground">Detailed guidance on what the interviewer is looking for in your answers</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <h4 className="font-semibold mb-2 text-sm">🔄 Follow-ups</h4>
                <p className="text-xs text-muted-foreground">Potential follow-up questions to help you prepare comprehensively</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Button 
                onClick={() => setShowUpgradeModal(true)} 
                size="lg"
                className="gap-2 px-8"
              >
                <Sparkles className="h-5 w-5" />
                Upgrade to Pro - ₹500/month
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Join over 500+ Pro members preparing for their SSB interviews
              </p>
            </div>
          </CardContent>
        </Card>
        <ProUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      </>
    );
  }

  const startPolling = () => {
    let pollCount = 0;
    const maxPolls = 40; // 40 polls * 3 seconds = 2 minutes max
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const { data: analysisData, error } = await supabase
          .from('analysis_results')
          .select('ssb_questions, ssb_questions_generated_at')
          .eq('id', analysisId)
          .single();

        if (error) throw error;

        if (analysisData?.ssb_questions) {
          console.log('SSB questions received via polling');
          setQuestions(analysisData.ssb_questions as unknown as SSBQuestion[]);
          setGenerating(false);
          setLoading(false);
          clearInterval(pollInterval);
          
          // Clear the generation flag
          await supabase
            .from('analysis_results')
            .update({
              ssb_generation_in_progress: false,
              ssb_generation_started_at: null
            })
            .eq('id', analysisId);
          
          toast.success('SSB questions are ready!');
        } else if (pollCount >= maxPolls) {
          console.warn('Polling timeout reached');
          clearInterval(pollInterval);
          setGenerating(false);
          setLoading(false);
          
          // Clear the generation flag on timeout
          await supabase
            .from('analysis_results')
            .update({
              ssb_generation_in_progress: false,
              ssb_generation_started_at: null
            })
            .eq('id', analysisId);
          
          setError('Generation is taking longer than expected. Click "Regenerate" to try again.');
          toast.error('Generation timeout. Please use the Regenerate button.');
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        // Don't clear the interval on polling errors, just log and continue
      }
    }, 3000);
  };

  const triggerGeneration = async () => {
    try {
      // First, set the flag in the database to indicate generation has started
      const { error: updateError } = await supabase
        .from('analysis_results')
        .update({
          ssb_generation_in_progress: true,
          ssb_generation_started_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      if (updateError) {
        console.error('Error setting generation flag:', updateError);
        throw updateError;
      }

      console.log('SSB generation flag set, invoking edge function...');
      setGenerating(true);
      setLoading(false);
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'generate-ssb-questions',
        {
          body: {
            test_session_id: testSessionId,
            analysis_id: analysisId,
            user_id: userData.clerk_id,
            force_regenerate: false
          }
        }
      );

      if (functionError) {
        console.error('Generation trigger error:', functionError);
        // Clear the flag on error
        await supabase
          .from('analysis_results')
          .update({
            ssb_generation_in_progress: false,
            ssb_generation_started_at: null
          })
          .eq('id', analysisId);
        throw functionError;
      }
      
      if (data?.error) {
        // Clear the flag on error
        await supabase
          .from('analysis_results')
          .update({
            ssb_generation_in_progress: false,
            ssb_generation_started_at: null
          })
          .eq('id', analysisId);
        throw new Error(data.error);
      }

      if (data?.questions) {
        setQuestions(data.questions);
        setGenerating(false);
        toast.success('SSB questions are ready!');
        return;
      }

      console.log('Generation started, polling for results...');
      startPolling();
      
    } catch (err: any) {
      console.error('Error triggering SSB generation:', err);
      setError(err.message || 'Failed to generate questions');
      setGenerating(false);
      
      // Make sure to clear the flag on any error
      await supabase
        .from('analysis_results')
        .update({
          ssb_generation_in_progress: false,
          ssb_generation_started_at: null
        })
        .eq('id', analysisId);
      
      toast.error('Failed to generate questions. Try regenerating.');
    }
  };

  const fetchQuestions = async () => {
    if (!userData?.clerk_id || !analysisId) {
      console.log('Missing user data or analysis ID');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching SSB questions for analysis:', analysisId);
      
      // Fetch analysis result with generation state
      const { data: analysisData, error } = await supabase
        .from('analysis_results')
        .select('ssb_questions, ssb_questions_generated_at, ssb_generation_in_progress, ssb_generation_started_at')
        .eq('id', analysisId)
        .single();

      if (error) {
        console.error('Error fetching analysis:', error);
        throw error;
      }

      // Check if generation is already in progress
      if (analysisData?.ssb_generation_in_progress) {
        console.log('SSB generation already in progress, starting polling...');
        
        // Check if it's been running for too long (more than 5 minutes)
        const startedAt = analysisData.ssb_generation_started_at 
          ? new Date(analysisData.ssb_generation_started_at) 
          : null;
        
        if (startedAt && (Date.now() - startedAt.getTime()) > 5 * 60 * 1000) {
          // Reset the stuck generation
          console.warn('SSB generation appears stuck, resetting...');
          await supabase
            .from('analysis_results')
            .update({
              ssb_generation_in_progress: false,
              ssb_generation_started_at: null
            })
            .eq('id', analysisId);
          
          toast.info('Previous generation timed out. Starting fresh...');
          await triggerGeneration();
          return;
        }
        
        toast.info('SSB questions are being generated...');
        setLoading(false);
        startPolling();
        return;
      }

      // Check if questions already exist
      if (analysisData?.ssb_questions && Array.isArray(analysisData.ssb_questions)) {
        console.log('SSB questions found:', analysisData.ssb_questions.length);
        setQuestions(analysisData.ssb_questions as unknown as SSBQuestion[]);
        setLoading(false);
        return;
      }

      // No questions and not generating - trigger generation
      console.log('No SSB questions found, triggering generation...');
      await triggerGeneration();
      
    } catch (err: any) {
      console.error('Error in fetchQuestions:', err);
      setError(err.message || 'Failed to load questions');
      setLoading(false);
    }
  };

  const regenerateQuestions = async () => {
    // Check if generation is already in progress
    const { data: currentState } = await supabase
      .from('analysis_results')
      .select('ssb_generation_in_progress')
      .eq('id', analysisId)
      .single();

    if (currentState?.ssb_generation_in_progress) {
      toast.info('SSB questions are already being generated. Please wait...');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Set the flag in the database
      const { error: updateError } = await supabase
        .from('analysis_results')
        .update({
          ssb_generation_in_progress: true,
          ssb_generation_started_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      if (updateError) {
        console.error('Error setting generation flag:', updateError);
        throw updateError;
      }

      console.log('Regenerating SSB questions with force_regenerate=true');
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'generate-ssb-questions',
        {
          body: {
            test_session_id: testSessionId,
            analysis_id: analysisId,
            force_regenerate: true,
            user_id: userData.clerk_id
          }
        }
      );

      if (functionError) {
        console.error('Regenerate error:', functionError);
        await supabase
          .from('analysis_results')
          .update({
            ssb_generation_in_progress: false,
            ssb_generation_started_at: null
          })
          .eq('id', analysisId);
        throw functionError;
      }
      
      if (data.error) {
        await supabase
          .from('analysis_results')
          .update({
            ssb_generation_in_progress: false,
            ssb_generation_started_at: null
          })
          .eq('id', analysisId);
        throw new Error(data.error);
      }

      setQuestions(data.questions);
      toast.success('New SSB questions generated!');
    } catch (err: any) {
      console.error('Error regenerating questions:', err);
      setError(err.message || 'Failed to regenerate questions');
      
      // Clear flag on error
      await supabase
        .from('analysis_results')
        .update({
          ssb_generation_in_progress: false,
          ssb_generation_started_at: null
        })
        .eq('id', analysisId);
      
      toast.error(err.message || 'Failed to regenerate questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.clerk_id) {
      fetchQuestions();
    }
  }, [testSessionId, analysisId, userData?.clerk_id]);

  if (loading && !generating) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center space-y-1">
            <p className="font-medium">Loading SSB questions...</p>
            <p className="text-sm text-muted-foreground">
              Fetching your personalized interview questions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generating) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="font-semibold text-lg">Generating Your Personalized SSB Questions</p>
            <p className="text-sm text-muted-foreground">
              Our AI is analyzing your psychological profile to create tailored interview questions...
            </p>
            <p className="text-xs text-muted-foreground">
              This usually takes 10-30 seconds
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={regenerateQuestions}
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchQuestions()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, SSBQuestion[]>);

  const categoryColors: Record<string, string> = {
    'Leadership': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    'Decision Making': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    'Stress Management': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    'Team Dynamics': 'bg-green-500/10 text-green-700 dark:text-green-400',
    'Self Awareness': 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
    'Planning & Organization': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Possible SSB Interview Questions</h3>
          <p className="text-sm text-muted-foreground">
            Based on your psychological profile from TAT analysis
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={regenerateQuestions}
          disabled={loading || generating}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription className="text-sm">
          These questions are designed to probe the psychological patterns identified in your TAT story. 
          The interviewer won't reference your story directly - they'll ask general situational questions 
          to test consistency and explore your personality traits.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{category}</CardTitle>
                <Badge variant="secondary" className={categoryColors[category]}>
                  {categoryQuestions.length} {categoryQuestions.length === 1 ? 'question' : 'questions'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {categoryQuestions.map((q, idx) => {
                const globalIdx = questions.indexOf(q);
                const isExpanded = expandedIndex === globalIdx;
                
                return (
                  <div 
                    key={idx} 
                    className="border-l-2 border-primary/30 pl-4 space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-foreground leading-relaxed">
                        {q.question}
                      </p>
                      
                      <div className="flex items-start gap-2 text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Why this question: </span>
                          {q.psychological_basis}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedIndex(isExpanded ? null : globalIdx)}
                      className="text-xs h-8"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Hide Preparation Guide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show Preparation Guide
                        </>
                      )}
                    </Button>
                    
                    {isExpanded && (
                      <div className="bg-primary/5 border border-primary/10 p-4 rounded-md space-y-3 animate-in slide-in-from-top-2">
                        <div>
                          <p className="font-medium text-primary text-sm mb-2">
                            What to Listen For:
                          </p>
                          <p className="text-sm text-foreground/90">
                            {q.what_to_listen_for}
                          </p>
                        </div>
                        
                        <div className="pt-2 border-t border-primary/10">
                          <p className="font-medium text-primary text-sm mb-2">
                            If You Give a Vague Answer, Expect:
                          </p>
                          <p className="text-sm text-foreground/90 italic">
                            "{q.follow_up_if_evasive}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Pro Tip:</strong> Practice answering these questions with specific examples from your life. 
          The interviewer is looking for genuine responses that show self-awareness, consistency, and the ability 
          to reflect on your experiences.
        </AlertDescription>
      </Alert>
    </div>
  );
};
