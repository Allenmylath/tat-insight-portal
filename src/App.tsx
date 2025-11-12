import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { useUser } from '@clerk/clerk-react';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useIsMobile } from "@/hooks/use-mobile";
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
import NotFound from "./pages/NotFound";
import { PaymentReconciliation } from "@/components/PaymentReconciliation";

import { TestProvider } from "@/contexts/TestContext";

const queryClient = new QueryClient();

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full relative">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
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
  const statsigUserId = user?.id || 'anonymous-user';
  
  const { client } = useClientAsyncInit(
    import.meta.env.VITE_STATSIG_CLIENT_KEY,
    { userID: statsigUserId },
    { 
      plugins: [
        new StatsigAutoCapturePlugin(), 
        new StatsigSessionReplayPlugin()
      ] 
    }
  );

  return (
    <StatsigProvider 
      client={client} 
      loadingComponent={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
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
  );
};

export default App;
