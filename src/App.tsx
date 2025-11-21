import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
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
import { useEffect, useState } from "react";
import Index from "./pages/Index";

// Lazy load non-critical routes
const SSBInterview = lazy(() => import("./pages/SSBInterview"));
const TatTestInfo = lazy(() => import("./pages/TatTestInfo"));
const SSBProcedure = lazy(() => import("./pages/SSBProcedure"));
const StandaloneTestPage = lazy(() => import("./pages/StandaloneTestPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AttemptedTests = lazy(() => import("./pages/dashboard/AttemptedTests"));
const PendingTests = lazy(() => import("./pages/dashboard/PendingTests"));
const AbandonedTests = lazy(() => import("./pages/dashboard/AbandonedTests"));
const Results = lazy(() => import("./pages/dashboard/Results"));
const Pricing = lazy(() => import("./pages/dashboard/Pricing"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Transactions = lazy(() => import("./pages/dashboard/Transactions"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const TatMethodology = lazy(() => import("./pages/TatMethodology"));
const ScorsGMethodology = lazy(() => import("./pages/ScorsGMethodology"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const LLMTatArticle = lazy(() => import("./pages/LLMTatArticle"));
const UpdateBlog = lazy(() => import("./pages/admin/UpdateBlog"));
const CampaignManager = lazy(() => import("./pages/admin/CampaignManager"));
const CampaignAnalytics = lazy(() => import("./components/admin/CampaignAnalytics"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ClaimCredits = lazy(() => import("./pages/ClaimCredits"));
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
  const [statsigClient, setStatsigClient] = useState<any>(null);

  // Get persistent user data
  const statsigUserId = getPersistentUserId();
  const statsigEmail = getPersistedEmail();

  // Defer Statsig initialization to not block initial render
  useEffect(() => {
    const initStatsig = async () => {
      const { useClientAsyncInit: initClient } = await import("@statsig/react-bindings");
      const { StatsigAutoCapturePlugin: AutoCapture } = await import("@statsig/web-analytics");
      const { StatsigSessionReplayPlugin: SessionReplay } = await import("@statsig/session-replay");
      
      const { client } = initClient(
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
          plugins: [new AutoCapture(), new SessionReplay()],
        },
      );
      
      setStatsigClient(client);
    };

    // Defer initialization
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => initStatsig());
    } else {
      setTimeout(initStatsig, 1);
    }
  }, []);

  // Completely async identity resolution - zero impact on UI
  useEffect(() => {
    if (!statsigClient) return;

    // Async function that runs independently
    const syncIdentityInBackground = async () => {
      // Wait for Clerk to be ready (but app already rendered)
      if (!isClerkLoaded) return;

      try {
        if (user?.id) {
          // User is authenticated - fetch real ID from Supabase
          const { data, error } = await supabase.from("users").select("id").eq("clerk_id", user.id).single();

          if (data?.id) {
            const currentEmail = user.primaryEmailAddress?.emailAddress;

            // Only update if the ID actually changed (avoid redundant updates)
            const currentPersistedId = localStorage.getItem(STATSIG_USER_ID_KEY);
            if (currentPersistedId !== data.id) {
              // Persist the identified user
              persistIdentifiedUser(data.id, currentEmail);

              // Update Statsig asynchronously
              statsigClient
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
                .catch((err: any) => {
                  console.warn("Statsig update failed (non-critical):", err);
                });
            }
          } else if (error) {
            console.warn("Supabase user fetch failed (non-critical):", error);
          }
        } else {
          // User logged out - update metadata
          statsigClient
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
            .catch((err: any) => {
              console.warn("Statsig update failed (non-critical):", err);
            });
        }
      } catch (error) {
        console.warn("Identity sync failed (non-critical):", error);
      }
    };

    // Run async without awaiting
    syncIdentityInBackground();
  }, [user?.id, isClerkLoaded, statsigClient]);

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
      <StatsigProvider client={statsigClient}>
        <QueryClientProvider client={queryClient}>
          <TestProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>}>
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
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </TestProvider>
        </QueryClientProvider>
      </StatsigProvider>
    </ErrorBoundary>
  );
};

export default App;
