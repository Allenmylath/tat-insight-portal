import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PhonePe configuration
const phonepeClientId = Deno.env.get('PHONEPE_CLIENT_ID')!;
const phonepeClientSecret = Deno.env.get('PHONEPE_CLIENT_SECRET')!;

interface CreatePaymentRequest {
  user_id: string;
  package_id: string;
  amount: number;
  credits: number;
  package_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, package_id, amount, credits, package_name }: CreatePaymentRequest = await req.json();

    console.log('Creating PhonePe payment for user:', user_id, 'package:', package_name, 'amount:', amount);

    // Generate unique merchant order ID
    const merchantOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const callbackUrl = `${supabaseUrl}/functions/v1/phonepe-payment-callback`;
    const redirectUrl = `${req.headers.get('origin')}/dashboard?payment=success`;

    // Get PhonePe access token
    const tokenResponse = await supabase.functions.invoke('generate-phonepe-token');
    
    if (tokenResponse.error) {
      throw new Error('Failed to get PhonePe token');
    }

    const { token } = tokenResponse.data;

    // Create PhonePe payment order using v2 API format
    const orderPayload = {
      merchantOrderId: merchantOrderId,
      amount: amount * 100, // Convert to paise
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          redirectUrl: redirectUrl
        }
      }
    };

    console.log('PhonePe order payload:', orderPayload);

    const phonepeResponse = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const phonepeData = await phonepeResponse.json();
    console.log('PhonePe API response:', phonepeData);

    if (!phonepeResponse.ok || !phonepeData.success) {
      throw new Error(`PhonePe API error: ${phonepeData.message || 'Unknown error'}`);
    }

    // Store order in database
    const { error: dbError } = await supabase
      .from('phonepe_orders')
      .insert({
        user_id: user_id,
        merchant_order_id: merchantOrderId,
        phonepe_order_id: phonepeData.data?.merchantTransactionId,
        amount: amount,
        currency: 'INR',
        status: 'CREATED',
        redirect_url: redirectUrl,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store order in database');
    }

    // Also create a purchase record
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user_id,
        amount: amount,
        credits_purchased: credits,
        package_name: package_name,
        payment_method: 'phonepe',
        merchant_order_id: merchantOrderId,
        phonepe_order_id: phonepeData.data?.merchantTransactionId,
        status: 'pending',
      });

    if (purchaseError) {
      console.error('Purchase record error:', purchaseError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        checkoutUrl: phonepeData.data?.instrumentResponse?.redirectInfo?.url,
        merchantOrderId: merchantOrderId,
        orderId: phonepeData.data?.merchantTransactionId,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating PhonePe payment:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});