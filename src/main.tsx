import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { TestContextProvider } from "@/contexts/TestContext";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = "pk_test_YWRhcHRlZC15YWstOTkuY2xlcmsuYWNjb3VudHMuZGV2JA";

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
    <TestContextProvider>
      <App />
    </TestContextProvider>
  </ClerkProvider>
);
