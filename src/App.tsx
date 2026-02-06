import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import SitemapPage from "./pages/SitemapPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticlesPage from "./pages/admin/ArticlesPage";
import ArticleEditorPage from "./pages/admin/ArticleEditorPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import TagsPage from "./pages/admin/TagsPage";
import UsersPage from "./pages/admin/UsersPage";
import AdsPage from "./pages/admin/AdsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import MediaPage from "./pages/admin/MediaPage";
import SeedArticlesPage from "./pages/admin/SeedArticlesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 1, // Only retry once on failure
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
