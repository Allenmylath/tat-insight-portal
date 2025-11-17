import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const event = url.searchParams.get('event'); // 'opened' or 'clicked'
    const campaignId = url.searchParams.get('campaignId');
    const userId = url.searchParams.get('userId');

    if (!event || !campaignId || !userId) {
      return new Response('Missing parameters', { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update campaign_sends record
    const updateData: any = {};
    if (event === 'opened') {
      updateData.opened_at = new Date().toISOString();
    } else if (event === 'clicked') {
      updateData.clicked_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('campaign_sends')
      .update(updateData)
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .is(event === 'opened' ? 'opened_at' : 'clicked_at', null); // Only update if not already set

    if (error) throw error;

    // Update campaign analytics
    const field = event === 'opened' ? 'total_opened' : 'total_clicked';
    
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select(field)
      .eq('id', campaignId)
      .single();

    if (campaign) {
      await supabase
        .from('email_campaigns')
        .update({ [field]: (campaign[field] || 0) + 1 })
        .eq('id', campaignId);
    }

    // For opened events, return a 1x1 transparent pixel
    if (event === 'opened') {
      const pixel = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));
      return new Response(pixel, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // For clicked events, return success
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-email-event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});