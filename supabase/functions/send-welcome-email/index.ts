import { Resend } from 'npm:resend@4.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  type: 'INSERT';
  table: 'users';
  record: {
    id: string;
    email: string;
    clerk_id: string;
    credit_balance: number;
    membership_type: string;
    created_at: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    console.log('Welcome email webhook triggered for user:', payload.record.email);

    // Send welcome email with plain HTML (no buttons)
    const { data, error } = await resend.emails.send({
      from: 'Allen <allen@notifications.tattests.me>',
      to: [payload.record.email],
      subject: 'Welcome to TAT Insight Portal - Start Your Psychological Assessment Journey',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">
            Welcome to TAT Insight Portal!
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Hi there,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Thank you for joining TAT Insight Portal. We're excited to have you on board!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            TAT Insight Portal is your comprehensive platform for Thematic Apperception Test (TAT) assessments, 
            designed specifically for SSB interview preparation and psychological evaluation.
          </p>
          
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">
            What You Can Do:
          </h2>
          
          <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
            <li>Take comprehensive TAT tests with AI-powered analysis</li>
            <li>Track your progress and improvement over time</li>
            <li>Get detailed psychological insights based on Murray's 28 needs</li>
            <li>Prepare for SSB interviews with realistic test scenarios</li>
            <li>Access your test history and results anytime</li>
          </ul>
          
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">
            Your Account:
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px; background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb;">
            🎉 <strong>Welcome Gift:</strong> You're starting with <strong>200 FREE credits</strong>! 
            That's enough for 2 complete TAT test sessions with detailed AI analysis.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            <strong>Current Credit Balance:</strong> ${payload.record.credit_balance} credits<br/>
            <strong>Membership:</strong> ${payload.record.membership_type.charAt(0).toUpperCase() + payload.record.membership_type.slice(1)}
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            You can start taking tests right away. Visit your dashboard at:<br/>
            <a href="https://tattests.me/dashboard" style="color: #2563eb; text-decoration: none;">https://tattests.me/dashboard</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 10px;">
            Need help? Have questions? We're here to support you.
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #666;">
            Best regards,<br/>
            Allen<br/>
            TAT Insight Portal Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Welcome email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-welcome-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

Deno.serve(handler);
