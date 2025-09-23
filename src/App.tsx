import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Index from "./pages/Index";
import TatTestInfo from "./pages/TatTestInfo";
import StandaloneTestPage from "./pages/StandaloneTestPage";
import Dashboard from "./pages/Dashboard";
import AttemptedTests from "./pages/dashboard/AttemptedTests";
import PendingTests from "./pages/dashboard/PendingTests";
import Results from "./pages/dashboard/Results";
import Pricing from "./pages/dashboard/Pricing";
import Settings from "./pages/dashboard/Settings";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import NotFound from "./pages/NotFound";

import { TestProvider } from "@/contexts/TestContext";

const queryClient = new QueryClient();

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-12 flex items-center border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <SidebarTrigger className="ml-4" />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TestProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about-tat" element={<TatTestInfo />} />
            
            {/* Auth routes */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            
            {/* Standalone test route - no dashboard layout */}
            <Route path="/test/:testId" element={
              <SignedIn>
                <StandaloneTestPage />
              </SignedIn>
            } />
            
            <Route path="/dashboard" element={
              <SignedIn>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </SignedIn>
            } />
            <Route path="/dashboard/attempted" element={
              <SignedIn>
                <DashboardLayout>
                  <AttemptedTests />
                </DashboardLayout>
              </SignedIn>
            } />
            <Route path="/dashboard/pending" element={
              <SignedIn>
                <DashboardLayout>
                  <PendingTests />
                </DashboardLayout>
              </SignedIn>
            } />
            <Route path="/dashboard/results" element={
              <SignedIn>
                <DashboardLayout>
                  <Results />
                </DashboardLayout>
              </SignedIn>
            } />
            <Route path="/dashboard/pricing" element={
              <SignedIn>
                <DashboardLayout>
                  <Pricing />
                </DashboardLayout>
              </SignedIn>
            } />
            <Route path="/dashboard/settings" element={
              <SignedIn>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </SignedIn>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TestProvider>
  </QueryClientProvider>
);

export default App;
