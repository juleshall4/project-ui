import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import App from "./App.tsx";
import "./index.css";
import "./showcase/fonts.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AnchoredToastProvider>
        <App />
      </AnchoredToastProvider>
    </ToastProvider>
  </StrictMode>,
);
