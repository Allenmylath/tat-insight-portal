import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export interface UserData {
  id: string;
  clerk_id: string;
  email: string;
  membership_type: 'free' | 'pro';
  membership_expires_at: string | null;
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

  return {
    userData,
    loading,
    error,
    updateMembership,
    isPro: userData?.membership_type === 'pro'
  };
};