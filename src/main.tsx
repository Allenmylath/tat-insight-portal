import { createRoot } from "react-dom/client";
import { TestContextProvider } from "@/contexts/TestContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <TestContextProvider>
    <App />
  </TestContextProvider>
);
