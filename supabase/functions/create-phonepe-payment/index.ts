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

    const { access_token } = tokenResponse.data;

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

    const phonepeResponse = await fetch('https://api.phonepe.com/apis/pg/checkout/v2/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${access_token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const phonepeData = await phonepeResponse.json();
    console.log('PhonePe API response status:', phonepeResponse.status);
    console.log('PhonePe API response data:', JSON.stringify(phonepeData, null, 2));

    // Handle PhonePe error responses
    if (!phonepeResponse.ok) {
      const errorMessage = phonepeData.message || phonepeData.error || `HTTP ${phonepeResponse.status}`;
      console.error('PhonePe API HTTP error:', errorMessage);
      throw new Error(`PhonePe API error: ${errorMessage}`);
    }

    // Check for PhonePe-specific error codes
    if (phonepeData.code && (phonepeData.code === 'BAD_REQUEST' || phonepeData.code === 'INTERNAL_SERVER_ERROR')) {
      console.error('PhonePe API business error:', phonepeData.code, phonepeData.message);
      throw new Error(`PhonePe API error: ${phonepeData.message || phonepeData.code}`);
    }

    // Validate required response fields
    if (!phonepeData.orderId || !phonepeData.redirectUrl) {
      console.error('Missing required fields in PhonePe response:', {
        hasOrderId: !!phonepeData.orderId,
        hasRedirectUrl: !!phonepeData.redirectUrl,
        state: phonepeData.state
      });
      throw new Error(`Invalid PhonePe response: missing required fields`);
    }

    // Validate state is PENDING
    if (phonepeData.state !== 'PENDING') {
      console.warn('Unexpected PhonePe order state:', phonepeData.state);
    }

    // Store order in database with PhonePe expiry time
    const expiresAt = phonepeData.expireAt 
      ? new Date(phonepeData.expireAt).toISOString()
      : new Date(Date.now() + 15 * 60 * 1000).toISOString(); // fallback: 15 minutes from now

    const { error: dbError } = await supabase
      .from('phonepe_orders')
      .insert({
        user_id: user_id,
        merchant_order_id: merchantOrderId,
        phonepe_order_id: phonepeData.orderId,
        amount: amount,
        currency: 'INR',
        status: 'CREATED',
        redirect_url: redirectUrl,
        expires_at: expiresAt,
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
        phonepe_order_id: phonepeData.orderId,
        status: 'pending',
      });

    if (purchaseError) {
      console.error('Purchase record error:', purchaseError);
    }

    // Track InitiateCheckout event with Meta Conversion API
    try {
      console.log('Triggering Meta InitiateCheckout event for user:', user_id);
      
      // Fetch user email from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', user_id)
        .single();

      if (!userError && userData) {
        await supabase.functions.invoke('track-meta-conversion', {
          body: {
            event_name: 'InitiateCheckout',
            user_data: {
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
            },
            custom_data: {
              value: amount,
              currency: 'INR',
            },
            event_source_url: 'https://tattests.me/dashboard/pricing',
          }
        });
        console.log('✅ Meta InitiateCheckout event sent');
      } else {
        console.warn('Could not fetch user data for Meta tracking:', userError);
      }
    } catch (metaError) {
      console.error('⚠️ Failed to send Meta conversion event (non-critical):', metaError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        checkoutUrl: phonepeData.redirectUrl,
        merchantOrderId: merchantOrderId,
        orderId: phonepeData.orderId,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating PhonePe payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});