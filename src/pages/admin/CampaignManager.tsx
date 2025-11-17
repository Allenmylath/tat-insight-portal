import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Send, Users, Target } from "lucide-react";
import { CreateCampaignForm } from "@/components/admin/CreateCampaignForm";
import { CampaignList } from "@/components/admin/CampaignList";
import { Badge } from "@/components/ui/badge";

export default function CampaignManager() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: audienceStats } = useQuery({
    queryKey: ['test-completers-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_completers')
        .select('*')
        .eq('is_free_user', true);
      
      if (error) throw error;

      const hotLeads = data.filter(u => u.lead_status === 'hot_lead').length;
      const warmLeads = data.filter(u => u.lead_status === 'warm_lead').length;
      const coldLeads = data.filter(u => u.lead_status === 'cold_lead').length;

      return {
        total: data.length,
        hotLeads,
        warmLeads,
        coldLeads,
      };
    },
  });

  const totalSent = campaigns?.reduce((sum, c) => sum + (c.total_sent || 0), 0) || 0;
  const totalConverted = campaigns?.reduce((sum, c) => sum + (c.total_converted || 0), 0) || 0;
  const conversionRate = totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : '0';

  if (showCreateForm) {
    return (
      <div className="container mx-auto py-8">
        <Button 
          variant="outline" 
          onClick={() => setShowCreateForm(false)}
          className="mb-4"
        >
          ← Back to Campaigns
        </Button>
        <CreateCampaignForm onSuccess={() => setShowCreateForm(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Email Campaign Manager</h1>
          <p className="text-muted-foreground">
            Convert free users to paid customers with targeted email campaigns
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns?.filter(c => c.status === 'sent').length || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Emails delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConverted}</div>
            <p className="text-xs text-muted-foreground">{conversionRate}% conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Audience</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audienceStats?.total || 0}</div>
            <div className="flex gap-1 mt-1">
              <Badge variant="default" className="text-xs">Hot: {audienceStats?.hotLeads || 0}</Badge>
              <Badge variant="secondary" className="text-xs">Warm: {audienceStats?.warmLeads || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>Manage and track all email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignList campaigns={campaigns || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}