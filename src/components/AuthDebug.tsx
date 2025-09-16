import { useAuth, useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AuthDebug = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>Clerk Loaded:</strong> {isLoaded ? 'Yes' : 'No'}</p>
          <p><strong>Is Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium">Sign In Button Test:</p>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="w-full">Test Sign In Button</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <p className="text-green-600">User is signed in!</p>
          </SignedIn>
        </div>
      </CardContent>
    </Card>
  );
};