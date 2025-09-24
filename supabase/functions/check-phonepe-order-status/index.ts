import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface PhonePeStatusResponse {
  orderId: string;
  state: 'COMPLETED' | 'FAILED' | 'PENDING' | 'EXPIRED';
  amount: number;
  expireAt: number;
  paymentDetails?: {
    paymentMode: string;
    transactionId: string;
    timestamp: number;
    amount: number;
    state: string;
    splitInstruments?: any[];
  }[];
}

async function getPhonePeAccessToken(forceRefresh = true): Promise<string | null> {
  try {
    console.log(`Getting PhonePe access token with force_refresh: ${forceRefresh}`);
    const { data, error } = await supabase.functions.invoke('generate-phonepe-token', {
      body: { force_refresh: forceRefresh }
    });
    
    if (error) {
      console.error('Error getting access token:', error);
      return null;
    }

    if (!data?.access_token) {
      console.error('No access token returned from generate-phonepe-token');
      return null;
    }
    
    console.log('Successfully retrieved fresh access token');
    return data.access_token;
  } catch (error) {
    console.error('Failed to get PhonePe access token:', error);
    return null;
  }
}

async function checkOrderStatus(merchantOrderId: string, accessToken: string): Promise<PhonePeStatusResponse | null> {
  try {
    console.log(`Checking status for order: ${merchantOrderId}`);
    console.log(`Using access token (first 20 chars): ${accessToken?.substring(0, 20)}...`);
    
    const url = `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status`;
    console.log(`API URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`,
      },
    });

    console.log(`PhonePe API Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`PhonePe API Response Body: ${responseText}`);

    if (!response.ok) {
      console.error(`PhonePe API error: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      return null;
    }

    try {
      const data: PhonePeStatusResponse = JSON.parse(responseText);
      console.log(`PhonePe status response for ${merchantOrderId}:`, JSON.stringify(data, null, 2));
      return data;
    } catch (parseError) {
      console.error(`Failed to parse PhonePe response: ${parseError.message}`);
      console.error(`Raw response: ${responseText}`);
      return null;
    }
  } catch (error) {
    console.error(`Error checking order status for ${merchantOrderId}:`, error);
    return null;
  }
}

async function reconcileOrder(merchantOrderId: string, phonePeStatus: PhonePeStatusResponse) {
  try {
    console.log(`Reconciling order: ${merchantOrderId}`);

    // Get the order and purchase records
    const { data: order, error: orderError } = await supabase
      .from('phonepe_orders')
      .select('*')
      .eq('merchant_order_id', merchantOrderId)
      .single();

    if (orderError || !order) {
      console.error(`Order not found for ${merchantOrderId}:`, orderError);
      return { success: false, error: 'Order not found' };
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('merchant_order_id', merchantOrderId)
      .single();

    if (purchaseError || !purchase) {
      console.error(`Purchase not found for ${merchantOrderId}:`, purchaseError);
      return { success: false, error: 'Purchase not found' };
    }

    // Update order status
    const newOrderStatus = phonePeStatus.state === 'COMPLETED' ? 'SUCCESS' : 
                          phonePeStatus.state === 'FAILED' ? 'FAILED' : 
                          phonePeStatus.state;

    const { error: updateOrderError } = await supabase
      .from('phonepe_orders')
      .update({
        status: newOrderStatus,
        phonepe_order_id: phonePeStatus.orderId,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_order_id', merchantOrderId);

    if (updateOrderError) {
      console.error(`Error updating order status:`, updateOrderError);
      return { success: false, error: 'Failed to update order status' };
    }

    // Update purchase status
    const newPurchaseStatus = phonePeStatus.state === 'COMPLETED' ? 'completed' : 
                             phonePeStatus.state === 'FAILED' ? 'failed' : 'pending';

    // Extract transaction ID from payment details if available
    const transactionId = phonePeStatus.paymentDetails?.[0]?.transactionId || null;
    const paymentMethod = phonePeStatus.paymentDetails?.[0]?.paymentMode || null;

    const { error: updatePurchaseError } = await supabase
      .from('purchases')
      .update({
        status: newPurchaseStatus,
        phonepe_order_id: phonePeStatus.orderId,
        phonepe_transaction_id: transactionId,
        payment_method: paymentMethod,
        callback_received_at: new Date().toISOString(),
      })
      .eq('merchant_order_id', merchantOrderId);

    if (updatePurchaseError) {
      console.error(`Error updating purchase status:`, updatePurchaseError);
      return { success: false, error: 'Failed to update purchase status' };
    }

    // Add credits if payment was successful
    if (phonePeStatus.state === 'COMPLETED' && purchase.status !== 'completed') {
      console.log(`Adding credits for successful payment: ${purchase.credits_purchased} credits to user ${purchase.user_id}`);
      
      const { data: creditResult, error: creditError } = await supabase.rpc(
        'add_credits_after_purchase',
        {
          p_user_id: purchase.user_id,
          p_purchase_id: purchase.id,
          p_credits_purchased: purchase.credits_purchased,
        }
      );

      if (creditError) {
        console.error(`Error adding credits:`, creditError);
        return { success: false, error: 'Failed to add credits' };
      }

      console.log(`Successfully added ${purchase.credits_purchased} credits to user ${purchase.user_id}`);
    }

    return { 
      success: true, 
      message: `Order ${merchantOrderId} reconciled successfully`,
      phonePeStatus: phonePeStatus.state,
      localStatus: newPurchaseStatus,
      creditsAdded: phonePeStatus.state === 'COMPLETED' && purchase.status !== 'completed' ? purchase.credits_purchased : 0
    };

  } catch (error) {
    console.error(`Error reconciling order ${merchantOrderId}:`, error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, merchantOrderId } = await req.json();

    if (action === 'check_single' && merchantOrderId) {
      console.log(`Checking single order: ${merchantOrderId}`);
      
      // Always use fresh token for order status checks
      const accessToken = await getPhonePeAccessToken(true);
      if (!accessToken) {
        return new Response(JSON.stringify({ 
          error: 'Failed to get fresh access token',
          merchantOrderId,
          phonePeStatus: null,
          reconcileResult: { success: false, error: 'Failed to get fresh access token' }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const phonePeStatus = await checkOrderStatus(merchantOrderId, accessToken);
      if (!phonePeStatus) {
        return new Response(JSON.stringify({ 
          merchantOrderId,
          phonePeStatus: null,
          reconcileResult: { success: false, error: 'Failed to check order status with PhonePe API' }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const reconcileResult = await reconcileOrder(merchantOrderId, phonePeStatus);
      
      return new Response(JSON.stringify({
        merchantOrderId,
        phonePeStatus: phonePeStatus,
        reconcileResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reconcile_all') {
      // Get all pending orders older than 1 minute
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
      
      const { data: pendingOrders, error } = await supabase
        .from('phonepe_orders')
        .select('merchant_order_id, created_at')
        .eq('status', 'CREATED')
        .lt('created_at', oneMinuteAgo);

      if (error) {
        console.error('Error fetching pending orders:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch pending orders' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Found ${pendingOrders?.length || 0} pending orders to reconcile`);

      // Get fresh access token for bulk reconciliation
      const accessToken = await getPhonePeAccessToken(true);
      if (!accessToken) {
        return new Response(JSON.stringify({ 
          error: 'Failed to get fresh access token for bulk reconciliation',
          action: 'reconcile_all',
          totalProcessed: 0,
          results: []
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const results = [];
      for (const order of pendingOrders || []) {
        const phonePeStatus = await checkOrderStatus(order.merchant_order_id, accessToken);
        if (phonePeStatus) {
          const reconcileResult = await reconcileOrder(order.merchant_order_id, phonePeStatus);
          results.push({
            merchantOrderId: order.merchant_order_id,
            phonePeStatus: phonePeStatus,
            reconcileResult
          });
        } else {
          // Handle failed API calls gracefully
          results.push({
            merchantOrderId: order.merchant_order_id,
            phonePeStatus: null,
            reconcileResult: { success: false, error: 'Failed to check order status with PhonePe API' }
          });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return new Response(JSON.stringify({
        action: 'reconcile_all',
        totalProcessed: results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-phonepe-order-status function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});