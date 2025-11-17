import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TriggerPayload {
  type: "UPDATE";
  table: "test_sessions";
  record: {
    id: string;
    user_id: string;
    tattest_id: string;
    completed_at: string;
    user_email?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: TriggerPayload = await req.json();
    console.log("First test completion email triggered for session:", payload.record.id);

    // Fetch user details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, first_name")
      .eq("id", payload.record.user_id)
      .single();

    if (userError || !userData) {
      throw new Error(`User not found: ${userError?.message}`);
    }

    // Fetch test details
    const { data: testData, error: testError } = await supabase
      .from("tattest")
      .select("title")
      .eq("id", payload.record.tattest_id)
      .single();

    if (testError || !testData) {
      throw new Error(`Test not found: ${testError?.message}`);
    }

    const userEmail = userData.email;
    const firstName = userData.first_name || "there";
    const testTitle = testData.title;

    // Send congratulations email
    const { data, error } = await resend.emails.send({
      from: "Allen <allen@notifications.tattests.me>",
      to: [userEmail],
      subject: "🎉 Congratulations! You've Completed Your First TAT Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">
            🎉 Congratulations on Completing Your First TAT Test!
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Hi ${firstName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Great job! You've just completed your first psychological assessment: <strong>"${testTitle}"</strong>. 
            Your story is now being analyzed by our advanced AI system.
          </p>
          
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">
            What Happens Next?
          </h2>
          
          <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
            <li>✨ AI Analysis in Progress (1-2 minutes)</li>
            <li>📊 Comprehensive psychological profile being generated</li>
            <li>🎯 Military assessment scores being calculated</li>
            <li>🏆 Selection recommendations being prepared</li>
          </ul>
          
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">
            Where to Find Your Results
          </h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
              <strong>📊 Detailed Test Analysis Page</strong>
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
              View comprehensive breakdown for each test you take:
            </p>
            <ul style="font-size: 14px; line-height: 1.8; margin: 0 0 15px 0;">
              <li>Individual test analysis</li>
              <li>Murray's 28 Needs breakdown</li>
              <li>Military assessment scores</li>
              <li>Selection recommendations</li>
              <li>Psychodynamic insights</li>
            </ul>
            <a href="https://tattests.me/dashboard/attempted" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Detailed Analysis →
            </a>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #6b7280; margin-bottom: 20px;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
              <strong>📈 Overall Summary Page</strong>
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
              See your aggregate psychological profile across all tests
            </p>
            <a href="https://tattests.me/dashboard/results" 
               style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Overall Summary →
            </a>
          </div>
          
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">
            💡 Pro Tip
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            The more tests you complete, the more accurate your psychological profile becomes! 
            We recommend taking at least <strong>5-10 tests</strong> for comprehensive SSB preparation.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Your detailed analysis will be ready shortly. We'll send you another email once it's complete!
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="font-size: 14px; line-height: 1.6; color: #666;">
            Best regards,<br/>
            Allen<br/>
            TAT Insight Portal Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("First test completion email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-first-test-completion-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
