import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Gift, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ClaimCredits() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [creditsAdded, setCreditsAdded] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      toast.error('Please sign in to claim your credits');
      navigate('/sign-in');
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid claim link. No token provided.');
    }
  }, [user, isLoaded, token, navigate]);

  const handleClaimCredits = async () => {
    if (!user || !token) return;

    setClaiming(true);
    setLoading(true);

    try {
      // Get user_id from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Could not find your account');
      }

      // Call claim edge function
      const { data, error } = await supabase.functions.invoke('claim-promotional-credits', {
        body: {
          claim_token: token,
          user_id: userData.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setCreditsAdded(data.credits_added);
        setNewBalance(data.new_balance);
        toast.success(`${data.credits_added} credits added to your account!`);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to claim credits');
      }
    } catch (err: any) {
      console.error('Error claiming credits:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'Failed to claim credits');
    } finally {
      setLoading(false);
      setClaiming(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Claim Your Free Credits</CardTitle>
          <CardDescription>
            {status === 'idle' && 'Confirm to add 200 FREE credits to your account'}
            {status === 'success' && 'Credits successfully claimed!'}
            {status === 'error' && 'Unable to claim credits'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && !claiming && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've been offered <strong>200 FREE credits</strong> as part of our welcome back campaign. 
                  Click below to add them to your account.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleClaimCredits} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  'Confirm & Claim Credits'
                )}
              </Button>
            </>
          )}

          {status === 'success' && (
            <>
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>{creditsAdded} credits</strong> have been added to your account!<br />
                  Your new balance: <strong>{newBalance} credits</strong>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-center text-muted-foreground">
                Redirecting to dashboard in 3 seconds...
              </p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
                variant="outline"
              >
                Go to Dashboard Now
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
                variant="outline"
              >
                Return to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
