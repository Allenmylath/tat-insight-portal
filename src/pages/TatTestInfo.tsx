import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Heart, 
  Target, 
  Users, 
  Shield, 
  Lightbulb, 
  ArrowLeft,
  Trophy,
  Globe,
  Compass
} from "lucide-react";

const TatTestInfo = () => {
  const navigate = useNavigate();

  const needCategories = [
    {
      title: "Power & Achievement",
      icon: <Trophy className="h-6 w-6" />,
      description: "Motivated by desire for power, property, prestige, knowledge, and creativity",
      needs: [
        { name: "Achievement", desc: "Working toward goals with energy and persistence" },
        { name: "Dominance", desc: "Controlling and influencing one's environment" },
        { name: "Recognition", desc: "Seeking praise, prestige, and attention" },
        { name: "Understanding", desc: "Striving for knowledge and wisdom" }
      ]
    },
    {
      title: "Social & Emotional",
      icon: <Heart className="h-6 w-6" />,
      description: "Motivated by affection, admiration, sympathy, love, and dependence",
      needs: [
        { name: "Affiliation", desc: "Establishing friendly relations and emotional bonds" },
        { name: "Nurturance", desc: "Helping and supporting others in need" },
        { name: "Deference", desc: "Cooperating and respecting others" },
        { name: "Succorance", desc: "Seeking help, protection, and support" }
      ]
    },
    {
      title: "Freedom & Adventure",
      icon: <Compass className="h-6 w-6" />,
      description: "Motivated by desire for freedom, change, excitement, and play",
      needs: [
        { name: "Autonomy", desc: "Escaping restraint and remaining independent" },
        { name: "Change/Travel", desc: "Experiencing new lands and novel situations" },
        { name: "Play", desc: "Acting for fun and amusement" },
        { name: "Excitance", desc: "Creating emotional excitement and meeting danger" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              What is a TAT Test?
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The Thematic Apperception Test (TAT) is a psychological assessment that reveals personality traits, 
            motivations, and unconscious drives through storytelling based on ambiguous images.
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                How TAT Tests Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                TAT tests present participants with ambiguous images and ask them to create stories about what they see. 
                These stories reveal underlying psychological needs, conflicts, and motivational patterns based on 
                <strong> Murray's Needs & Presses</strong> framework.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    The Process
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• View an ambiguous image</li>
                    <li>• Create a story about what you see</li>
                    <li>• Describe characters' thoughts and feelings</li>
                    <li>• Explain what led to this moment</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    What It Reveals
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Unconscious motivations</li>
                    <li>• Personality traits</li>
                    <li>• Emotional patterns</li>
                    <li>• Psychological needs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                Murray's Psychological Needs Framework
              </CardTitle>
              <CardDescription>
                TAT tests are evaluated based on Henry Murray's comprehensive system of psychological needs and motivations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-3 gap-6">
                {needCategories.map((category, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <div className="text-primary">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {category.needs.map((need, needIndex) => (
                        <div key={needIndex} className="p-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {need.name}
                              </Badge>
                              <p className="text-sm text-muted-foreground">{need.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                Clinical Value & Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Assessment Areas</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Personality structure and dynamics</li>
                    <li>• Unconscious conflicts and motivations</li>
                    <li>• Emotional regulation patterns</li>
                    <li>• Interpersonal relationship styles</li>
                    <li>• Coping mechanisms and defenses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Professional Uses</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Clinical psychology assessment</li>
                    <li>• Therapy planning and treatment</li>
                    <li>• Career counseling and guidance</li>
                    <li>• Research in personality psychology</li>
                    <li>• Educational and developmental evaluation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
            <CardContent className="space-y-4">
              <Globe className="h-16 w-16 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Ready to Explore Your Personality?</h3>
              <p className="text-muted-foreground max-w-md">
                Take a TAT assessment to gain insights into your motivations, 
                personality traits, and unconscious drives.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="mt-4"
              >
                Start Your Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TatTestInfo;