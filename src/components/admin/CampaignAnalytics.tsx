import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Mail, Eye, MousePointer, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function CampaignAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: sends } = useQuery({
    queryKey: ['campaign-sends', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_sends')
        .select('*')
        .eq('campaign_id', id)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!campaign) {
    return <div className="container mx-auto py-8">Campaign not found</div>;
  }

  const openRate = campaign.total_sent > 0 
    ? ((campaign.total_opened / campaign.total_sent) * 100).toFixed(1) 
    : '0';
  const clickRate = campaign.total_sent > 0 
    ? ((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1) 
    : '0';
  const conversionRate = campaign.total_sent > 0 
    ? ((campaign.total_converted / campaign.total_sent) * 100).toFixed(1) 
    : '0';

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate('/admin/campaigns')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Campaigns
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
        <p className="text-muted-foreground">{campaign.description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_sent || 0}</div>
            <p className="text-xs text-muted-foreground">Total emails delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opened</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_opened || 0}</div>
            <p className="text-xs text-muted-foreground">{openRate}% open rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicked</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_clicked || 0}</div>
            <p className="text-xs text-muted-foreground">{clickRate}% click rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_converted || 0}</div>
            <p className="text-xs text-muted-foreground">{conversionRate}% conversion</p>
          </CardContent>
        </Card>
      </div>

      {/* Recipients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Recipients</CardTitle>
          <CardDescription>Detailed tracking for each recipient</CardDescription>
        </CardHeader>
        <CardContent>
          {sends && sends.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Clicked</TableHead>
                  <TableHead>Converted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sends.map((send) => (
                  <TableRow key={send.id}>
                    <TableCell className="font-medium">{send.recipient_email}</TableCell>
                    <TableCell>
                      <Badge variant={send.status === 'sent' ? 'default' : 'destructive'}>
                        {send.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(send.sent_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell>
                      {send.opened_at ? (
                        <span className="text-sm text-green-600">
                          {format(new Date(send.opened_at), 'MMM d, h:mm a')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {send.clicked_at ? (
                        <span className="text-sm text-blue-600">
                          {format(new Date(send.clicked_at), 'MMM d, h:mm a')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {send.converted_at ? (
                        <span className="text-sm text-purple-600">
                          {format(new Date(send.converted_at), 'MMM d, h:mm a')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No recipients yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}