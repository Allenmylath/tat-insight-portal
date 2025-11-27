import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔍 Starting pro membership expiration check...');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find all pro users with expired memberships
    const { data: expiredUsers, error: queryError } = await supabase
      .from('users')
      .select('id, email, first_name, membership_type, membership_expires_at')
      .eq('membership_type', 'pro')
      .lt('membership_expires_at', new Date().toISOString());

    if (queryError) {
      console.error('❌ Error querying expired pro users:', queryError);
      throw queryError;
    }

    console.log(`📊 Found ${expiredUsers?.length || 0} expired pro memberships`);

    if (!expiredUsers || expiredUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired pro memberships found', 
          processed: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update all expired users to free
    const expiredUserIds = expiredUsers.map(user => user.id);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        membership_type: 'free',
        updated_at: new Date().toISOString()
      })
      .in('id', expiredUserIds);

    if (updateError) {
      console.error('❌ Error updating users to free:', updateError);
      throw updateError;
    }

    // Log each converted user
    expiredUsers.forEach(user => {
      console.log(`✅ Converted ${user.email} from pro to free (expired: ${user.membership_expires_at})`);
    });

    console.log(`✅ Successfully converted ${expiredUsers.length} users from pro to free`);

    // Send expiration notification emails
    console.log('📧 Starting to send expiration notification emails...');
    const emailResults = [];
    
    for (const user of expiredUsers) {
      try {
        const firstName = user.first_name || 'there';
        
        const { data, error } = await resend.emails.send({
          from: 'Allen <allen@notifications.tattests.me>',
          to: [user.email],
          subject: '⏰ Your TAT Tests Pro Membership Has Expired',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">
                Your Pro Membership Has Expired
              </h1>
              
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                Hi ${firstName},
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                We wanted to let you know that your TAT Tests Pro membership has expired and your account has been converted to Free.
              </p>
              
              <h2 style="color: #1e40af; font-size: 18px; margin-top: 25px; margin-bottom: 15px;">
                What You're Missing as a Free User:
              </h2>
              
              <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
                <li>❌ SSB Interview Preparation Questions</li>
                <li>❌ Military Assessment Reports</li>
                <li>❌ Advanced Psychological Insights</li>
                <li>❌ Priority Support</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://tattests.me/dashboard/pricing" 
                   style="background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; display: inline-block;">
                  🚀 Renew Pro Membership
                </a>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px;">
                💡 <strong>Pro Tip:</strong> Renew within 7 days to continue your SSB preparation without interruption!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              
              <p style="font-size: 14px; line-height: 1.6; color: #666;">
                If you have any questions about your account or need help, just reply to this email.
              </p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #666;">
                Best regards,<br/>
                Allen<br/>
                TAT Insight Portal Team
              </p>
            </div>
          `,
        });

        if (error) {
          console.error(`❌ Failed to send email to ${user.email}:`, error);
          emailResults.push({ email: user.email, success: false, error: error.message });
        } else {
          console.log(`📧 Expiration email sent to ${user.email}`);
          emailResults.push({ email: user.email, success: true, emailId: data?.id });
        }
      } catch (emailError: any) {
        console.error(`❌ Error sending email to ${user.email}:`, emailError);
        emailResults.push({ email: user.email, success: false, error: emailError.message });
      }
    }

    const successfulEmails = emailResults.filter(r => r.success).length;
    console.log(`📊 Email results: ${successfulEmails}/${expiredUsers.length} sent successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Converted ${expiredUsers.length} expired pro memberships to free`,
        processed: expiredUsers.length,
        users: expiredUsers.map(u => ({ email: u.email, expired_at: u.membership_expires_at })),
        emailResults: emailResults,
        emailsSent: successfulEmails
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Critical error in expire-pro-memberships:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Function error',
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
