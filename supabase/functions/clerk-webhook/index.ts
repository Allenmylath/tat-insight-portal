import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClerkUserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  profile_image_url: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id: string;
  created_at: number;
  updated_at: number;
  last_sign_in_at: number | null;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  banned: boolean;
}

interface ClerkSessionData {
  id: string;
  user_id: string;
  client_id: string;
  status: 'active' | 'ended' | 'revoked' | 'removed' | 'expired' | 'abandoned';
  created_at: number;
  updated_at: number;
  last_active_at: number;
  expire_at: number;
  abandon_at: number;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData | ClerkSessionData;
  object: 'event';
  timestamp: number;
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
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    // Handle user.created events
    if (event.type === 'user.created') {
      const userData = event.data as ClerkUserData;
      const primaryEmail = userData.email_addresses.find(
        email => email.id === userData.primary_email_address_id
      );
      
      if (!primaryEmail) {
        console.error('No primary email found for user');
        return new Response(
          JSON.stringify({ error: 'No primary email found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Creating user record for:', userData.id, primaryEmail.email_address);

      // Insert complete user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: userData.id,
          email: primaryEmail.email_address,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          profile_image_url: userData.profile_image_url,
          primary_email_id: userData.primary_email_address_id,
          account_created_at: new Date(userData.created_at).toISOString(),
          last_sign_in_at: userData.last_sign_in_at 
            ? new Date(userData.last_sign_in_at).toISOString() 
            : null,
          has_password: userData.password_enabled,
          has_two_factor: userData.two_factor_enabled,
          is_banned: userData.banned,
          membership_type: 'free'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create user record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ User created successfully:', data);
      
      return new Response(
        JSON.stringify({ success: true, user: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle user.updated events
    if (event.type === 'user.updated') {
      const userData = event.data as ClerkUserData;
      const primaryEmail = userData.email_addresses.find(
        email => email.id === userData.primary_email_address_id
      );

      console.log('Updating user record for:', userData.id);

      const { data, error } = await supabase
        .from('users')
        .update({
          email: primaryEmail?.email_address,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          profile_image_url: userData.profile_image_url,
          primary_email_id: userData.primary_email_address_id,
          last_sign_in_at: userData.last_sign_in_at 
            ? new Date(userData.last_sign_in_at).toISOString() 
            : null,
          has_password: userData.password_enabled,
          has_two_factor: userData.two_factor_enabled,
          is_banned: userData.banned,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', userData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update user record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ User updated successfully:', data);
      
      return new Response(
        JSON.stringify({ success: true, user: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle user.deleted events
    if (event.type === 'user.deleted') {
      const userData = event.data as ClerkUserData;
      
      console.log('Deleting user record for:', userData.id);

      try {
        // First check if user exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id, email')
          .eq('clerk_id', userData.id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking user existence:', checkError);
          throw checkError;
        }

        if (!existingUser) {
          console.log('⚠️ User not found, already deleted or never created');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'User not found in database, already deleted or never created' 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Deleting user:', existingUser.email, 'with ID:', existingUser.id);

        // Delete the user - cascade will handle related records
        const { data, error } = await supabase
          .from('users')
          .delete()
          .eq('clerk_id', userData.id)
          .select()
          .single();

        if (error) {
          console.error('Error deleting user:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log('✅ User deleted successfully:', existingUser.email);
        
        return new Response(
          JSON.stringify({ success: true, deletedUser: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to delete user:', error);
        // Log detailed error information
        if (error instanceof Error) {
          console.error('Delete error details:', {
            message: error.message,
            stack: error.stack
          });
        }
        
        // Return success anyway since user is already deleted in Clerk
        // We don't want to block Clerk webhook processing
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: 'User deleted from Clerk but database deletion failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle session.created events
    if (event.type === 'session.created') {
      const sessionData = event.data as ClerkSessionData;

      console.log('Creating session record for:', sessionData.id);

      // Get user_id from clerk_user_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', sessionData.user_id)
        .maybeSingle();

      if (!userData) {
        console.error('User not found for session:', sessionData.user_id);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert session record
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionData.id,
          user_id: userData.id,
          clerk_user_id: sessionData.user_id,
          client_id: sessionData.client_id,
          status: sessionData.status,
          event_type: 'session.created',
          session_created_at: new Date(sessionData.created_at).toISOString(),
          last_active_at: new Date(sessionData.last_active_at).toISOString(),
          expire_at: new Date(sessionData.expire_at).toISOString(),
          abandon_at: new Date(sessionData.abandon_at).toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update users table
      await supabase
        .from('users')
        .update({
          last_sign_in_at: new Date(sessionData.created_at).toISOString(),
          last_active_at: new Date(sessionData.last_active_at).toISOString()
        })
        .eq('id', userData.id);

      // Refresh activity summary
      await supabase.rpc('refresh_user_activity_summary', { 
        p_user_id: userData.id 
      });

      console.log('✅ Session created successfully:', sessionRecord);
      
      return new Response(
        JSON.stringify({ success: true, session: sessionRecord }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle session.ended events
    if (event.type === 'session.ended') {
      const sessionData = event.data as ClerkSessionData;

      console.log('Ending session:', sessionData.id);

      // Get the session to calculate duration
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('session_created_at, user_id')
        .eq('session_id', sessionData.id)
        .maybeSingle();

      if (!existingSession) {
        console.error('Session not found:', sessionData.id);
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate session duration
      const duration = Math.floor(
        (new Date(sessionData.updated_at).getTime() - 
         new Date(existingSession.session_created_at).getTime()) / 1000
      );

      // Update session record
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('user_sessions')
        .update({
          status: 'ended',
          event_type: 'session.ended',
          session_ended_at: new Date(sessionData.updated_at).toISOString(),
          last_active_at: new Date(sessionData.last_active_at).toISOString(),
          session_duration_seconds: duration
        })
        .eq('session_id', sessionData.id)
        .select()
        .single();

      if (sessionError) {
        console.error('Error updating session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to update session record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Refresh activity summary
      await supabase.rpc('refresh_user_activity_summary', { 
        p_user_id: existingSession.user_id 
      });

      console.log('✅ Session ended successfully:', sessionRecord);
      
      return new Response(
        JSON.stringify({ success: true, session: sessionRecord }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle session.revoked and session.removed events
    if (event.type === 'session.revoked' || event.type === 'session.removed') {
      const sessionData = event.data as ClerkSessionData;
      const newStatus = event.type === 'session.revoked' ? 'revoked' : 'removed';

      console.log(`${event.type} for session:`, sessionData.id);

      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('session_id', sessionData.id)
        .maybeSingle();

      if (!existingSession) {
        console.error('Session not found:', sessionData.id);
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update session status
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('user_sessions')
        .update({
          status: newStatus,
          event_type: event.type,
          session_ended_at: new Date(sessionData.updated_at).toISOString()
        })
        .eq('session_id', sessionData.id)
        .select()
        .single();

      if (sessionError) {
        console.error('Error updating session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to update session record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Refresh activity summary
      await supabase.rpc('refresh_user_activity_summary', { 
        p_user_id: existingSession.user_id 
      });

      console.log(`✅ Session ${newStatus} successfully:`, sessionRecord);
      
      return new Response(
        JSON.stringify({ success: true, session: sessionRecord }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log unhandled event types
    console.warn('⚠️ Unhandled event type:', event.type);

    return new Response(
      JSON.stringify({ 
        message: 'Event received but not processed',
        event_type: event.type,
        note: 'This event type is not yet implemented in the webhook handler'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
