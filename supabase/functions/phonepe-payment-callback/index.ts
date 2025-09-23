import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook authentication
const webhookUsername = Deno.env.get('PHONEPE_WEBHOOK_USERNAME')!;
const webhookPassword = Deno.env.get('PHONEPE_WEBHOOK_PASSWORD')!;

// Create expected authorization hash
async function createAuthHash(username: string, password: string): Promise<string> {
  const credentials = `${username}:${password}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(credentials);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface PhonePeWebhookPayload {
  event: string;
  payload: {
    merchantOrderId: string;
    orderId?: string;
    state: 'COMPLETED' | 'FAILED';
    amount: number;
    expireAt?: number;
    paymentDetails?: Array<{
      paymentMode: string;
      transactionId: string;
      timestamp: number;
      amount: number;
      state: string;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response('Unauthorized', { status: 401 });
    }

    const expectedHash = await createAuthHash(webhookUsername, webhookPassword);
    const receivedHash = authHeader.replace('SHA256 ', '').toLowerCase();

    if (receivedHash !== expectedHash) {
      console.error('Invalid authorization hash');
      return new Response('Unauthorized', { status: 401 });
    }

    const webhookData: PhonePeWebhookPayload = await req.json();
    console.log('PhonePe webhook received:', JSON.stringify(webhookData, null, 2));

    // Log the callback in payment_callbacks table
    const { error: callbackError } = await supabase
      .from('payment_callbacks')
      .insert({
        phonepe_order_id: webhookData.payload.orderId,
        merchant_order_id: webhookData.payload.merchantOrderId,
        callback_data: webhookData,
        processed: false,
      });

    if (callbackError) {
      console.error('Failed to log callback:', callbackError);
    }

    // Process the webhook based on event type
    if (webhookData.event === 'checkout.order.completed' && webhookData.payload.state === 'COMPLETED') {
      await processSuccessfulPayment(webhookData);
    } else if (webhookData.event === 'checkout.order.failed' || webhookData.payload.state === 'FAILED') {
      await processFailedPayment(webhookData);
    }

    // Update callback as processed
    await supabase
      .from('payment_callbacks')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('merchant_order_id', webhookData.payload.merchantOrderId);

    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Try to log the error if we have merchant order ID
    try {
      const body = await req.clone().json();
      if (body.payload?.merchantOrderId) {
        await supabase
          .from('payment_callbacks')
          .update({
            processing_error: error.message,
            processed_at: new Date().toISOString(),
          })
          .eq('merchant_order_id', body.payload.merchantOrderId);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response('Internal Server Error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function processSuccessfulPayment(webhookData: PhonePeWebhookPayload) {
  const { merchantOrderId, orderId } = webhookData.payload;
  
  console.log('Processing successful payment for order:', merchantOrderId);

  // Update PhonePe order status
  const { error: orderError } = await supabase
    .from('phonepe_orders')
    .update({
      status: 'SUCCESS',
      phonepe_order_id: orderId,
      updated_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', merchantOrderId);

  if (orderError) {
    console.error('Failed to update PhonePe order:', orderError);
    throw orderError;
  }

  // Update purchase status
  const { error: purchaseError } = await supabase
    .from('purchases')
    .update({
      status: 'completed',
      phonepe_transaction_id: orderId,
      callback_received_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', merchantOrderId);

  if (purchaseError) {
    console.error('Failed to update purchase:', purchaseError);
    throw purchaseError;
  }

  // Get purchase details to add credits
  const { data: purchase, error: fetchError } = await supabase
    .from('purchases')
    .select('user_id, credits_purchased')
    .eq('merchant_order_id', merchantOrderId)
    .single();

  if (fetchError || !purchase) {
    console.error('Failed to fetch purchase details:', fetchError);
    throw new Error('Purchase not found');
  }

  // Add credits to user account
  const { error: creditError } = await supabase.rpc('add_credits_after_purchase', {
    p_user_id: purchase.user_id,
    p_purchase_id: crypto.randomUUID(),
    p_credits_purchased: purchase.credits_purchased,
  });

  if (creditError) {
    console.error('Failed to add credits:', creditError);
    throw creditError;
  }

  console.log(`Successfully processed payment and added ${purchase.credits_purchased} credits to user ${purchase.user_id}`);
}

async function processFailedPayment(webhookData: PhonePeWebhookPayload) {
  const { merchantOrderId, orderId } = webhookData.payload;
  
  console.log('Processing failed payment for order:', merchantOrderId);

  // Update PhonePe order status
  const { error: orderError } = await supabase
    .from('phonepe_orders')
    .update({
      status: 'FAILED',
      phonepe_order_id: orderId,
      updated_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', merchantOrderId);

  if (orderError) {
    console.error('Failed to update PhonePe order:', orderError);
  }

  // Update purchase status
  const { error: purchaseError } = await supabase
    .from('purchases')
    .update({
      status: 'failed',
      phonepe_transaction_id: orderId,
      callback_received_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', merchantOrderId);

  if (purchaseError) {
    console.error('Failed to update purchase:', purchaseError);
  }

  console.log('Processed failed payment for order:', merchantOrderId);
}