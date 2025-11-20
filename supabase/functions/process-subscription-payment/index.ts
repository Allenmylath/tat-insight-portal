import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const PHONEPE_WEBHOOK_USERNAME = Deno.env.get('PHONEPE_WEBHOOK_USERNAME')!;
const PHONEPE_WEBHOOK_PASSWORD = Deno.env.get('PHONEPE_WEBHOOK_PASSWORD')!;

const resend = new Resend(RESEND_API_KEY);

function createAuthHash(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(credentials);
  return btoa(String.fromCharCode(...data));
}

interface PhonePeWebhookPayload {
  event: string;
  data: {
    merchantTransactionId: string;
    orderId: string;
    transactionId: string;
    amount: number;
    state: string;
    paymentInstrument?: {
      type: string;
      utr?: string;
    };
    responseCode?: string;
    message?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Verify webhook authentication
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Basic ${createAuthHash(PHONEPE_WEBHOOK_USERNAME, PHONEPE_WEBHOOK_PASSWORD)}`;

    if (authHeader !== expectedAuth) {
      console.error('Invalid webhook authentication');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookData: PhonePeWebhookPayload = await req.json();
    console.log('Received subscription payment webhook:', JSON.stringify(webhookData, null, 2));

    // Log callback data
    const { error: callbackError } = await supabase
      .from('payment_callbacks')
      .insert({
        callback_data: webhookData,
        merchant_order_id: webhookData.data.merchantTransactionId,
        phonepe_order_id: webhookData.data.orderId
      });

    if (callbackError) {
      console.error('Failed to log callback:', callbackError);
    }

    const merchantOrderId = webhookData.data.merchantTransactionId;
    const paymentState = webhookData.data.state;

    // Get subscription order
    const { data: orderData, error: orderError } = await supabase
      .from('subscription_orders')
      .select('*, plan:plan_id(*)')
      .eq('merchant_order_id', merchantOrderId)
      .single();

    if (orderError || !orderData) {
      console.error('Subscription order not found:', merchantOrderId);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (webhookData.event === 'PAYMENT_SUCCESS' && paymentState === 'COMPLETED') {
      await processSuccessfulPayment(webhookData, orderData, supabase);
    } else {
      await processFailedPayment(webhookData, orderData, supabase);
    }

    // Mark callback as processed
    await supabase
      .from('payment_callbacks')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('merchant_order_id', merchantOrderId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing subscription payment:', error);
    
    // Try to log error in callback
    try {
      const webhookData = await req.clone().json();
      await supabase
        .from('payment_callbacks')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          processing_error: error.message
        })
        .eq('merchant_order_id', webhookData.data?.merchantTransactionId);
    } catch (logError) {
      console.error('Failed to log processing error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to process payment',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processSuccessfulPayment(
  webhookData: PhonePeWebhookPayload,
  orderData: any,
  supabase: any
) {
  console.log('Processing successful subscription payment:', orderData.merchant_order_id);

  const plan = orderData.plan;
  const durationDays = plan.duration_days || 30;

  // Update subscription order
  const { error: orderUpdateError } = await supabase
    .from('subscription_orders')
    .update({
      status: 'COMPLETED',
      payment_completed_at: new Date().toISOString(),
      phonepe_order_id: webhookData.data.orderId,
      payment_metadata: {
        ...orderData.payment_metadata,
        transaction_id: webhookData.data.transactionId,
        payment_instrument: webhookData.data.paymentInstrument,
        response_code: webhookData.data.responseCode
      }
    })
    .eq('id', orderData.id);

  if (orderUpdateError) {
    console.error('Failed to update subscription order:', orderUpdateError);
    throw orderUpdateError;
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email, first_name, clerk_id')
    .eq('id', orderData.user_id)
    .single();

  if (userError) {
    console.error('Failed to fetch user:', userError);
    throw userError;
  }

  // Update user membership
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  const { error: membershipError } = await supabase
    .from('users')
    .update({
      membership_type: 'pro',
      membership_expires_at: expiresAt.toISOString()
    })
    .eq('id', orderData.user_id);

  if (membershipError) {
    console.error('Failed to update user membership:', membershipError);
    throw membershipError;
  }

  console.log(`User ${userData.email} upgraded to Pro until ${expiresAt.toISOString()}`);

  // Send confirmation email
  try {
    const emailResponse = await resend.emails.send({
      from: "TAT Tests <onboarding@resend.dev>",
      to: [userData.email],
      subject: "🎉 Welcome to Pro! Your SSB Questions are Ready",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Pro, ${userData.first_name || 'there'}! 🎉</h1>
          
          <p>Congratulations! Your Pro subscription is now active.</p>
          
          <h2 style="color: #1e40af;">What You Can Do Now:</h2>
          <ul>
            <li><strong>SSB Interview Questions:</strong> Get personalized questions based on your TAT analysis</li>
            <li><strong>Unlimited Tests:</strong> Take as many tests as you need</li>
            <li><strong>Advanced Analytics:</strong> Deeper insights into your personality profile</li>
            <li><strong>Priority Support:</strong> Get help when you need it</li>
          </ul>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Plan:</strong> ${plan.name}</p>
            <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${expiresAt.toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${orderData.amount}</p>
          </div>
          
          <a href="https://tattests.me/dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                    margin: 20px 0;">
            Go to Dashboard
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Questions? Reply to this email or visit our support page.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Best wishes for your SSB preparation!<br>
            The TAT Tests Team
          </p>
        </div>
      `,
    });

    console.log('Confirmation email sent:', emailResponse);
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't throw - email failure shouldn't block payment processing
  }
}

async function processFailedPayment(
  webhookData: PhonePeWebhookPayload,
  orderData: any,
  supabase: any
) {
  console.log('Processing failed subscription payment:', orderData.merchant_order_id);

  const { error: orderUpdateError } = await supabase
    .from('subscription_orders')
    .update({
      status: 'FAILED',
      payment_metadata: {
        ...orderData.payment_metadata,
        transaction_id: webhookData.data.transactionId,
        response_code: webhookData.data.responseCode,
        failure_message: webhookData.data.message
      }
    })
    .eq('id', orderData.id);

  if (orderUpdateError) {
    console.error('Failed to update failed subscription order:', orderUpdateError);
    throw orderUpdateError;
  }

  console.log('Subscription payment failed:', webhookData.data.message);
}
