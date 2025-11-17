import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmailTemplate {
  name: string;
  description: string;
  targetAudience: string;
  subject: string;
  body: string;
}

const templates: EmailTemplate[] = [
  {
    name: "First Purchase Incentive",
    description: "20% discount for users with 2+ completed tests",
    targetAudience: "Hot Leads (2-3+ tests)",
    subject: "{{first_name}}, unlock your full potential with 20% off! 🎯",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Hi {{first_name}}! 👋</h1>
  
  <p>We've noticed you've completed multiple TAT tests - impressive! Your dedication shows you're serious about your SSB preparation.</p>
  
  <p>You're currently working with limited credits, but imagine what you could achieve with unlimited access to:</p>
  <ul>
    <li>✓ Detailed psychological analysis</li>
    <li>✓ Murray Needs assessment</li>
    <li>✓ Military selection recommendations</li>
    <li>✓ Unlimited practice tests</li>
  </ul>
  
  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin: 0 0 10px 0;">Special Offer: 20% OFF</h2>
    <p style="margin: 0;">Use code <strong>FIRST20</strong> at checkout</p>
  </div>
  
  <a href="https://tattests.me/dashboard/pricing" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
    Upgrade Now
  </a>
  
  <p style="color: #666; font-size: 14px; margin-top: 20px;">This offer expires in 7 days.</p>
</div>`,
  },
  {
    name: "Credit Running Low",
    description: "15% discount when users have less than 50 credits",
    targetAudience: "Warm Leads (low credits)",
    subject: "Running low on credits? Here's 15% off to keep going! 💪",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Don't Stop Now, {{first_name}}! 🚀</h1>
  
  <p>We see you're running low on credits (only {{credits_balance}} left). Don't let that slow down your SSB preparation!</p>
  
  <p>Every practice test brings you closer to your goal. Our detailed analysis helps you:</p>
  <ul>
    <li>✓ Understand your psychological profile</li>
    <li>✓ Identify improvement areas</li>
    <li>✓ Build confidence for the real test</li>
  </ul>
  
  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin: 0 0 10px 0;">Limited Time: 15% OFF + 50 Bonus Credits</h2>
    <p style="margin: 0;">Use code <strong>LOWCREDIT15</strong></p>
  </div>
  
  <a href="https://tattests.me/dashboard/pricing" style="background: #eab308; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
    Get More Credits
  </a>
  
  <p style="color: #666; font-size: 14px; margin-top: 20px;">Keep your momentum going!</p>
</div>`,
  },
  {
    name: "Multi-Test Champion",
    description: "25% discount for power users with 3+ tests",
    targetAudience: "Hot Leads (3+ tests)",
    subject: "You've mastered 3 tests, {{first_name}}! Ready for the next level? 🚀",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Congratulations, {{first_name}}! 🎉</h1>
  
  <p>You've completed 3 TAT tests - you're in the top 5% of our users! Your dedication is outstanding.</p>
  
  <p>At this level, you're not just practicing - you're mastering the art of psychological assessment. It's time to unlock your full potential.</p>
  
  <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin: 0 0 10px 0;">Champion's Offer: 25% OFF + 100 Bonus Credits</h2>
    <p style="margin: 0;">Use code <strong>CHAMPION25</strong></p>
    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Because champions deserve champion pricing</p>
  </div>
  
  <a href="https://tattests.me/dashboard/pricing" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
    Claim Your Offer
  </a>
  
  <p style="color: #666; font-size: 14px; margin-top: 20px;">Valid for 48 hours only - don't miss out!</p>
</div>`,
  },
];

interface EmailTemplatesProps {
  onSelectTemplate: (template: { subject: string; body: string }) => void;
}

export function EmailTemplates({ onSelectTemplate }: EmailTemplatesProps) {
  return (
    <div className="space-y-4 py-4">
      {templates.map((template, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <Badge variant="outline">{template.targetAudience}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                <p className="text-sm">{template.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preview:</p>
                <div 
                  className="text-xs p-3 bg-muted rounded-md max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: template.body }}
                />
              </div>
            </div>
            <Button 
              onClick={() => onSelectTemplate({ subject: template.subject, body: template.body })}
              className="w-full"
            >
              Use This Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}