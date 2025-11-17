import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { campaignId } = await req.json();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Update campaign status to 'sending'
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // Get target audience using the get-campaign-audience function
    const audienceResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/get-campaign-audience`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          targetAudience: campaign.target_audience,
          campaignId,
          cooldownDays: campaign.cooldown_days,
        }),
      }
    );

    const { allUsers } = await audienceResponse.json();
    let recipients = allUsers || [];

    // Apply max recipients limit if set
    if (campaign.max_recipients && recipients.length > campaign.max_recipients) {
      recipients = recipients.slice(0, campaign.max_recipients);
    }

    console.log(`Sending campaign "${campaign.name}" to ${recipients.length} users`);

    let sentCount = 0;
    let failedCount = 0;

    // Send emails in batches of 10 to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const promises = batch.map(async (recipient: any) => {
        try {
          // Get full user data
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', recipient.user_id)
            .single();

          if (!user) return { success: false, error: 'User not found' };

          // Replace template variables in email
          const personalizedSubject = campaign.subject_line
            .replace('{{first_name}}', user.first_name || user.username || 'there')
            .replace('{{username}}', user.username || 'there');

          const personalizedBody = campaign.email_body
            .replace(/{{first_name}}/g, user.first_name || user.username || 'there')
            .replace(/{{username}}/g, user.username || 'there')
            .replace(/{{credits_balance}}/g, user.credit_balance.toString())
            .replace(/{{tests_completed}}/g, ''); // This would need to be fetched separately

          // Add tracking pixel and CTA link with campaign ID
          const trackingPixel = `<img src="${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-event?event=opened&campaignId=${campaignId}&userId=${user.id}" width="1" height="1" />`;
          const finalBody = personalizedBody + trackingPixel;

          // Send email via Resend
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'TAT Tests <noreply@notifications.tattests.me>',
            to: [user.email],
            subject: personalizedSubject,
            html: finalBody,
          });

          if (emailError) throw emailError;

          // Record send in database
          await supabase.from('campaign_sends').insert({
            campaign_id: campaignId,
            user_id: user.id,
            recipient_email: user.email,
            status: 'sent',
            user_data: {
              first_name: user.first_name,
              credit_balance: user.credit_balance,
              membership_type: user.membership_type,
            },
          });

          sentCount++;
          return { success: true };
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          
          // Record failed send
          await supabase.from('campaign_sends').insert({
            campaign_id: campaignId,
            user_id: recipient.user_id,
            recipient_email: recipient.email,
            status: 'failed',
            error_message: error.message,
          });

          failedCount++;
          return { success: false, error: error.message };
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign with final stats
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_sent: sentCount,
      })
      .eq('id', campaignId);

    console.log(`Campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: recipients.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-campaign:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});