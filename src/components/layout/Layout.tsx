import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackToTop } from "./BackToTop";
import AdSlot from "@/components/ads/AdSlot";

interface LayoutProps {
  children: ReactNode;
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
}

export function Layout({ children, showHeaderAd = true, showFooterAd = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showHeaderAd && (
        <div className="container py-4">
          <AdSlot position="header" />
        </div>
      )}
      <main className="flex-1">{children}</main>
      {showFooterAd && (
        <div className="container py-4">
          <AdSlot position="footer" />
        </div>
      )}
      <Footer />
      <BackToTop />
    </div>
  );
}
