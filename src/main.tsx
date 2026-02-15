import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Minimal shell so first paint is instant (no waiting for Firebase, Router, or App)
const Shell = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background" aria-label="Loading">
    <div className="text-2xl font-bold text-primary">9</div>
    <div className="h-6 w-6 mt-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const root = createRoot(document.getElementById("root")!);
root.render(<Shell />);

// Defer full app load so the shell appears immediately; then load App + HelmetProvider
const useStrictMode = import.meta.env.VITE_STRICT_MODE === "true";
(async () => {
  const [{ default: App }, { HelmetProvider }] = await Promise.all([
    import("./App.tsx"),
    import("react-helmet-async"),
  ]);
  const app = (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
  root.render(useStrictMode ? <React.StrictMode>{app}</React.StrictMode> : app);
})();
