import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const BATCH_SIZE = 20; // Max 20 emails per minute
const BATCH_DELAY_MS = 60000; // 1 minute between batches
const EMAIL_DELAY_MS = 5000; // 5 seconds between each email (safer for rate limits)
const MAX_EMAIL_ATTEMPTS = 3; // Maximum retry attempts

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔍 Starting inactive users check...');

  try {
    let totalSuccess = 0;
    let totalFailure = 0;

    // STEP 1: Retry failed emails from previous runs
    console.log('📧 Step 1: Checking for failed emails to retry...');
    const { data: failedCredits, error: failedQueryError } = await supabase
      .from('promotional_credits')
      .select('id, user_id, claim_token, email_attempts, token_expires_at')
      .eq('email_delivery_status', 'failed')
      .lt('email_attempts', MAX_EMAIL_ATTEMPTS)
      .gt('token_expires_at', new Date().toISOString()) // Only retry non-expired tokens
      .eq('is_claimed', false)
      .order('last_email_attempt_at', { ascending: true });

    if (failedQueryError) {
      console.error('❌ Error querying failed emails:', failedQueryError);
    } else if (failedCredits && failedCredits.length > 0) {
      console.log(`🔄 Found ${failedCredits.length} failed emails to retry`);

      // Process retries sequentially with delays
      for (let i = 0; i < failedCredits.length; i++) {
        const credit = failedCredits[i];
        
        try {
          // Get user email
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', credit.user_id)
            .single();

          if (!user) {
            console.error(`❌ User not found for credit ${credit.id}`);
            continue;
          }

          console.log(`🔄 Retrying email for ${user.email} (attempt ${credit.email_attempts + 1}/${MAX_EMAIL_ATTEMPTS})`);

          // Attempt to send email
          const emailResult = await supabase.functions.invoke('send-promotional-email', {
            body: {
              user_id: credit.user_id,
              user_email: user.email,
              promotional_credit_id: credit.id,
              claim_token: credit.claim_token,
            },
          });

          if (emailResult.error) {
            console.error(`⚠️ Retry failed for ${user.email}:`, emailResult.error);
            
            // Check if max attempts reached
            if (credit.email_attempts + 1 >= MAX_EMAIL_ATTEMPTS) {
              await supabase
                .from('promotional_credits')
                .update({
                  email_delivery_status: 'permanently_failed',
                  email_attempts: credit.email_attempts + 1,
                  last_email_attempt_at: new Date().toISOString(),
                })
                .eq('id', credit.id);
              console.log(`❌ Marked as permanently_failed after ${MAX_EMAIL_ATTEMPTS} attempts`);
            } else {
              await supabase
                .from('promotional_credits')
                .update({
                  email_attempts: credit.email_attempts + 1,
                  last_email_attempt_at: new Date().toISOString(),
                })
                .eq('id', credit.id);
            }
            totalFailure++;
          } else {
            console.log(`✅ Retry successful for ${user.email}`);
            totalSuccess++;
          }

        } catch (retryError: any) {
          console.error(`💥 Error during retry:`, retryError.message);
          totalFailure++;
        }

        // Add delay between retry emails
        if (i < failedCredits.length - 1) {
          console.log(`⏳ Waiting ${EMAIL_DELAY_MS / 1000} seconds before next retry...`);
          await delay(EMAIL_DELAY_MS);
        }
      }

      console.log(`✅ Retry phase complete: ${totalSuccess} success, ${totalFailure} failures`);
      
      // Wait before processing new users
      if (failedCredits.length > 0) {
        console.log(`⏳ Waiting ${BATCH_DELAY_MS / 1000} seconds before processing new users...`);
        await delay(BATCH_DELAY_MS);
      }
    } else {
      console.log('✅ No failed emails to retry');
    }

    // STEP 2: Find inactive users for new promotional credits
    console.log('📧 Step 2: Checking for new inactive users...');
    const { data: inactiveUsers, error: queryError } = await supabase
      .rpc('get_inactive_users_for_promotion');

    if (queryError) {
      console.error('❌ Error querying inactive users:', queryError);
      return new Response(
        JSON.stringify({ success: false, message: 'Query error, will retry tomorrow' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${inactiveUsers?.length || 0} inactive users`);

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No inactive users found', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Split users into batches of 20
    const batches = [];
    for (let i = 0; i < inactiveUsers.length; i += BATCH_SIZE) {
      batches.push(inactiveUsers.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Processing ${batches.length} batches (max ${BATCH_SIZE} emails per batch)`);

    // Process each batch sequentially (with delay)
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📧 Processing new users batch ${batchIndex + 1}/${batches.length} (${batch.length} users)`);

      // Process each user sequentially with delay to avoid rate limits
      const batchResults = [];
      for (let i = 0; i < batch.length; i++) {
        const user = batch[i];
        try {
          // Generate unique claim token
          const claimToken = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

          // Insert promotional credit record
          const { data: promoCredit, error: insertError } = await supabase
            .from('promotional_credits')
            .insert({
              user_id: user.id,
              credit_type: 'inactivity_bonus',
              credits_amount: 200,
              claim_token: claimToken,
              token_expires_at: expiresAt.toISOString(),
              email_delivery_status: 'pending',
              email_attempts: 0,
            })
            .select()
            .single();

          if (insertError) {
            console.error(`❌ Failed to create promo credit for ${user.email}:`, insertError);
            throw insertError;
          }

          // Call send-promotional-email function
          const emailResult = await supabase.functions.invoke('send-promotional-email', {
            body: {
              user_id: user.id,
              user_email: user.email,
              promotional_credit_id: promoCredit.id,
              claim_token: claimToken,
            },
          });

          if (emailResult.error) {
            console.error(`⚠️ Email function error for ${user.email}:`, emailResult.error);
            throw emailResult.error;
          }

          console.log(`✅ Email sent for ${user.email}`);
          batchResults.push({ status: 'fulfilled', value: { success: true, email: user.email } });

        } catch (userError: any) {
          console.error(`💥 Error processing user ${user.email}:`, userError.message);
          batchResults.push({ status: 'rejected', value: { success: false, email: user.email, error: userError.message } });
        }

        // Add delay between emails (except after the last one)
        if (i < batch.length - 1) {
          console.log(`⏳ Waiting ${EMAIL_DELAY_MS / 1000} seconds before next email...`);
          await delay(EMAIL_DELAY_MS);
        }
      }

      // Count successes and failures for this batch
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          totalSuccess++;
        } else {
          totalFailure++;
        }
      });

      console.log(`✅ Batch ${batchIndex + 1} complete: ${totalSuccess} total success, ${totalFailure} total failures`);

      // Wait 60 seconds before processing next batch (unless it's the last batch)
      if (batchIndex < batches.length - 1) {
        console.log(`⏳ Waiting ${BATCH_DELAY_MS / 1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log(`✅ All batches processed: ${totalSuccess} success, ${totalFailure} failures`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All batches processed',
        total: inactiveUsers.length,
        successful: totalSuccess,
        failed: totalFailure,
        batches: batches.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Critical error in check-inactive-users:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Function error, will retry tomorrow',
        error: error.message,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

Deno.serve(handler);
