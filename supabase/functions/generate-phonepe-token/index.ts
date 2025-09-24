import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role for database access
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PhonePe credentials from secrets
const phonePeClientId = Deno.env.get('PHONEPE_CLIENT_ID')!;
const phonePeClientSecret = Deno.env.get('PHONEPE_CLIENT_SECRET')!;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

async function getValidToken(forceRefresh = false): Promise<string | null> {
  try {
    // Check if we should use existing token (only if not forced refresh)
    if (!forceRefresh) {
      const { data: existingToken } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('provider', 'phonepe')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingToken) {
        console.log('Using existing valid token');
        return existingToken.access_token;
      }
    } else {
      console.log('Force refresh requested - generating new token');
    }

    // Generate new token if none exists or expired
    console.log('Generating new PhonePe access token');
    
    const requestBody = new URLSearchParams({
      client_version: '1',
      grant_type: 'client_credentials',
      client_id: phonePeClientId,
      client_secret: phonePeClientSecret,
    });

    const response = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody.toString(),
    });

    if (!response.ok) {
      throw new Error(`PhonePe API error: ${response.status} ${response.statusText}`);
    }

    const tokenData: TokenResponse = await response.json();
    console.log('Successfully generated new token');

    // Calculate expiration time (subtract 5 minutes for safety)
    const expiresAt = new Date(Date.now() + (tokenData.expires_in - 300) * 1000);

    // Store the new token in database
    const { error } = await supabase
      .from('access_tokens')
      .insert({
        provider: 'phonepe',
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('Error storing token:', error);
      throw error;
    }

    console.log('Token stored successfully');
    return tokenData.access_token;

  } catch (error) {
    console.error('Error getting/generating token:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body to check for force_refresh parameter
    let forceRefresh = false;
    try {
      if (req.method === 'POST') {
        const body = await req.json();
        forceRefresh = body.force_refresh === true;
      }
    } catch (e) {
      // Ignore parsing errors for backwards compatibility
    }

    console.log(`Token generation requested with force_refresh: ${forceRefresh}`);
    const token = await getValidToken(forceRefresh);

    return new Response(
      JSON.stringify({ 
        success: true, 
        access_token: token,
        message: 'Access token retrieved successfully' 
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to generate or retrieve access token' 
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});