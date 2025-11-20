import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { trackSignupConversion } from "@/utils/trackConversion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsigProvider, useClientAsyncInit } from "@statsig/react-bindings";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useIsMobile } from "@/hooks/use-mobile";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect } from "react";
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
import TatMethodology from "./pages/TatMethodology";
import ScorsGMethodology from "./pages/ScorsGMethodology";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import LLMTatArticle from "./pages/LLMTatArticle";
import UpdateBlog from "./pages/admin/UpdateBlog";
import CampaignManager from "./pages/admin/CampaignManager";
import CampaignAnalytics from "./components/admin/CampaignAnalytics";
import NotFound from "./pages/NotFound";
import ClaimCredits from "./pages/ClaimCredits";
import { PaymentReconciliation } from "@/components/PaymentReconciliation";
import { TestProvider } from "@/contexts/TestContext";

const queryClient = new QueryClient();

// Persistent identity management for Statsig
const STATSIG_USER_ID_KEY = "statsig_user_id";
const STATSIG_USER_EMAIL_KEY = "statsig_user_email";

// Get or create anonymous ID (only for first-time visitors)
const getOrCreateAnonymousId = (): string => {
  const ANON_ID_KEY = "statsig_anon_id";
  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    anonId = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(ANON_ID_KEY, anonId);
  }
  return anonId;
};

// Get the persistent user ID (once identified, never reverts to anonymous)
const getPersistentUserId = (): string => {
  const persistedId = localStorage.getItem(STATSIG_USER_ID_KEY);
  if (persistedId) {
    return persistedId;
  }
  return getOrCreateAnonymousId();
};

// Save identified user (called after successful auth + Supabase fetch)
const persistIdentifiedUser = (supabaseUserId: string, email?: string) => {
  localStorage.setItem(STATSIG_USER_ID_KEY, supabaseUserId);
  if (email) {
    localStorage.setItem(STATSIG_USER_EMAIL_KEY, email);
  }
  console.log("💾 Persisted identified user:", { supabaseUserId, email });
};

// Get persisted email (remains even after logout)
const getPersistedEmail = (): string | undefined => {
  return localStorage.getItem(STATSIG_USER_EMAIL_KEY) || undefined;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full p-4 md:p-6">
        <SidebarTrigger className="mb-4" />
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

const App = () => {
  const { user, isLoaded: isClerkLoaded } = useUser();

  // Initialize Statsig immediately - completely non-blocking
  const statsigUserId = getPersistentUserId();
  const statsigEmail = getPersistedEmail();

  const { client } = useClientAsyncInit(
    import.meta.env.VITE_STATSIG_CLIENT_KEY,
    {
      userID: statsigUserId,
      email: statsigEmail,
      custom: {
        wasIdentified: !!localStorage.getItem(STATSIG_USER_ID_KEY),
        hasEmail: !!statsigEmail,
      },
    },
    {
      plugins: [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()],
    },
  );

  // Completely async identity resolution - zero impact on UI
  useEffect(() => {
    // Async function that runs independently
    const syncIdentityInBackground = async () => {
      // Wait for Clerk to be ready (but app already rendered)
      if (!isClerkLoaded) return;

      try {
        if (user?.id) {
          // User is authenticated - fetch real ID from Supabase
          const { data, error } = await supabase.from("users").select("id").eq("clerk_id", user.id).single();

          if (data?.id && client) {
            const currentEmail = user.primaryEmailAddress?.emailAddress;

            // Only update if the ID actually changed (avoid redundant updates)
            const currentPersistedId = localStorage.getItem(STATSIG_USER_ID_KEY);
            if (currentPersistedId !== data.id) {
              // Persist the identified user
              persistIdentifiedUser(data.id, currentEmail);

              // Update Statsig asynchronously
              client
                .updateUserAsync({
                  userID: data.id,
                  email: currentEmail,
                  customIDs: {
                    clerkID: user.id,
                  },
                  custom: {
                    wasIdentified: true,
                    currentlySignedIn: true,
                    hasEmail: !!currentEmail,
                  },
                })
                .catch((err) => {
                  // Silent fail - don't impact UX
                  console.warn("Statsig update failed (non-critical):", err);
                });
            }
          } else if (error) {
            console.warn("Supabase user fetch failed (non-critical):", error);
          }
        } else if (client) {
          // User logged out - update metadata
          client
            .updateUserAsync({
              userID: getPersistentUserId(),
              email: getPersistedEmail(),
              customIDs: {},
              custom: {
                wasIdentified: !!localStorage.getItem(STATSIG_USER_ID_KEY),
                currentlySignedIn: false,
                hasEmail: !!getPersistedEmail(),
              },
            })
            .catch((err) => {
              console.warn("Statsig update failed (non-critical):", err);
            });
        }
      } catch (error) {
        // Catch-all: analytics failure should never break the app
        console.warn("Identity sync failed (non-critical):", error);
      }
    };

    // Run async without awaiting
    syncIdentityInBackground();
  }, [user?.id, isClerkLoaded, client]);

  // Track Google OAuth signup conversion
  useEffect(() => {
    const signupComplete = sessionStorage.getItem("clerk_signup_complete");
    const hasUser = !!user;
    const hasEmail = !!user?.primaryEmailAddress?.emailAddress;
    
    console.log("🔍 Google OAuth tracking check:", {
      signupCompleteFlag: signupComplete,
      hasUser: hasUser,
      hasEmail: hasEmail,
      isClerkLoaded: isClerkLoaded,
      userEmail: user?.primaryEmailAddress?.emailAddress
    });
    
    if (signupComplete === "true" && user && user.primaryEmailAddress?.emailAddress) {
      // Get user data from Clerk for enhanced conversions
      const userData = {
        email: user.primaryEmailAddress.emailAddress,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };
      
      console.log("🎯 Calling trackSignupConversion with userData:", userData);
      trackSignupConversion(userData);
      sessionStorage.removeItem("clerk_signup_complete");
    } else if (signupComplete === "true" && !user) {
      console.log("⏳ Signup flag set but user not loaded yet - waiting...");
    }
  }, [user, isClerkLoaded]);

  // Render immediately - no waiting for anything
  return (
    <ErrorBoundary>
      <StatsigProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <TestProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/ssb-interview" element={<SSBInterview />} />
                  <Route path="/tat-test-info" element={<TatTestInfo />} />
                  <Route path="/tat-methodology" element={<TatMethodology />} />
                  <Route path="/thematic-apperception-test" element={<ScorsGMethodology />} />
                  <Route path="/ssb-procedure" element={<SSBProcedure />} />

                  {/* Dashboard routes with layout */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/attempted"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <AttemptedTests />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pending"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <PendingTests />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/abandoned"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <AbandonedTests />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/results"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Results />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/pricing"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Pricing />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Settings />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/transactions"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Transactions />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/reconciliation"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <PaymentReconciliation />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Blog routes */}
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/llm-tat-scoring" element={<LLMTatArticle />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route
                    path="/admin/update-blog"
                    element={
                      <ProtectedRoute>
                        <UpdateBlog />
                      </ProtectedRoute>
                    }
                  />

                  {/* Auth routes */}
                  <Route path="/auth/signin" element={<SignIn />} />
                  <Route path="/auth/signup" element={<SignUp />} />

                  {/* Standalone test route - no dashboard layout */}
                  <Route
                    path="/test/:testId"
                    element={
                      <ProtectedRoute>
                        <StandaloneTestPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/payment-reconciliation" element={<PaymentReconciliation />} />
                  
                  {/* Promotional credits claim route */}
                  <Route 
                    path="/claim-credits" 
                    element={
                      <ProtectedRoute>
                        <ClaimCredits />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Admin routes */}
                  <Route
                    path="/admin/campaigns"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <CampaignManager />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/campaigns/:id"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <CampaignAnalytics />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />

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
