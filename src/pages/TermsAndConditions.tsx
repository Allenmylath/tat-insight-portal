import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, FileText, Shield, AlertCircle, Scale, Gavel, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
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
              <p className="text-xs text-muted-foreground">Terms and Conditions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
            <p className="text-lg text-muted-foreground">
              MYLATH HOLDINGS - TAT Pro Assessment Platform
            </p>
          </div>

          <div className="grid gap-8">
            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  1. Introduction and Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">1.1. The Parties</h4>
                  <p className="text-muted-foreground">
                    These Terms and Conditions of Service ("Terms") are a binding agreement between MYLATH HOLDINGS 
                    ("Company," "we," "us," or "our") and the corporate entity, government agency, or organization 
                    ("Client," "User," or "you") accessing or using our proprietary psychological assessment platform 
                    and services (the "Service").
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">1.2. The Service</h4>
                  <p className="text-muted-foreground">
                    The Service includes the digital platform located at https://www.tattests.me/ and any associated 
                    proprietary technology, software, and psychological assessment tools, including, but not limited to, 
                    the digital implementation of the Thematic Apperception Test (TAT) platform ("TAT-Insight Portal"), 
                    designed primarily for military recruitment and psychological evaluation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">1.3. Acceptance</h4>
                  <p className="text-muted-foreground">
                    By accessing, using, or registering for the Service, the Client agrees to be bound by these Terms 
                    and any policies referenced herein, including our Privacy Policy. If you do not agree to these Terms, 
                    you may not use the Service.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  2. Nature of Service and Client Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">2.1. Professional-Grade Assessment</h4>
                  <p className="text-muted-foreground">
                    The Service provides sophisticated, scientifically-proven psychological assessment technology 
                    intended for use by professional organizations, specifically within the defense, security, and 
                    military recruitment sectors, for the purpose of evaluating human potential and psychological profiles.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">2.2. Client Eligibility</h4>
                  <p className="text-muted-foreground">
                    The Service is offered only to authorized organizational Clients (e.g., military units, government 
                    defense agencies, security contractors) and is not intended for use by individual consumers or for 
                    self-assessment. The Client represents and warrants that it is an organization lawfully authorized 
                    to conduct psychological assessments of its personnel or candidates.
                  </p>
                </div>
                <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    2.3. No Medical or Psychiatric Advice
                  </h4>
                  <p className="text-muted-foreground">
                    The Company provides a technological platform and scoring methodology for assessments. We are not 
                    licensed medical professionals, psychiatrists, or therapists. The results and reports generated by 
                    the Service are not intended to be, and must not be used as, a substitute for professional medical, 
                    psychiatric, or legal advice, diagnosis, or treatment. The Client is solely responsible for the 
                    interpretation and application of assessment results.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  3. Client Responsibilities and Obligations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">3.1. Authorized Use</h4>
                  <p className="text-muted-foreground">
                    The Client shall use the Service strictly in accordance with these Terms and any specific agreements 
                    (e.g., Statement of Work, Master Service Agreement) executed between the Client and MYLATH HOLDINGS.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">3.2. Compliance and Training</h4>
                  <p className="text-muted-foreground">
                    The Client is responsible for ensuring that all personnel accessing or administering the tests are 
                    appropriately qualified, trained, and maintain the necessary professional licenses or certifications 
                    required to administer and interpret psychological assessments in their jurisdiction.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">3.3. Security</h4>
                  <p className="text-muted-foreground">
                    The Client must implement and maintain appropriate administrative, physical, and technical safeguards 
                    to protect its account credentials and the confidentiality of the assessment results ("Assessment Data").
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">3.4. Necessary Consent</h4>
                  <p className="text-muted-foreground">
                    The Client is solely responsible for obtaining all necessary, legally-valid informed consent and 
                    permissions from individuals undergoing the assessment ("Test Subjects") for the collection, 
                    processing, and use of their psychological and personal data through the Service.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Scale className="h-5 w-5 text-primary" />
                  4. Intellectual Property Rights (IP)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">4.1. Company IP</h4>
                  <p className="text-muted-foreground">
                    All intellectual property rights in and to the Service, including the digital TAT content, test 
                    stimuli, scoring algorithms, methodology, technology, software, design, documentation, and the 
                    Company name and logo, are the exclusive property of MYLATH HOLDINGS.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">4.2. Limited License</h4>
                  <p className="text-muted-foreground">
                    Subject to these Terms and any service agreement, MYLATH HOLDINGS grants the Client a limited, 
                    non-exclusive, non-transferable, non-sublicensable license to access and use the Service solely 
                    for the Client's internal, authorized assessment purposes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">4.3. Restrictions</h4>
                  <p className="text-muted-foreground">
                    The Client shall not: (a) copy, modify, adapt, or create derivative works of the Service or the 
                    assessment content; (b) reverse engineer, decompile, or attempt to discover the source code or 
                    algorithms of the software; or (c) use the Service to build a competitive product or service.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  5. Data Protection, Privacy, and Confidentiality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">5.1. Confidentiality of Assessment Data</h4>
                  <p className="text-muted-foreground">
                    The data processed through the Service, including Test Subject responses and scores ("Assessment Data"), 
                    is highly sensitive. MYLATH HOLDINGS will treat all Assessment Data and other information provided by 
                    the Client as strictly confidential.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">5.2. Data Processing Role</h4>
                  <p className="text-muted-foreground">
                    For purposes of relevant data protection laws (e.g., GDPR, CCPA, specific military regulations), 
                    the Client is typically the Controller of the Assessment Data, and MYLATH HOLDINGS is the Processor 
                    (or Service Provider), processing the data solely on the Client's behalf and according to their 
                    documented instructions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">5.3. Data Security Measures</h4>
                  <p className="text-muted-foreground">
                    MYLATH HOLDINGS is committed to implementing and maintaining a high level of security appropriate to 
                    the risks associated with psychological and military-related data. Our security measures include 
                    encryption, access controls, and compliance standards.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">5.4. Privacy Policy</h4>
                  <p className="text-muted-foreground">
                    The Client agrees that use of the Service is also governed by our Privacy Policy, which details our 
                    practices regarding the collection and handling of data.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  6. Disclaimer of Warranties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">6.1. "As Is" Service</h4>
                  <p className="text-muted-foreground">
                    THE SERVICE AND ALL ASSOCIATED CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, 
                    WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                  </p>
                </div>
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">6.2. No Guarantee of Results</h4>
                  <p className="text-muted-foreground">
                    MYLATH HOLDINGS DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR 
                    THAT THE ASSESSMENT RESULTS WILL GUARANTEE THE FITNESS, CAPABILITY, OR FUTURE PERFORMANCE OF ANY 
                    TEST SUBJECT.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Gavel className="h-5 w-5 text-primary" />
                  7. Limitation of Liability and Indemnification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">7.1. Limitation of Liability</h4>
                  <p className="text-muted-foreground">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL MYLATH HOLDINGS BE LIABLE FOR ANY INDIRECT, 
                    PUNITIVE, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, OR ANY DAMAGES WHATSOEVER, INCLUDING, WITHOUT 
                    LIMITATION, DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT 
                    OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
                  </p>
                </div>
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">7.2. Client Indemnification</h4>
                  <p className="text-muted-foreground">
                    The Client agrees to indemnify, defend, and hold harmless MYLATH HOLDINGS from and against any and 
                    all claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising 
                    out of or relating to: (a) the Client's breach of these Terms; (b) the Client's failure to obtain 
                    proper consent from Test Subjects; or (c) the Client's interpretation or application of the assessment 
                    results.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-5 w-5 text-primary" />
                  8. Term, Termination, and Governing Law
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">8.1. Term</h4>
                  <p className="text-muted-foreground">
                    These Terms remain in full force and effect while the Client uses the Service, unless terminated 
                    as provided herein.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">8.2. Termination</h4>
                  <p className="text-muted-foreground">
                    We may suspend or terminate the Client's access to the Service immediately, without prior notice, 
                    if the Client materially breaches these Terms, including but not limited to unauthorized access or 
                    breach of confidentiality obligations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">8.3. Governing Law</h4>
                  <p className="text-muted-foreground">
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard 
                    to its conflict of law principles.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">9. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  For any questions regarding these Terms, please contact us at:
                </p>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Company:</strong> MYLATH HOLDINGS
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Website:</strong> https://www.tattests.me/
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Email:</strong> allengeorgemylath@gmail.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Address:</strong> MYLATH HOLDINGS<br />
                    NO 545 KARUNA NIVAS PERUMPUZHA<br />
                    PUNNAMUKKU KUNDARA ELAMPALLOOR<br />
                    KOLLAM KERALA 691504<br />
                    PERUMPUZHA - 691504<br />
                    KERALA<br />
                    INDIA
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

export default TermsAndConditions;
