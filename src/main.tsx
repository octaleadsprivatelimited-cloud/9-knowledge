import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
const useStrictMode = import.meta.env.VITE_STRICT_MODE === "true";

// Wrap app with error boundary for production
const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

try {
  root.render(useStrictMode ? <React.StrictMode>{app}</React.StrictMode> : app);
} catch (error) {
  console.error("Failed to render app:", error);
  // Show error message if app fails to load
  root.render(
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
      <div>
        <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>Failed to load</h1>
        <p>Please refresh the page or try again later.</p>
      </div>
    </div>
  );
}
