import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DeviceSwitchInstructionsProps {
  testId: string;
  testTitle: string;
}

export const DeviceSwitchInstructions = ({ testId, testTitle }: DeviceSwitchInstructionsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Generate the full URL for the test
  const testUrl = `${window.location.origin}/test/${testId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(testUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Paste this link on your desktop browser to continue.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          Switch to Desktop
        </CardTitle>
        <CardDescription>
          Continue taking "{testTitle}" on a larger screen for the best experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Test Link</p>
          <div className="flex gap-2">
            <Input 
              value={testUrl} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-medium">How to continue on desktop:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Copy the link above</li>
            <li>Open your desktop or laptop browser</li>
            <li>Paste the link and press Enter</li>
            <li>Log in if needed and start the test</li>
          </ol>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Why desktop?</strong> TAT tests work best on larger screens 
            with a physical keyboard for comfortable typing and better focus during the timed session.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
