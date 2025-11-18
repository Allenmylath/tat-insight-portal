import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { TatTestInterface } from "@/components/TatTestInterface";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/useUserData";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

const StandaloneTestPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const { userData } = useUserData();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId || !userData?.id) return;
    
    const fetchTest = async () => {
      try {
        const { data: testData, error: testError } = await supabase
          .from('tattest')
          .select('*')
          .eq('id', testId)
          .eq('is_active', true)
          .single();

        if (testError) {
          throw new Error('Test not found or inactive');
        }

        setTest({
          id: testData.id,
          title: testData.title,
          description: testData.description,
          image_url: testData.image_url,
          prompt_text: testData.prompt_text
        });
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, userData?.id]);

  const handleTestComplete = () => {
    // Close the window or redirect to dashboard
    if (window.opener) {
      window.close();
    } else {
      window.location.href = "/dashboard/attempted?success=true";
    }
  };

  const handleTestAbandon = () => {
    // Close the window or redirect to dashboard  
    if (window.opener) {
      window.close();
    } else {
      window.location.href = "/dashboard/pending";
    }
  };

  if (!testId) {
    return <Navigate to="/dashboard/pending" replace />;
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading test...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Error Loading Test</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <button 
                    onClick={() => window.close()}
                    className="text-primary hover:underline"
                  >
                    Close Window
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {test && !loading && !error && (
            <TatTestInterface
              test={test}
              onComplete={handleTestComplete}
              onAbandon={handleTestAbandon}
            />
          )}
        </div>
      </div>
    </SignedIn>
  );
};

export default StandaloneTestPage;