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
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantOrderId: string;
    orderId: string;
    state: 'COMPLETED' | 'FAILED' | 'PENDING' | 'EXPIRED';
    responseCode: string;
    amount: number;
    paymentInstrument?: {
      type: string;
      cardType?: string;
      pgTransactionId?: string;
    };
    transactionId?: string;
  };
}

async function getPhonePeAccessToken(): Promise<string | null> {
  try {
    console.log('Getting PhonePe access token...');
    const { data, error } = await supabase.functions.invoke('generate-phonepe-token');
    
    if (error) {
      console.error('Error getting access token:', error);
      return null;
    }
    
    return data?.access_token || null;
  } catch (error) {
    console.error('Failed to get PhonePe access token:', error);
    return null;
  }
}

async function checkOrderStatus(merchantOrderId: string, accessToken: string): Promise<PhonePeStatusResponse | null> {
  try {
    console.log(`Checking status for order: ${merchantOrderId}`);
    
    const response = await fetch(
      `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`PhonePe API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: PhonePeStatusResponse = await response.json();
    console.log(`PhonePe status response for ${merchantOrderId}:`, JSON.stringify(data, null, 2));
    
    return data;
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
    const newOrderStatus = phonePeStatus.data.state === 'COMPLETED' ? 'SUCCESS' : 
                          phonePeStatus.data.state === 'FAILED' ? 'FAILED' : 
                          phonePeStatus.data.state;

    const { error: updateOrderError } = await supabase
      .from('phonepe_orders')
      .update({
        status: newOrderStatus,
        phonepe_order_id: phonePeStatus.data.orderId,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_order_id', merchantOrderId);

    if (updateOrderError) {
      console.error(`Error updating order status:`, updateOrderError);
      return { success: false, error: 'Failed to update order status' };
    }

    // Update purchase status
    const newPurchaseStatus = phonePeStatus.data.state === 'COMPLETED' ? 'completed' : 
                             phonePeStatus.data.state === 'FAILED' ? 'failed' : 'pending';

    const { error: updatePurchaseError } = await supabase
      .from('purchases')
      .update({
        status: newPurchaseStatus,
        phonepe_order_id: phonePeStatus.data.orderId,
        phonepe_transaction_id: phonePeStatus.data.transactionId,
        payment_method: phonePeStatus.data.paymentInstrument?.type,
        callback_received_at: new Date().toISOString(),
      })
      .eq('merchant_order_id', merchantOrderId);

    if (updatePurchaseError) {
      console.error(`Error updating purchase status:`, updatePurchaseError);
      return { success: false, error: 'Failed to update purchase status' };
    }

    // Add credits if payment was successful
    if (phonePeStatus.data.state === 'COMPLETED' && purchase.status !== 'completed') {
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
      phonePeStatus: phonePeStatus.data.state,
      localStatus: newPurchaseStatus,
      creditsAdded: phonePeStatus.data.state === 'COMPLETED' && purchase.status !== 'completed' ? purchase.credits_purchased : 0
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
      // Check single order status
      const accessToken = await getPhonePeAccessToken();
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Failed to get access token' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const phonePeStatus = await checkOrderStatus(merchantOrderId, accessToken);
      if (!phonePeStatus) {
        return new Response(JSON.stringify({ error: 'Failed to check order status' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const reconcileResult = await reconcileOrder(merchantOrderId, phonePeStatus);
      
      return new Response(JSON.stringify({
        merchantOrderId,
        phonePeStatus: phonePeStatus.data,
        reconcileResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reconcile_all') {
      // Get all pending orders older than 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: pendingOrders, error } = await supabase
        .from('phonepe_orders')
        .select('merchant_order_id, created_at')
        .eq('status', 'CREATED')
        .lt('created_at', fiveMinutesAgo);

      if (error) {
        console.error('Error fetching pending orders:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch pending orders' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Found ${pendingOrders?.length || 0} pending orders to reconcile`);

      const accessToken = await getPhonePeAccessToken();
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Failed to get access token' }), {
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
            phonePeStatus: phonePeStatus.data,
            reconcileResult
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