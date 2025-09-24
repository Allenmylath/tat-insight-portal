import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ReconcileResult {
  merchantOrderId: string;
  phonePeStatus: {
    state: string;
    orderId: string;
    amount: number;
  } | null;
  reconcileResult: {
    success: boolean;
    message?: string;
    error?: string;
    creditsAdded?: number;
  };
}

export const PaymentReconciliation = () => {
  const [singleOrderId, setSingleOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [results, setResults] = useState<ReconcileResult[]>([]);

  const checkSingleOrder = async () => {
    if (!singleOrderId.trim()) {
      toast.error('Please enter a merchant order ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-phonepe-order-status', {
        body: {
          action: 'check_single',
          merchantOrderId: singleOrderId.trim()
        }
      });

      if (error) {
        throw error;
      }

      setResults([data]);
      
      if (data.reconcileResult.success) {
        toast.success(`Order reconciled successfully! ${data.reconcileResult.creditsAdded > 0 ? `${data.reconcileResult.creditsAdded} credits added.` : ''}`);
      } else {
        toast.error(`Failed to reconcile: ${data.reconcileResult.error}`);
      }
    } catch (error) {
      console.error('Error checking order:', error);
      toast.error('Failed to check order status');
    } finally {
      setLoading(false);
    }
  };

  const reconcileAllPending = async () => {
    setBulkLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-phonepe-order-status', {
        body: {
          action: 'reconcile_all'
        }
      });

      if (error) {
        throw error;
      }

      setResults(data.results || []);
      
      const successful = data.results?.filter((r: ReconcileResult) => r.reconcileResult.success).length || 0;
      const creditsAdded = data.results?.reduce((sum: number, r: ReconcileResult) => 
        sum + (r.reconcileResult.creditsAdded || 0), 0) || 0;
      
      toast.success(`Processed ${data.totalProcessed} orders. ${successful} successful. ${creditsAdded} total credits added.`);
    } catch (error) {
      console.error('Error reconciling orders:', error);
      toast.error('Failed to reconcile pending orders');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Reconciliation</CardTitle>
          <CardDescription>
            Check PhonePe order status and reconcile payments that may have missed webhook callbacks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchantOrderId">Check Single Order</Label>
            <div className="flex gap-2">
              <Input
                id="merchantOrderId"
                placeholder="Enter Merchant Order ID (e.g., ORD-1758683426912-xeev881d2)"
                value={singleOrderId}
                onChange={(e) => setSingleOrderId(e.target.value)}
              />
              <Button onClick={checkSingleOrder} disabled={loading}>
                {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Check Status
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={reconcileAllPending} 
              disabled={bulkLoading}
              variant="outline"
              className="w-full"
            >
              {bulkLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Reconcile All Pending Orders (1+ minute old)
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {result.merchantOrderId}
                    </code>
                    <Badge variant={result.reconcileResult.success ? "default" : "destructive"}>
                      {result.reconcileResult.success ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {result.reconcileResult.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>PhonePe Status:</strong> {result.phonePeStatus?.state || 'Unknown'}
                    </div>
                    <div>
                      <strong>Amount:</strong> {result.phonePeStatus?.amount ? `₹${(result.phonePeStatus.amount / 100).toFixed(2)}` : 'N/A'}
                    </div>
                    <div>
                      <strong>PhonePe Order ID:</strong> {result.phonePeStatus?.orderId || 'N/A'}
                    </div>
                    {result.reconcileResult.creditsAdded && (
                      <div>
                        <strong>Credits Added:</strong> {result.reconcileResult.creditsAdded}
                      </div>
                    )}
                  </div>

                  {result.reconcileResult.message && (
                    <Alert className="mt-2">
                      <AlertDescription>{result.reconcileResult.message}</AlertDescription>
                    </Alert>
                  )}

                  {result.reconcileResult.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{result.reconcileResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};