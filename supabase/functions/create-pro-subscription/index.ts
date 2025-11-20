import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PHONEPE_CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID')!;
const PHONEPE_CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan_id, user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or use default plan
    let plan;
    if (plan_id) {
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', plan_id)
        .eq('is_active', true)
        .single();

      if (planError || !planData) {
        return new Response(
          JSON.stringify({ error: 'Plan not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      plan = planData;
    } else {
      // Default to Pro Monthly
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Pro Monthly')
        .eq('is_active', true)
        .single();

      if (planError || !planData) {
        return new Response(
          JSON.stringify({ error: 'Default plan not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      plan = planData;
    }

    // Generate unique merchant order ID
    const merchantOrderId = `PRO_${userData.id}_${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (plan.duration_days || 30));

    // Get PhonePe access token
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
      'generate-phonepe-token'
    );

    if (tokenError || !tokenData?.access_token) {
      console.error('Failed to get PhonePe token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize payment gateway' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = tokenData.access_token;

    // Prepare PhonePe payment payload using v2 API format
    const callbackUrl = `${SUPABASE_URL}/functions/v1/process-subscription-payment`;
    const redirectUrl = `${req.headers.get('origin') || 'https://tattests.me'}/dashboard/settings?subscription=success&order=${merchantOrderId}`;

    const orderPayload = {
      merchantOrderId: merchantOrderId,
      amount: Math.round(plan.price * 100), // Convert to paise
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          redirectUrl: redirectUrl
        }
      }
    };

    console.log('PhonePe order payload:', JSON.stringify(orderPayload, null, 2));

    // Make payment request to PhonePe
    const phonepeResponse = await fetch('https://api.phonepe.com/apis/pg/checkout/v2/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload)
    });

    const phonepeData = await phonepeResponse.json();
    console.log('PhonePe response:', JSON.stringify(phonepeData, null, 2));

    if (!phonepeResponse.ok) {
      const errorMessage = phonepeData.message || phonepeData.error || `HTTP ${phonepeResponse.status}`;
      console.error('PhonePe API HTTP error:', errorMessage);
      return new Response(
        JSON.stringify({ 
          error: 'Payment gateway error',
          details: errorMessage
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (phonepeData.code && (phonepeData.code === 'BAD_REQUEST' || phonepeData.code === 'INTERNAL_SERVER_ERROR')) {
      console.error('PhonePe API business error:', phonepeData.code, phonepeData.message);
      return new Response(
        JSON.stringify({ 
          error: 'Payment gateway error',
          details: phonepeData.message || phonepeData.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkoutUrl = phonepeData.redirectUrl;
    const phonepeOrderId = phonepeData.orderId;

    if (!checkoutUrl) {
      console.error('No checkout URL in PhonePe response:', phonepeData);
      return new Response(
        JSON.stringify({ error: 'Failed to get payment URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create subscription order record
    const { data: orderData, error: orderError } = await supabase
      .from('subscription_orders')
      .insert({
        user_id: userData.id,
        plan_id: plan.id,
        merchant_order_id: merchantOrderId,
        phonepe_order_id: phonepeOrderId,
        amount: plan.price,
        currency: plan.currency || 'INR',
        status: 'CREATED',
        expires_at: expiresAt.toISOString(),
        redirect_url: redirectUrl,
        payment_metadata: {
          plan_name: plan.name,
          duration_days: plan.duration_days
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create subscription order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subscription order created:', orderData.id);

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: checkoutUrl,
        orderId: orderData.id,
        merchantOrderId: merchantOrderId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create subscription',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
