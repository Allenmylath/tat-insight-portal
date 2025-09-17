import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TestProvider } from "@/contexts/TestContext";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = "pk_test_YWRhcHRlZC15YWstOTkuY2xlcmsuYWNjb3VudHMuZGV2JA";
const queryClient = new QueryClient();

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      elements: {
        rootBox: "mx-auto",
        card: "shadow-lg"
      }
    }}
    afterSignInUrl="/"
    afterSignUpUrl="/"
  >
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TestProvider>
          <App />
          <Toaster />
        </TestProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ClerkProvider>
);
