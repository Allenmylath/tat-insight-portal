import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export interface UserData {
  id: string;
  clerk_id: string;
  email: string;
  membership_type: 'free' | 'pro';
  membership_expires_at: string | null;
  credit_balance: number;
  total_credits_purchased: number;
  total_credits_spent: number;
  created_at: string;
  updated_at: string;
}

export const useUserData = () => {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUserData = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if user exists in our database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (existingUser) {
          setUserData(existingUser);
        } else {
          // Create new user record
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              clerk_id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              membership_type: 'free'
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          setUserData(newUser);
        }
      } catch (err) {
        console.error('Error syncing user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to sync user data');
      } finally {
        setLoading(false);
      }
    };

    syncUserData();
  }, [user, isLoaded]);

  const updateMembership = async (membershipType: 'free' | 'pro', expiresAt?: string) => {
    if (!userData) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          membership_type: membershipType,
          membership_expires_at: expiresAt || null
        })
        .eq('id', userData.id)
        .select()
        .single();

      if (error) throw error;

      setUserData(data);
    } catch (err) {
      console.error('Error updating membership:', err);
      throw err;
    }
  };

  const deductCredits = async (testSessionId: string, creditsNeeded: number = 100) => {
    if (!userData) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_credits_for_test', {
        p_user_id: userData.id,
        p_test_session_id: testSessionId,
        p_credits_needed: creditsNeeded
      });

      if (error) throw error;

      // Refresh user data to get updated balance
      if (data) {
        const { data: updatedUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        if (updatedUser) {
          setUserData(updatedUser);
        }
      }

      return data;
    } catch (err) {
      console.error('Error deducting credits:', err);
      throw err;
    }
  };

  const hasEnoughCredits = (creditsNeeded: number = 100) => {
    return userData ? userData.credit_balance >= creditsNeeded : false;
  };

  return {
    userData,
    loading,
    error,
    updateMembership,
    deductCredits,
    hasEnoughCredits,
    isPro: userData?.membership_type === 'pro'
  };
};