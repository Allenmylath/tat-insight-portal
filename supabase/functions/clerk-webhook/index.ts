import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    created_at: number;
    updated_at: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Clerk webhook received');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event: ClerkWebhookEvent = await req.json();
    console.log('Webhook event type:', event.type);
    console.log('User data:', event.data);

    // Handle user.created events
    if (event.type === 'user.created') {
      const { id: clerkId, email_addresses } = event.data;
      const primaryEmail = email_addresses.find(email => email.id === email_addresses[0]?.id);
      
      if (!primaryEmail) {
        console.error('No primary email found for user');
        return new Response(
          JSON.stringify({ error: 'No primary email found' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Creating user record for:', clerkId, primaryEmail.email_address);

      // Create user record in Supabase
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          email: primaryEmail.email_address,
          membership_type: 'free'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create user record' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('User created successfully:', data);
      
      return new Response(
        JSON.stringify({ success: true, user: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle user.deleted events
    if (event.type === 'user.deleted') {
      const { id: clerkId } = event.data;
      
      console.log('Deleting user record for:', clerkId);

      // Delete user record from Supabase
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', clerkId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting user:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user record' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('User deleted successfully:', data);
      
      return new Response(
        JSON.stringify({ success: true, deletedUser: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For other event types, just return success
    return new Response(
      JSON.stringify({ message: 'Event received but not processed' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});