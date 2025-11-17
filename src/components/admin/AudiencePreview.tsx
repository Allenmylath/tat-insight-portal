import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award } from "lucide-react";

interface AudiencePreviewProps {
  minTests?: number;
  maxDaysSinceTest?: number;
  leadStatus?: string[];
}

export function AudiencePreview({ minTests, maxDaysSinceTest, leadStatus }: AudiencePreviewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['audience-preview', minTests, maxDaysSinceTest, leadStatus],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-campaign-audience', {
        body: {
          targetAudience: {
            is_free_user: true,
            min_tests: minTests,
            max_days_since_test: maxDaysSinceTest,
            lead_status: leadStatus,
          },
        },
      });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Target Audience Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Target Audience Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Recipients:</span>
          <Badge variant="default" className="text-lg px-3 py-1">
            {data?.count || 0}
          </Badge>
        </div>

        {data?.stats && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">By Lead Status:</p>
              <div className="flex gap-2 flex-wrap">
                {data.stats.by_lead_status.hot_lead > 0 && (
                  <Badge variant="default">
                    <Award className="h-3 w-3 mr-1" />
                    Hot: {data.stats.by_lead_status.hot_lead}
                  </Badge>
                )}
                {data.stats.by_lead_status.warm_lead > 0 && (
                  <Badge variant="secondary">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Warm: {data.stats.by_lead_status.warm_lead}
                  </Badge>
                )}
                {data.stats.by_lead_status.cold_lead > 0 && (
                  <Badge variant="outline">
                    Cold: {data.stats.by_lead_status.cold_lead}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Avg. Tests</p>
                <p className="text-lg font-semibold">{data.stats.avg_tests.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Credits</p>
                <p className="text-lg font-semibold">{Math.round(data.stats.avg_credits)}</p>
              </div>
            </div>
          </>
        )}

        {data?.users && data.users.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Sample Recipients:</p>
            <div className="space-y-1">
              {data.users.slice(0, 5).map((user: any) => (
                <div key={user.user_id} className="text-xs text-muted-foreground flex justify-between">
                  <span>{user.email}</span>
                  <Badge variant="outline" className="text-xs">{user.lead_status}</Badge>
                </div>
              ))}
              {data.users.length > 5 && (
                <p className="text-xs text-muted-foreground italic">
                  + {data.users.length - 5} more recipients
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}