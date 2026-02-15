import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Lazy-load all pages including Index so initial bundle is smaller
const Index = lazy(() => import("./pages/Index"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const TagPage = lazy(() => import("./pages/TagPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ArticlesPage = lazy(() => import("./pages/admin/ArticlesPage"));
const ArticleEditorPage = lazy(() => import("./pages/admin/ArticleEditorPage"));
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const TagsPage = lazy(() => import("./pages/admin/TagsPage"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdsPage = lazy(() => import("./pages/admin/AdsPage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const MediaPage = lazy(() => import("./pages/admin/MediaPage"));
const SeedArticlesPage = lazy(() => import("./pages/admin/SeedArticlesPage"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center" aria-label="Loading">
    <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 min - fewer refetches, faster repeat visits
      gcTime: 30 * 60 * 1000, // 30 min cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/tag/:slug" element={<TagPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/sitemap.xml" element={<SitemapPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/articles" element={<ProtectedRoute><ArticlesPage /></ProtectedRoute>} />
            <Route path="/admin/articles/:id" element={<ProtectedRoute><ArticleEditorPage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/admin/tags" element={<ProtectedRoute><TagsPage /></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute><MediaPage /></ProtectedRoute>} />
            <Route path="/admin/ads" element={<ProtectedRoute requireSuperAdmin><AdsPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireSuperAdmin><UsersPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireSuperAdmin><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin/seed-articles" element={<ProtectedRoute requireSuperAdmin><SeedArticlesPage /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
