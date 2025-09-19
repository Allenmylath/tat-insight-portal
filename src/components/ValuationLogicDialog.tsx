import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Brain, Target, AlertCircle } from "lucide-react";

interface ValuationLogicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export const ValuationLogicDialog = ({ open, onOpenChange, onAccept }: ValuationLogicDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">TAT Test Analysis: Valuation Logic</DialogTitle>
              <DialogDescription>
                Understanding Murray's Method of Thematic Apperception Test Analysis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="px-6 max-h-[60vh]">
          <div className="space-y-6 pb-6">
            {/* Important Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    Important Disclaimer
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    This analysis is generated using AI interpretation of your responses and should be used for educational and self-reflection purposes only. 
                    It is not a substitute for professional psychological evaluation or clinical diagnosis.
                  </p>
                </div>
              </div>
            </div>

            {/* Murray's Method Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Murray's Method of TAT Analysis</h3>
              </div>
              
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  The Thematic Apperception Test (TAT), developed by Henry Murray in the 1930s, is a projective psychological test 
                  that reveals underlying motives, concerns, and the way people see the social world through stories they create about ambiguous images.
                </p>
                
                <p>
                  Murray's original method focuses on identifying recurring themes and psychological needs that emerge across the stories, 
                  providing insights into personality structure and unconscious drives.
                </p>
              </div>
            </div>

            <Separator />

            {/* Analysis Framework */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Our Analysis Framework</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Core Elements Analyzed:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Themes:</strong> Recurring patterns in your narratives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Emotional Tone:</strong> Underlying feelings and mood</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Character Dynamics:</strong> Relationships and interactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Conflict Resolution:</strong> How problems are addressed</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Psychological Dimensions:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Personality Traits:</strong> Five-factor model assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Coping Mechanisms:</strong> Stress and challenge responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Social Perspective:</strong> Interpersonal orientation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Motivational Patterns:</strong> Underlying drives and needs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Confidence Score */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confidence Score Calculation</h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  The confidence score reflects the reliability of the analysis based on several factors:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mb-2">Story Length</Badge>
                    <p className="text-xs">Longer, more detailed stories provide richer content for analysis</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mb-2">Narrative Depth</Badge>
                    <p className="text-xs">Stories with complex characters and emotions yield better insights</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mb-2">Thematic Clarity</Badge>
                    <p className="text-xs">Clear themes and consistent patterns increase analysis reliability</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Limitations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Limitations & Considerations</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• This is an AI-powered interpretation, not a clinical assessment</p>
                <p>• Results should be considered alongside other sources of self-knowledge</p>
                <p>• Individual context and circumstances may influence interpretation</p>
                <p>• For professional psychological evaluation, consult a licensed practitioner</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAccept} className="gap-2">
            <BookOpen className="h-4 w-4" />
            I Read and Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};