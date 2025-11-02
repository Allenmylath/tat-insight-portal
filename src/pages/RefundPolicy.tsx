import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Shield, Clock, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-saffron rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-gradient-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">TAT Pro</h1>
              <p className="text-xs text-muted-foreground">Refund Policy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Refund Policy</h1>
            <p className="text-lg text-muted-foreground">
              MYLATH HOLDINGS - TAT Pro Assessment Platform
            </p>
          </div>

          <div className="grid gap-8">
            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-primary" />
                  Refund Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We offer refunds within <strong className="text-foreground">5 working days</strong> of purchase for eligible transactions.
                </p>
                <p className="text-muted-foreground">
                  Refund requests must be submitted within this timeframe through our official support channels.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Refunds are available for:</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Technical issues preventing access to purchased assessments</li>
                    <li>Duplicate payments or billing errors</li>
                    <li>Service unavailability due to system maintenance</li>
                    <li>Unsatisfactory service quality within the specified timeframe</li>
                  </ul>
                </div>
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-foreground">Refunds are NOT available for:</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Completed assessments where results have been provided</li>
                    <li>Change of mind after successful service delivery</li>
                    <li>Requests made after the 5 working day period</li>
                    <li>Partial completion of purchased assessment packages</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Refund Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Step 1: Submit Request</h4>
                    <p className="text-muted-foreground">
                      Contact our support team at <strong>support@tatpro.com</strong> with your transaction details, 
                      purchase receipt, and reason for refund.
                    </p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Step 2: Review Process</h4>
                    <p className="text-muted-foreground">
                      Our team will review your request within 2 business days and verify eligibility 
                      based on our refund criteria.
                    </p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Step 3: Refund Processing</h4>
                    <p className="text-muted-foreground">
                      Approved refunds will be processed within 3-7 business days to the original 
                      payment method used for the purchase.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Company:</strong> MYLATH HOLDINGS
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Email:</strong> support@tatpro.com
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Phone:</strong> +91 9605214280
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Business Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Refund processing times may vary based on your bank or payment provider</li>
                  <li>International transactions may take additional time for processing</li>
                  <li>All refund requests must include valid transaction IDs and purchase receipts</li>
                  <li>MYLATH HOLDINGS reserves the right to update this policy with prior notice</li>
                  <li>For disputes not covered by this policy, customers may escalate to relevant consumer forums</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Last updated: December 2024 | © 2024 TAT Pro by MYLATH HOLDINGS
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;