import { Resend } from 'npm:resend@4.0.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(RESEND_API_KEY);

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  timeoutMs: 15000
};

// Exponential backoff retry logic
async function sendEmailWithRetry(
  resend: any,
  emailData: any,
  attemptNumber: number = 1
): Promise<{ success: boolean; data?: any; error?: any; statusCode?: number }> {
  
  try {
    console.log(`📧 Email attempt ${attemptNumber}/${RETRY_CONFIG.maxAttempts}`);
    
    const { data, error } = await resend.emails.send(emailData);
    
    if (!error && data) {
      console.log('✅ Email sent successfully:', data.id);
      return { success: true, data, statusCode: 200 };
    }
    
    console.warn(`⚠️ Resend error on attempt ${attemptNumber}:`, error);
    
    if (attemptNumber < RETRY_CONFIG.maxAttempts) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attemptNumber - 1),
        RETRY_CONFIG.maxDelay
      );
      
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return sendEmailWithRetry(resend, emailData, attemptNumber + 1);
    }
    
    console.error(`❌ All ${RETRY_CONFIG.maxAttempts} attempts failed`);
    return { success: false, error, statusCode: error.statusCode || 500 };
    
  } catch (err: any) {
    console.error(`💥 Exception on attempt ${attemptNumber}:`, err.message);
    
    if (attemptNumber < RETRY_CONFIG.maxAttempts) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attemptNumber - 1),
        RETRY_CONFIG.maxDelay
      );
      
      console.log(`⏳ Retrying after exception in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return sendEmailWithRetry(resend, emailData, attemptNumber + 1);
    }
    
    return { success: false, error: err.message, statusCode: 500 };
  }
}

interface EmailRequest {
  user_id: string;
  user_email: string;
  promotional_credit_id: string;
  claim_token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_email, promotional_credit_id, claim_token }: EmailRequest = await req.json();
    
    console.log(`📨 Processing promotional email for user: ${user_email}`);
    
    const claimUrl = `https://tattests.me/claim-credits?token=${claim_token}`;
    
    const emailResult = await sendEmailWithRetry(resend, {
      from: 'Allen <allen@notifications.tattests.me>',
      to: [user_email],
      subject: 'We miss you! Claim your 200 FREE credits 🎁',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">
            🎁 Special Offer: 200 FREE Credits!
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Hi there,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            We noticed you joined TAT Insight Portal but haven't tried our tests yet. 
            As a welcome back gift, we'd like to offer you <strong>200 FREE credits</strong>!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${claimUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; display: inline-block;">
              Claim My 200 FREE Credits
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            These credits are enough for 2 complete TAT test sessions with detailed AI-powered analysis!
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #999; margin-top: 30px;">
            ⏰ This offer expires in 7 days. Click the button above to claim your credits.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="font-size: 14px; line-height: 1.6; color: #666;">
            Best regards,<br/>
            Allen<br/>
            TAT Insight Portal Team
          </p>
        </div>
      `,
    });
    
    // Get current attempts
    const { data: currentData } = await supabase
      .from('promotional_credits')
      .select('email_attempts')
      .eq('id', promotional_credit_id)
      .single();
    
    const currentAttempts = currentData?.email_attempts || 0;
    
    // Update promotional_credits record
    const updateData = emailResult.success ? {
      email_sent_at: new Date().toISOString(),
      email_delivery_status: 'sent',
      email_attempts: currentAttempts + 1,
      last_email_attempt_at: new Date().toISOString(),
      email_error_message: null,
    } : {
      email_delivery_status: 'failed',
      email_attempts: currentAttempts + 1,
      last_email_attempt_at: new Date().toISOString(),
      email_error_message: JSON.stringify(emailResult.error),
    };
    
    await supabase
      .from('promotional_credits')
      .update(updateData)
      .eq('id', promotional_credit_id);
    
    return new Response(
      JSON.stringify({
        success: emailResult.success,
        message: emailResult.success ? 'Email sent successfully' : 'Email failed after retries, will retry next day',
        emailId: emailResult.data?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error: any) {
    console.error('💥 Unexpected error in send-promotional-email:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Function error, will retry next day',
        error: error.message,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

Deno.serve(handler);
