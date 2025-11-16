import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClaimRequest {
  claim_token: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { claim_token, user_id }: ClaimRequest = await req.json();
    
    console.log(`🎫 Processing claim for user: ${user_id}, token: ${claim_token}`);
    
    // Fetch the promotional credit record
    const { data: promoCredit, error: fetchError } = await supabase
      .from('promotional_credits')
      .select('*')
      .eq('claim_token', claim_token)
      .single();
    
    if (fetchError || !promoCredit) {
      console.error('❌ Token not found:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired token' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Verify token belongs to the requesting user
    if (promoCredit.user_id !== user_id) {
      console.error('❌ Token does not belong to user');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This offer is not for your account' 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(promoCredit.token_expires_at);
    if (now > expiresAt) {
      console.error('❌ Token has expired');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This offer has expired' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if already claimed
    if (promoCredit.is_claimed) {
      console.error('❌ Credits already claimed');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'These credits have already been claimed' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Add credits using the database function
    const { data: addResult, error: addError } = await supabase
      .rpc('add_promotional_credits', {
        p_user_id: user_id,
        p_promotional_credit_id: promoCredit.id,
        p_credits_amount: promoCredit.credits_amount
      });
    
    if (addError) {
      console.error('❌ Error adding credits:', addError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to add credits' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Mark as claimed
    const { error: updateError } = await supabase
      .from('promotional_credits')
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', promoCredit.id);
    
    if (updateError) {
      console.error('⚠️ Error updating claim status:', updateError);
    }
    
    // Fetch updated user balance
    const { data: userData } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', user_id)
      .single();
    
    console.log(`✅ Credits claimed successfully. New balance: ${userData?.credit_balance}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        credits_added: promoCredit.credits_amount,
        new_balance: userData?.credit_balance
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error: any) {
    console.error('💥 Unexpected error in claim-promotional-credits:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

Deno.serve(handler);
