import { ArrowLeft, Award, Shield, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About MYLATH HOLDINGS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Pioneering excellence in psychological assessment and military recruitment solutions since 2023
          </p>
        </div>

        {/* Company Overview */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2023, MYLATH HOLDINGS has quickly established itself as a trusted leader 
                in the field of psychological assessment and military recruitment technology. Our company 
                was born from a vision to revolutionize how organizations evaluate human potential and 
                psychological profiles.
              </p>
              <p>
                With deep expertise in psychological testing methodologies and cutting-edge technology, 
                we bridge the gap between traditional assessment techniques and modern digital solutions. 
                Our platform brings the scientifically-proven Thematic Apperception Test (TAT) into 
                the digital age, making it more accessible and efficient for military organizations worldwide.
              </p>
              <p>
                Since our incorporation, we have been committed to maintaining the highest standards 
                of scientific rigor while delivering innovative solutions that meet the evolving needs 
                of our clients in defense and security sectors.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <div className="bg-accent/30 p-6 rounded-lg border-l-4 border-primary">
              <p className="text-muted-foreground leading-relaxed mb-4">
                To empower military organizations with advanced psychological assessment tools 
                that enhance recruitment accuracy, improve personnel selection, and strengthen 
                national security through evidence-based evaluation methods.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We are dedicated to preserving the scientific integrity of established psychological 
                tests while making them more efficient, accessible, and actionable for modern military needs.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Integrity</h3>
              <p className="text-sm text-muted-foreground">
                Unwavering commitment to ethical practices and scientific accuracy in all our assessments.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Excellence</h3>
              <p className="text-sm text-muted-foreground">
                Striving for the highest quality in every aspect of our psychological assessment platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Precision</h3>
              <p className="text-sm text-muted-foreground">
                Delivering accurate, reliable, and scientifically-validated assessment results.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Service</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated to supporting military organizations in making informed recruitment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Commitment Section */}
        <div className="bg-accent/20 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Commitment</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            At MYLATH HOLDINGS, we understand the critical importance of accurate personnel assessment 
            in military contexts. Since our establishment in 2023, we have been committed to providing 
            cutting-edge psychological evaluation tools that help identify the right candidates for 
            critical roles in defense and security. Our platform combines decades of psychological 
            research with modern technology to deliver assessments that are both scientifically sound 
            and practically applicable.
          </p>
        </div>
      </div>
    </div>
  );
}