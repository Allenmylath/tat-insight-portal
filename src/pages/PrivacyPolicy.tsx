import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Shield, Lock, Eye, Database, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
              <p className="text-xs text-muted-foreground">Privacy Policy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              MYLATH HOLDINGS - TAT Pro Assessment Platform
            </p>
          </div>

          <div className="grid gap-8">
            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Our Commitment to Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  MYLATH HOLDINGS ("we," "our," or "us") operates the TAT Pro assessment platform. 
                  We are committed to protecting and respecting your privacy in accordance with applicable 
                  data protection laws and regulations.
                </p>
                <p className="text-muted-foreground">
                  This Privacy Policy explains how we collect, use, store, and protect your personal 
                  information when you use our services.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="h-5 w-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Personal Information</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Name, email address, and phone number</li>
                      <li>Account credentials and authentication data</li>
                      <li>Payment information (processed securely through third-party providers)</li>
                      <li>Profile information and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Assessment Data</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Test responses and psychological assessment data</li>
                      <li>Analysis results and reports</li>
                      <li>Usage patterns and assessment history</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Technical Information</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>IP address, browser type, and device information</li>
                      <li>Log files and usage analytics</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Eye className="h-5 w-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Service Provision</h4>
                    <p className="text-muted-foreground">
                      To provide TAT assessments, generate psychological reports, and deliver 
                      personalized insights based on your responses.
                    </p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Account Management</h4>
                    <p className="text-muted-foreground">
                      To create and maintain your account, process payments, and provide 
                      customer support services.
                    </p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Communication</h4>
                    <p className="text-muted-foreground">
                      To send service updates, assessment results, and respond to your 
                      inquiries and support requests.
                    </p>
                  </div>
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Improvement & Analytics</h4>
                    <p className="text-muted-foreground">
                      To analyze usage patterns, improve our services, and develop new 
                      features (using anonymized data where possible).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-5 w-5 text-primary" />
                  Data Protection & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational security measures to protect 
                    your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <div className="bg-accent/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Security Measures Include:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and authentication mechanisms</li>
                      <li>Secure hosting and backup procedures</li>
                      <li>Staff training on data protection protocols</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You have the following rights regarding your personal information:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Access</h4>
                    <p className="text-sm text-muted-foreground">Request copies of your personal data</p>
                  </div>
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Rectification</h4>
                    <p className="text-sm text-muted-foreground">Correct inaccurate information</p>
                  </div>
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Erasure</h4>
                    <p className="text-sm text-muted-foreground">Request deletion of your data</p>
                  </div>
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Portability</h4>
                    <p className="text-sm text-muted-foreground">Transfer data to another service</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  We retain your personal information only for as long as necessary to fulfill the 
                  purposes outlined in this policy, comply with legal obligations, or resolve disputes.
                </p>
                <div className="bg-accent/20 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Account Data:</strong> Retained while your account is active</li>
                    <li><strong>Assessment Data:</strong> Stored for service provision and analysis</li>
                    <li><strong>Payment Records:</strong> Kept as required by financial regulations</li>
                    <li><strong>Support Communications:</strong> Retained for 2 years for service improvement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  For questions about this Privacy Policy or to exercise your rights, contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Company:</strong> MYLATH HOLDINGS
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Email:</strong> privacy@tatpro.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Phone:</strong> +91 9605214280
                  </p>
                </div>
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

export default PrivacyPolicy;