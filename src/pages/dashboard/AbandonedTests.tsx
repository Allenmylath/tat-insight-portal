import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, Calendar, Loader2, FileText } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PreviewBanner } from "@/components/PreviewBanner";
import { useUser } from "@clerk/clerk-react";

const AbandonedTests = () => {
  const { isPro, userData, loading: userLoading } = useUserData();
  const { isSignedIn } = useUser();

  const { data: abandonedTests, isLoading } = useQuery({
    queryKey: ['abandoned-tests', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data, error } = await supabase
        .from('test_sessions')
        .select(`
          id,
          completed_at,
          session_duration_seconds,
          story_content,
          tattest_id,
          tattest:tattest_id (
            id,
            title,
            description,
            image_url
          )
        `)
        .eq('user_id', userData.id)
        .eq('status', 'abandoned')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching abandoned tests:', error);
        return [];
      }

      return data.map(session => ({
        id: session.id,
        testId: session.tattest_id,
        title: session.tattest?.title || 'Test No Longer Available',
        description: session.tattest?.description || '',
        imageUrl: session.tattest?.image_url || '',
        abandonedAt: session.completed_at,
        storyLength: session.story_content?.length || 0,
        duration: session.session_duration_seconds 
          ? `${Math.round(session.session_duration_seconds / 60)} minutes`
          : 'Unknown duration',
        isPremium: false,
        sessionId: session.id
      }));
    },
    enabled: !!userData?.id && !userLoading,
  });

  const visibleTests = isPro ? (abandonedTests || []) : (abandonedTests || []).filter(test => !test.isPremium);

  return (
    <div className="space-y-6">
      {!isSignedIn && <PreviewBanner />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Abandoned Tests</h1>
          <p className="text-muted-foreground">
            Tests that were started but not completed
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <XCircle className="h-4 w-4" />
          {visibleTests.length} Abandoned
        </Badge>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="font-medium text-foreground mb-2">Loading Tests</h3>
              <p className="text-sm text-muted-foreground">
                Fetching your abandoned tests...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : visibleTests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Abandoned Tests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't abandoned any tests yet
              </p>
              <Button variant="hero" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {visibleTests.map((test) => (
            <Card key={test.id} className="shadow-elegant">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {test.imageUrl && (
                      <img 
                        src={test.imageUrl} 
                        alt={test.title}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    )}
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-destructive" />
                        {test.title}
                        {test.isPremium && (
                          <Badge variant="secondary" className="text-xs">Pro</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {test.abandonedAt ? new Date(test.abandonedAt).toLocaleDateString() : 'Unknown date'}
                        </span>
                        <span>Duration: {test.duration}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Abandoned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {test.storyLength > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Story Progress
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {test.storyLength} characters written before abandoning
                    </p>
                  </div>
                )}
                {test.testId !== test.title && (
                  <div className="flex gap-2">
                    <Button 
                      variant="government" 
                      size="sm"
                      onClick={() => {
                        window.location.href = `/test/${test.testId}`;
                      }}
                    >
                      Retry Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AbandonedTests;
