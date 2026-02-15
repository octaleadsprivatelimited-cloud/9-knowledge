import { ReactNode, useState, useEffect, lazy, Suspense } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import AdSlot from "@/components/ads/AdSlot";

const BackToTop = lazy(() => import("./BackToTop").then((m) => ({ default: m.BackToTop })));

interface LayoutProps {
  children: ReactNode;
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
}

/** Defer ad slots until after first paint so main content and LCP aren't blocked. */
export function Layout({ children, showHeaderAd = true, showFooterAd = true }: LayoutProps) {
  const [showAds, setShowAds] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowAds(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showAds && showHeaderAd && (
        <div className="container py-4">
          <AdSlot position="header" />
        </div>
      )}
      <main className="flex-1">{children}</main>
      {showAds && showFooterAd && (
        <div className="container py-4">
          <AdSlot position="footer" />
        </div>
      )}
      <Footer />
      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>
    </div>
  );
}
