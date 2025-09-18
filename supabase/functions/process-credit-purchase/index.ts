import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      user_id, 
      package_id, 
      payment_method, 
      payment_reference 
    } = await req.json();

    console.log('Processing credit purchase:', { user_id, package_id, payment_method, payment_reference });

    // Get credit package details
    const { data: creditPackage, error: packageError } = await supabaseClient
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !creditPackage) {
      throw new Error('Invalid credit package');
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('purchases')
      .insert({
        user_id,
        amount: creditPackage.price,
        currency: creditPackage.currency,
        credits_purchased: creditPackage.credits,
        payment_method,
        payment_reference,
        package_name: creditPackage.name,
        status: 'completed' // In production, this would be 'pending' until payment confirmation
      })
      .select()
      .single();

    if (purchaseError) {
      throw purchaseError;
    }

    // Add credits to user account
    const { data: creditsAdded, error: creditsError } = await supabaseClient
      .rpc('add_credits_after_purchase', {
        p_user_id: user_id,
        p_purchase_id: purchase.id,
        p_credits_purchased: creditPackage.credits
      });

    if (creditsError) {
      throw creditsError;
    }

    console.log('Credit purchase completed successfully:', { 
      purchase_id: purchase.id, 
      credits_added: creditPackage.credits 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        purchase_id: purchase.id,
        credits_added: creditPackage.credits,
        message: 'Credits added successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing credit purchase:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process credit purchase'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});