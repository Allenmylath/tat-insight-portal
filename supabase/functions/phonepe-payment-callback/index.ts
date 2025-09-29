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

// Create expected authorization hash (PhonePe format: SHA256(username:password))
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
    merchantId?: string;
    state: 'COMPLETED' | 'FAILED';
    amount: number;
    expireAt?: number;
    metaInfo?: {
      udf1?: string;
      udf2?: string;
      udf3?: string;
      udf4?: string;
    };
    paymentDetails?: Array<{
      paymentMode: string;
      transactionId: string;
      timestamp: number;
      amount: number;
      state: string;
      errorCode?: string;
      detailedErrorCode?: string;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook authorization (PhonePe sends SHA256 hash directly)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response('Unauthorized', { status: 401 });
    }

    const expectedHash = await createAuthHash(webhookUsername, webhookPassword);
    const receivedHash = authHeader.replace(/^SHA256\s+/, '').toLowerCase();

    if (receivedHash !== expectedHash) {
      console.error('Invalid authorization hash. Expected:', expectedHash, 'Received:', receivedHash);
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
            processing_error: error instanceof Error ? error.message : 'Unknown error occurred',
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
  const { merchantOrderId, orderId, paymentDetails } = webhookData.payload;
  
  console.log('Processing successful payment for order:', merchantOrderId);
  console.log('Payment details received:', JSON.stringify(paymentDetails, null, 2));

  // Extract payment details
  const paymentInfo = paymentDetails && paymentDetails.length > 0 ? paymentDetails[0] : null;
  const transactionId = paymentInfo?.transactionId || orderId;
  const paymentMode = paymentInfo?.paymentMode || 'UNKNOWN';
  const timestamp = paymentInfo?.timestamp;

  // Update PhonePe order status with payment details
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

  // Update purchase status with complete payment information
  const { error: purchaseError } = await supabase
    .from('purchases')
    .update({
      status: 'completed',
      phonepe_transaction_id: transactionId,
      payment_method: paymentMode,
      callback_received_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', merchantOrderId);

  if (purchaseError) {
    console.error('Failed to update purchase:', purchaseError);
    throw purchaseError;
  }

  // Get purchase details and user information to add credits
  const { data: purchaseData, error: fetchError } = await supabase
    .from('purchases')
    .select(`
      user_id, 
      credits_purchased, 
      id,
      users!inner(email, clerk_id)
    `)
    .eq('merchant_order_id', merchantOrderId)
    .single();

  if (fetchError || !purchaseData) {
    console.error('Failed to fetch purchase details:', fetchError);
    throw new Error('Purchase not found');
  }

  // Prepare payment metadata for transaction record
  const paymentMetadata = {
    phonepe_order_id: orderId,
    merchant_order_id: merchantOrderId,
    transaction_id: transactionId,
    payment_mode: paymentMode,
    amount: webhookData.payload.amount,
    timestamp: timestamp ? new Date(timestamp).toISOString() : null,
    webhook_event: webhookData.event,
    payment_details: paymentInfo
  };

  // Add credits to user account with enhanced information
  const { error: creditError } = await supabase.rpc('add_credits_after_purchase', {
    p_user_id: purchaseData.user_id,
    p_purchase_id: purchaseData.id,
    p_credits_purchased: purchaseData.credits_purchased,
    p_user_email: (purchaseData.users as any)?.email || (purchaseData.users as any)?.[0]?.email,
    p_payment_metadata: paymentMetadata,
  });

  if (creditError) {
    console.error('Failed to add credits:', creditError);
    throw creditError;
  }

  const userEmail = (purchaseData.users as any)?.email || (purchaseData.users as any)?.[0]?.email;
  console.log(`Successfully processed payment for user ${userEmail}`);
  console.log(`Added ${purchaseData.credits_purchased} credits via ${paymentMode} payment`);
  console.log(`Transaction ID: ${transactionId}`);
}

async function processFailedPayment(webhookData: PhonePeWebhookPayload) {
  const { merchantOrderId, orderId, paymentDetails } = webhookData.payload;
  
  console.log('Processing failed payment for order:', merchantOrderId);
  console.log('Payment failure details:', JSON.stringify(paymentDetails, null, 2));

  // Extract payment details for failure analysis
  const paymentInfo = paymentDetails && paymentDetails.length > 0 ? paymentDetails[0] : null;
  const transactionId = paymentInfo?.transactionId || orderId;
  const paymentMode = paymentInfo?.paymentMode || 'UNKNOWN';
  const errorCode = paymentInfo?.errorCode;
  const detailedErrorCode = paymentInfo?.detailedErrorCode;

  // Update PhonePe order status with failure details
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

  // Update purchase status with failure information
  const { error: purchaseError } = await supabase
    .from('purchases')
    .update({
      status: 'failed',
      phonepe_transaction_id: transactionId,
      payment_method: paymentMode,
      callback_received_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', merchantOrderId);

  if (purchaseError) {
    console.error('Failed to update purchase:', purchaseError);
  }

  console.log(`Processed failed payment for order: ${merchantOrderId}`);
  if (errorCode || detailedErrorCode) {
    console.log(`Failure reason - Error Code: ${errorCode}, Detailed Code: ${detailedErrorCode}`);
  }
  console.log(`Payment method: ${paymentMode}, Transaction ID: ${transactionId}`);
}