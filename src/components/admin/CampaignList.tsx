import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Send, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Campaign {
  id: string;
  name: string;
  status: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  created_at: string;
  scheduled_for?: string;
}

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

export function CampaignList({ campaigns, isLoading }: CampaignListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      scheduled: "default",
      sending: "outline",
      sent: "default",
      paused: "destructive",
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const handleSendNow = async (campaignId: string) => {
    try {
      toast.loading("Sending campaign...");
      
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: { campaignId },
      });

      if (error) throw error;

      toast.success(`Campaign sent to ${data.sent} recipients`);
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No campaigns yet</p>
        <p className="text-sm text-muted-foreground">Create your first campaign to start converting free users</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Sent</TableHead>
          <TableHead className="text-right">Opened</TableHead>
          <TableHead className="text-right">Clicked</TableHead>
          <TableHead className="text-right">Converted</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => {
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
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell className="text-right">{campaign.total_sent || 0}</TableCell>
              <TableCell className="text-right">
                {campaign.total_opened || 0}
                {campaign.total_sent > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">({openRate}%)</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {campaign.total_clicked || 0}
                {campaign.total_sent > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">({clickRate}%)</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {campaign.total_converted || 0}
                {campaign.total_sent > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">({conversionRate}%)</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(campaign.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Analytics
                    </DropdownMenuItem>
                    {campaign.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handleSendNow(campaign.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Now
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}