import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Target, RefreshCw, ChevronDown, ChevronUp, Lightbulb, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
}

export const SSBQuestionsCard = ({ testSessionId, analysisId }: SSBQuestionsCardProps) => {
  const [questions, setQuestions] = useState<SSBQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchQuestions = async (forceRegenerate = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-ssb-questions', {
        body: { 
          test_session_id: testSessionId, 
          analysis_id: analysisId,
          force_regenerate: forceRegenerate 
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setQuestions(data.questions);
      if (forceRegenerate) {
        toast.success('New SSB questions generated successfully!');
      }
    } catch (err: any) {
      console.error('Error fetching SSB questions:', err);
      const errorMessage = err.message || 'Failed to load SSB questions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [testSessionId, analysisId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center space-y-1">
            <p className="font-medium">Generating personalized SSB questions...</p>
            <p className="text-sm text-muted-foreground">
              Analyzing your psychological profile to create targeted questions
            </p>
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
          onClick={() => fetchQuestions(true)}
          disabled={loading}
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
