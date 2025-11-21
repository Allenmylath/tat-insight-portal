import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";
import { onLCP, onINP, onCLS } from 'web-vitals';
import { reportWebVitals } from './utils/performanceMonitoring';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
    signInForceRedirectUrl="/dashboard/pending"
    signUpForceRedirectUrl="/dashboard/pending"
    allowedRedirectOrigins={[
      "https://tattests.me",
      "https://*.tattests.me",
      "https://*.lovable.app"
    ]}
  >
    <App />
  </ClerkProvider>
);

// Monitor Web Vitals
onLCP(reportWebVitals);
onINP(reportWebVitals);
onCLS(reportWebVitals);
