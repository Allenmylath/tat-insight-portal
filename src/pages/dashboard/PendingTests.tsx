import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, Lock, Crown, Image } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const PendingTests = () => {
  const { isPro } = useUserData();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data, error } = await supabase
          .from('tattest')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tests:', error);
          return;
        }

        // Transform database data to match component expectations
        const transformedTests = data?.map((test) => ({
          id: test.id,
          title: test.title,
          description: test.description || `Complete this TAT assessment: ${test.prompt_text?.substring(0, 100)}...`,
          estimatedTime: "10-15 minutes",
          difficulty: "Intermediate",
          isPremium: false,
          imageUrl: test.image_url
        })) || [];

        setTests(transformedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const availableTests = isPro ? tests : tests.filter(test => !test.isPremium);
  const lockedTests = isPro ? [] : tests.filter(test => test.isPremium);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-orange-100 text-orange-800";
      case "Expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Tests</h1>
          <p className="text-muted-foreground">
            Continue your psychological assessment journey
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Clock className="h-4 w-4" />
          {availableTests.length} Available
        </Badge>
      </div>

      {/* Available Tests */}
      {availableTests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Ready to Take</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {availableTests.map((test) => (
              <Card key={test.id} className="shadow-elegant hover:shadow-lg transition-shadow">
                <div className="flex gap-4 p-6">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {test.imageUrl ? (
                      <img 
                        src={test.imageUrl} 
                        alt={test.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        {test.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{test.description}</CardDescription>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated time: {test.estimatedTime}</span>
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <Button variant="hero" className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Start Test
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Tests for Free Users */}
      {lockedTests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pro Tests</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Unlock
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {lockedTests.map((test) => (
              <Card key={test.id} className="shadow-elegant opacity-75 border-dashed">
                <div className="flex gap-4 p-6">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                    {test.imageUrl ? (
                      <img 
                        src={test.imageUrl} 
                        alt={test.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                        {test.title}
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">{test.description}</CardDescription>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated time: {test.estimatedTime}</span>
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full gap-2" disabled>
                      <Lock className="h-4 w-4" />
                      Requires Pro
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && availableTests.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Tests Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {tests.length === 0 ? "No tests have been created yet." : "All tests have been completed!"}
              </p>
              {!isPro && tests.length > 0 && (
                <Button variant="hero" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade for More Tests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-elegant">
              <div className="flex gap-4 p-6">
                <div className="w-16 h-16 bg-muted rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTests;