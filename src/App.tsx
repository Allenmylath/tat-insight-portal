import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TestContextProvider } from "@/contexts/TestContext";
import { AppSidebar } from "@/components/AppSidebar";

// Import your pages
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import AttemptedTests from "@/pages/dashboard/AttemptedTests";
import PendingTests from "@/pages/dashboard/PendingTests";
import Results from "@/pages/dashboard/Results";
import Pricing from "@/pages/dashboard/Pricing";
import Settings from "@/pages/dashboard/Settings";
import TatTestInfo from "@/pages/TatTestInfo";
import StandaloneTestPage from "@/pages/StandaloneTestPage"; // IMPORTANT: Add this import
import NotFound from "@/pages/NotFound";
import "./App.css";

const PUBLISHABLE_KEY = "pk_test_YWRhcHRlZC15YWstOTkuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TestContextProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about-tat" element={<TatTestInfo />} />
              
              {/* CRITICAL: Add the standalone test route */}
              <Route 
                path="/test/:testId" 
                element={
                  <SignedIn>
                    <StandaloneTestPage />
                  </SignedIn>
                } 
              />
              
              {/* Protected dashboard routes */}
              <Route 
                path="/dashboard/*" 
                element={
                  <SignedIn>
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full">
                        <AppSidebar />
                        <main className="flex-1 overflow-auto">
                          <div className="container mx-auto p-6">
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/attempted" element={<AttemptedTests />} />
                              <Route path="/pending" element={<PendingTests />} />
                              <Route path="/results" element={<Results />} />
                              <Route path="/pricing" element={<Pricing />} />
                              <Route path="/settings" element={<Settings />} />
                            </Routes>
                          </div>
                        </main>
                      </div>
                    </SidebarProvider>
                  </SignedIn>
                } 
              />
              
              {/* Redirect signed out users trying to access dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <SignedOut>
                    <Navigate to="/" replace />
                  </SignedOut>
                } 
              />
              
              {/* 404 catch-all - MUST be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </TestContextProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
