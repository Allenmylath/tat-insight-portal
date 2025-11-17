import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TargetAudience {
  is_free_user?: boolean;
  min_tests?: number;
  max_days_since_test?: number;
  lead_status?: string[];
  min_credit_balance?: number;
  max_credit_balance?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { targetAudience, campaignId, cooldownDays = 7 }: {
      targetAudience: TargetAudience;
      campaignId?: string;
      cooldownDays?: number;
    } = await req.json();

    // Build query for test_completers view
    let query = supabase.from('test_completers').select('*');

    // Apply filters based on target audience
    if (targetAudience.is_free_user !== undefined) {
      query = query.eq('is_free_user', targetAudience.is_free_user);
    }

    if (targetAudience.min_tests) {
      query = query.gte('total_tests_completed', targetAudience.min_tests);
    }

    if (targetAudience.max_days_since_test) {
      query = query.lte('days_since_last_test', targetAudience.max_days_since_test);
    }

    if (targetAudience.lead_status && targetAudience.lead_status.length > 0) {
      query = query.in('lead_status', targetAudience.lead_status);
    }

    if (targetAudience.min_credit_balance !== undefined) {
      query = query.gte('current_credit_balance', targetAudience.min_credit_balance);
    }

    if (targetAudience.max_credit_balance !== undefined) {
      query = query.lte('current_credit_balance', targetAudience.max_credit_balance);
    }

    const { data: candidates, error: queryError } = await query;

    if (queryError) throw queryError;

    // Get users who are unsubscribed
    const { data: unsubscribed } = await supabase
      .from('email_preferences')
      .select('user_id')
      .eq('unsubscribed_from_marketing', true);

    const unsubscribedIds = new Set(unsubscribed?.map(u => u.user_id) || []);

    // Get users who received campaign recently (within cooldown period)
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - cooldownDays);

    const { data: recentlySent } = await supabase
      .from('campaign_sends')
      .select('user_id')
      .gte('sent_at', cooldownDate.toISOString());

    const recentlySentIds = new Set(recentlySent?.map(s => s.user_id) || []);

    // Filter out unsubscribed and recently contacted users
    const eligibleUsers = candidates?.filter(user => 
      !unsubscribedIds.has(user.user_id) && 
      !recentlySentIds.has(user.user_id)
    ) || [];

    // Calculate statistics
    const stats = {
      total: eligibleUsers.length,
      by_lead_status: eligibleUsers.reduce((acc, user) => {
        acc[user.lead_status] = (acc[user.lead_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avg_tests: eligibleUsers.reduce((sum, u) => sum + u.total_tests_completed, 0) / (eligibleUsers.length || 1),
      avg_credits: eligibleUsers.reduce((sum, u) => sum + u.current_credit_balance, 0) / (eligibleUsers.length || 1),
    };

    // Return preview (first 20 users) and full count
    return new Response(
      JSON.stringify({
        users: eligibleUsers.slice(0, 20),
        allUsers: eligibleUsers.map(u => ({ user_id: u.user_id, email: u.email })),
        count: eligibleUsers.length,
        stats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-campaign-audience:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});