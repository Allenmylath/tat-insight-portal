import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { trackSignupConversion } from "@/utils/trackConversion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useIsMobile } from "@/hooks/use-mobile";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import SSBInterview from "./pages/SSBInterview";
import TatTestInfo from "./pages/TatTestInfo";
import SSBProcedure from "./pages/SSBProcedure";
import StandaloneTestPage from "./pages/StandaloneTestPage";
import Dashboard from "./pages/Dashboard";
import AttemptedTests from "./pages/dashboard/AttemptedTests";
import PendingTests from "./pages/dashboard/PendingTests";
import AbandonedTests from "./pages/dashboard/AbandonedTests";
import Results from "./pages/dashboard/Results";
import Pricing from "./pages/dashboard/Pricing";
import Settings from "./pages/dashboard/Settings";
import Transactions from "./pages/dashboard/Transactions";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import { PaymentReconciliation } from "@/components/PaymentReconciliation";

import { TestProvider } from "@/contexts/TestContext";

const queryClient = new QueryClient();

// Persistent identity management for Statsig
const STATSIG_USER_ID_KEY = 'statsig_user_id';
const STATSIG_USER_EMAIL_KEY = 'statsig_user_email';

// Get or create anonymous ID (only for first-time visitors)
const getOrCreateAnonymousId = (): string => {
  const ANON_ID_KEY = 'statsig_anon_id';
  let anonId = localStorage.getItem(ANON_ID_KEY);
  
  if (!anonId) {
    anonId = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(ANON_ID_KEY, anonId);
    console.log('🆔 Generated new anonymous ID:', anonId);
  }
  
  return anonId;
};

// Get the persistent user ID (once identified, never reverts to anonymous)
const getPersistentUserId = (): string => {
  const persistedId = localStorage.getItem(STATSIG_USER_ID_KEY);
  
  if (persistedId) {
    console.log('✅ Using persisted user ID:', persistedId);
    return persistedId;
  }
  
  // New visitor - return anonymous ID
  return getOrCreateAnonymousId();
};

// Save identified user (called after successful auth + Supabase fetch)
const persistIdentifiedUser = (supabaseUserId: string, email?: string) => {
  localStorage.setItem(STATSIG_USER_ID_KEY, supabaseUserId);
  if (email) {
    localStorage.setItem(STATSIG_USER_EMAIL_KEY, email);
  }
  console.log('💾 Persisted identified user:', { supabaseUserId, email });
};

// Get persisted email (remains even after logout)
const getPersistedEmail = (): string | undefined => {
  return localStorage.getItem(STATSIG_USER_EMAIL_KEY) || undefined;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full relative">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="ml-4" />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [statsigTimeout, setStatsigTimeout] = useState(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [isIdentityReady, setIsIdentityReady] = useState(false);
  
  // Fetch Supabase UUID for logged-in users
  useEffect(() => {
    const initializeIdentity = async () => {
      if (!isClerkLoaded) {
        return; // Wait for Clerk to load
      }

      if (user?.id) {
        // User is authenticated - fetch Supabase ID
        console.log('🔍 Fetching Supabase user ID for Clerk ID:', user.id);
        
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single();
        
        if (data?.id) {
          setSupabaseUserId(data.id);
          
          // Persist the identified user (upgrade from anonymous if needed)
          const currentEmail = user.primaryEmailAddress?.emailAddress;
          persistIdentifiedUser(data.id, currentEmail);
          
          console.log('✅ Supabase User ID fetched and persisted:', data.id);
        } else if (error) {
          console.error('❌ Failed to fetch Supabase user:', error);
        }
      } else {
        // User not authenticated - use persisted ID or anonymous
        console.log('👤 No authenticated user, using persisted/anonymous ID');
        setSupabaseUserId(null);
      }
      
      // Identity is ready for Statsig initialization
      setIsIdentityReady(true);
    };
    
    initializeIdentity();
  }, [user?.id, isClerkLoaded]);
  
  // Determine user ID for Statsig (once identified, always use real ID)
  const statsigUserId = getPersistentUserId();
  
  // Get email (persisted even after logout)
  const statsigEmail = user?.primaryEmailAddress?.emailAddress || getPersistedEmail();
  
  // Check if user is currently signed in (for metadata)
  const isCurrentlySignedIn = !!user;
  
  const { client } = useClientAsyncInit(
    import.meta.env.VITE_STATSIG_CLIENT_KEY,
    { 
      userID: statsigUserId,
      email: statsigEmail,
      customIDs: {
        clerkID: user?.id,
      },
      custom: {
        wasIdentified: !!localStorage.getItem(STATSIG_USER_ID_KEY), // Track if user was ever identified
        currentlySignedIn: isCurrentlySignedIn,
        hasEmail: !!statsigEmail,
      }
    },
    { 
      plugins: [
        new StatsigAutoCapturePlugin(), 
        new StatsigSessionReplayPlugin()
      ] 
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatsigTimeout(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Track Google OAuth signup conversion
  useEffect(() => {
    const signupComplete = sessionStorage.getItem('clerk_signup_complete');
    if (signupComplete === 'true') {
      trackSignupConversion();
      sessionStorage.removeItem('clerk_signup_complete');
    }
  }, []);

  // Sync user metadata to Statsig when auth state changes
  useEffect(() => {
    if (isIdentityReady && client) {
      const userId = getPersistentUserId();
      const email = user?.primaryEmailAddress?.emailAddress || getPersistedEmail();
      const isSignedIn = !!user;
      
      console.log('🔄 Updating Statsig metadata:', {
        userID: userId,
        clerkID: user?.id,
        email: email,
        currentlySignedIn: isSignedIn,
        wasIdentified: !!localStorage.getItem(STATSIG_USER_ID_KEY)
      });
      
      client.updateUserAsync({
        userID: userId,
        email: email,
        customIDs: {
          clerkID: user?.id,
        },
        custom: {
          wasIdentified: !!localStorage.getItem(STATSIG_USER_ID_KEY),
          currentlySignedIn: isSignedIn,
          hasEmail: !!email,
        }
      }).then(() => {
        console.log('✅ Statsig metadata updated successfully');
      }).catch((error) => {
        console.error('❌ Statsig update failed:', error);
      });
    }
  }, [user?.id, isIdentityReady, client]);

  // Wait for Clerk to load AND identity to be ready before initializing Statsig
  if (!isClerkLoaded || !isIdentityReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading Dashboard...</p>
          <p className="text-xs text-muted-foreground mt-2">
            {!isClerkLoaded 
              ? 'Initializing authentication...' 
              : user 
                ? 'Fetching user profile...' 
                : 'Preparing session...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <StatsigProvider 
        client={client} 
        loadingComponent={
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              {!statsigTimeout ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-foreground">Loading Dashboard...</p>
                  <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
                </>
              ) : (
                <>
                  <p className="text-foreground mb-4">Taking longer than expected...</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </>
              )}
            </div>
          </div>
        }
      >
      <QueryClientProvider client={queryClient}>
        <TestProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/ssb-interview" element={<SSBInterview />} />
                <Route path="/about-tat" element={<TatTestInfo />} />
                <Route path="/5-day-ssb-interview-procedure" element={<SSBProcedure />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/about-us" element={<AboutUs />} />
              
              {/* Blog routes */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* Auth routes */}
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                
                {/* Standalone test route - no dashboard layout */}
                <Route path="/test/:testId" element={
                  <ProtectedRoute>
                    <StandaloneTestPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/attempted" element={
                  <DashboardLayout>
                    <AttemptedTests />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/pending" element={
                  <DashboardLayout>
                    <PendingTests />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/abandoned" element={
                  <DashboardLayout>
                    <AbandonedTests />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/results" element={
                  <DashboardLayout>
                    <Results />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/pricing" element={
                  <DashboardLayout>
                    <Pricing />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/transactions" element={
                  <DashboardLayout>
                    <Transactions />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/reconciliation" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PaymentReconciliation />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TestProvider>
      </QueryClientProvider>
    </StatsigProvider>
    </ErrorBoundary>
  );
};

export default App;
