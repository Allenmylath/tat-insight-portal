import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
const META_ACCESS_TOKEN = Deno.env.get('META_CONVERSION_ACCESS_TOKEN');

interface TrackConversionRequest {
  event_name: 'CompleteRegistration' | 'InitiateCheckout';
  user_data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
  };
  event_source_url?: string;
}

// Hash data with SHA256
function hashData(data: string | null | undefined): string | undefined {
  if (!data) return undefined;
  const normalized = data.toLowerCase().trim();
  return createHash('sha256').update(normalized).digest('hex');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      throw new Error('Meta Pixel ID or Access Token not configured');
    }

    const { event_name, user_data, custom_data, event_source_url }: TrackConversionRequest = await req.json();

    console.log('Tracking Meta conversion:', event_name, 'for user:', user_data.email);

    // Prepare hashed user data
    const hashedUserData: Record<string, string> = {};
    if (user_data.email) hashedUserData.em = hashData(user_data.email)!;
    if (user_data.first_name) hashedUserData.fn = hashData(user_data.first_name)!;
    if (user_data.last_name) hashedUserData.ln = hashData(user_data.last_name)!;
    if (user_data.phone) hashedUserData.ph = hashData(user_data.phone)!;

    // Build event data
    const eventData = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: event_source_url || 'https://tattests.me',
      user_data: hashedUserData,
      ...(custom_data && { custom_data }),
    };

    console.log('Sending event to Meta:', JSON.stringify(eventData, null, 2));

    // Send to Meta Conversion API
    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [eventData],
          access_token: META_ACCESS_TOKEN,
        }),
      }
    );

    const metaData = await metaResponse.json();
    console.log('Meta API response:', JSON.stringify(metaData, null, 2));

    if (!metaResponse.ok) {
      throw new Error(`Meta API error: ${JSON.stringify(metaData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, meta_response: metaData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking Meta conversion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});