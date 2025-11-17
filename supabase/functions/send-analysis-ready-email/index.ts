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
  type: "INSERT";
  table: "analysis_results";
  record: {
    id: string;
    test_session_id: string;
    user_id: string;
    analysis_data: any;
    confidence_score: number;
    generated_at: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: TriggerPayload = await req.json();
    console.log("Analysis ready email triggered for:", payload.record.id);

    // Fetch session with user and test details
    const { data: sessionData, error: sessionError } = await supabase
      .from("test_sessions")
      .select(`
        tattest_id,
        user_id,
        users!inner(email, first_name),
        tattest!inner(title)
      `)
      .eq("id", payload.record.test_session_id)
      .single();

    if (sessionError || !sessionData) {
      throw new Error(`Session data not found: ${sessionError?.message}`);
    }

    const userEmail = sessionData.users.email;
    const firstName = sessionData.users.first_name || "there";
    const testTitle = sessionData.tattest.title;

    // Send analysis ready email
    const { data, error } = await resend.emails.send({
      from: "Allen <allen@notifications.tattests.me>",
      to: [userEmail],
      subject: "✨ Your TAT Test Analysis is Ready!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">
            ✨ Your TAT Test Analysis is Ready!
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Hi ${firstName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Good news! The detailed analysis for your TAT test <strong>"${testTitle}"</strong> is now complete and ready to view.
          </p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
            <h2 style="color: #1e40af; font-size: 18px; margin-top: 0; margin-bottom: 15px;">
              Your Analysis Includes:
            </h2>
            <ul style="font-size: 16px; line-height: 1.8; margin: 0;">
              <li>📊 <strong>Personality Traits</strong> - Big Five assessment</li>
              <li>🎯 <strong>Murray's Needs</strong> - Detailed breakdown of 28 psychological needs</li>
              <li>⚔️ <strong>Military Assessment</strong> - Leadership, teamwork, stress management scores</li>
              <li>🏆 <strong>Selection Recommendations</strong> - SSB suitability analysis</li>
              <li>🧠 <strong>Psychodynamic Insights</strong> - Deep psychological patterns</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://tattests.me/dashboard/attempted" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
              View Your Detailed Analysis →
            </a>
          </div>
          
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">
            Understanding Your Results
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            <strong>📋 Detailed Test Analysis Page:</strong><br/>
            This is where you'll find the complete breakdown of THIS specific test, including all psychological assessments, 
            military suitability scores, and personalized recommendations.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            <strong>📈 Overall Summary Page:</strong><br/>
            Visit this page to see how your results compare across all tests you've taken and view your aggregate psychological profile.
          </p>
          
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">
            Next Steps
          </h2>
          
          <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
            <li>✅ <a href="https://tattests.me/dashboard/attempted" style="color: #2563eb; text-decoration: none;">Review your detailed analysis</a></li>
            <li>📈 Track your progress over time</li>
            <li>🎯 <a href="https://tattests.me/dashboard/pending" style="color: #2563eb; text-decoration: none;">Take more tests</a> to build comprehensive profile</li>
            <li>💪 Work on areas identified for development</li>
          </ul>
          
          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="font-size: 14px; line-height: 1.6; margin: 0;">
              💡 <strong>Tip:</strong> Taking 5-10 tests provides the most comprehensive and accurate psychological profile for SSB preparation!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="font-size: 14px; line-height: 1.6; color: #666;">
            Keep up the great work!<br/><br/>
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

    console.log("Analysis ready email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-analysis-ready-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
