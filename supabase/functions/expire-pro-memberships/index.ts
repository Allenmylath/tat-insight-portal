import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔍 Starting pro membership expiration check...');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find all pro users with expired memberships
    const { data: expiredUsers, error: queryError } = await supabase
      .from('users')
      .select('id, email, membership_type, membership_expires_at')
      .eq('membership_type', 'pro')
      .lt('membership_expires_at', new Date().toISOString());

    if (queryError) {
      console.error('❌ Error querying expired pro users:', queryError);
      throw queryError;
    }

    console.log(`📊 Found ${expiredUsers?.length || 0} expired pro memberships`);

    if (!expiredUsers || expiredUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired pro memberships found', 
          processed: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update all expired users to free
    const expiredUserIds = expiredUsers.map(user => user.id);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        membership_type: 'free',
        updated_at: new Date().toISOString()
      })
      .in('id', expiredUserIds);

    if (updateError) {
      console.error('❌ Error updating users to free:', updateError);
      throw updateError;
    }

    // Log each converted user
    expiredUsers.forEach(user => {
      console.log(`✅ Converted ${user.email} from pro to free (expired: ${user.membership_expires_at})`);
    });

    console.log(`✅ Successfully converted ${expiredUsers.length} users from pro to free`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Converted ${expiredUsers.length} expired pro memberships to free`,
        processed: expiredUsers.length,
        users: expiredUsers.map(u => ({ email: u.email, expired_at: u.membership_expires_at }))
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Critical error in expire-pro-memberships:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Function error',
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
