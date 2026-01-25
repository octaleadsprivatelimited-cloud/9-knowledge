import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { LatestArticles } from "@/components/home/LatestArticles";
import { CategorySection } from "@/components/home/CategorySection";
import { BrowseCategories } from "@/components/home/BrowseCategories";
import { WebsiteSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { Helmet } from "react-helmet-async";
import { 
  useFeaturedArticles, 
  useTrendingArticles, 
  useLatestArticles,
  useArticlesByCategory 
} from "@/hooks/usePublicArticles";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: featuredArticles, isLoading: featuredLoading, error: featuredError } = useFeaturedArticles();
  const { data: trendingArticles, isLoading: trendingLoading, error: trendingError } = useTrendingArticles();
  const { data: latestArticles, isLoading: latestLoading, error: latestError } = useLatestArticles(9);
  const { data: categories, error: categoriesError } = useCategories();
  
  const { data: techArticles, error: techError } = useArticlesByCategory('technology', 6);
  const { data: healthArticles, error: healthError } = useArticlesByCategory('health', 6);

  const techCategory = categories?.find((c) => c.slug === 'technology');
  const healthCategory = categories?.find((c) => c.slug === 'health');

  const isLoading = featuredLoading || trendingLoading || latestLoading;
  const hasError = featuredError || trendingError || latestError || categoriesError;

  // Log errors in development
  if (import.meta.env.DEV) {
    if (featuredError) console.error('Featured articles error:', featuredError);
    if (trendingError) console.error('Trending articles error:', trendingError);
    if (latestError) console.error('Latest articles error:', latestError);
    if (categoriesError) console.error('Categories error:', categoriesError);
    if (techError) console.error('Tech articles error:', techError);
    if (healthError) console.error('Health articles error:', healthError);
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>9knowledge - Your Trusted Knowledge Portal</title>
        <meta name="description" content="Discover insightful articles on technology, health, business, and more. Stay informed with the latest news and expert analysis." />
        <meta property="og:title" content="9knowledge - Your Trusted Knowledge Portal" />
        <meta property="og:description" content="Discover insightful articles on technology, health, business, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://9knowledge.com" />
        <link rel="canonical" href="https://9knowledge.com" />
      </Helmet>
      <WebsiteSchema />
      <OrganizationSchema />
      
      {/* Hero Section with Featured Articles */}
      {featuredArticles && featuredArticles.length > 0 && (
        <HeroSection featuredArticles={featuredArticles} trendingArticles={trendingArticles || []} />
      )}

      {/* Latest Articles */}
      {latestArticles && latestArticles.length > 0 && (
        <LatestArticles articles={latestArticles} />
      )}

      {/* Browse Categories */}
      {categories && categories.length > 0 && (
        <BrowseCategories categories={categories} />
      )}

      {/* Trending News */}
      {trendingArticles && trendingArticles.length > 0 && (
        <TrendingSection articles={trendingArticles} />
      )}


      {/* Category Sections */}
      {techCategory && techArticles && techArticles.length > 0 && (
        <CategorySection
          category={techCategory}
          articles={techArticles}
        />
      )}
      {healthCategory && healthArticles && healthArticles.length > 0 && (
        <CategorySection
          category={healthCategory}
          articles={healthArticles}
        />
      )}

      {/* Show error message */}
      {hasError && !isLoading && (
        <div className="container py-16 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Content</h2>
            <p className="text-muted-foreground mb-4">
              {featuredError?.message || trendingError?.message || latestError?.message || categoriesError?.message || 'Failed to load content from database'}
            </p>
            
            {/* Collection Not Found Error Help */}
            {(featuredError?.message?.includes('collection') || 
              featuredError?.message?.includes('not found') ||
              latestError?.message?.includes('collection')) && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4 text-left">
                <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Firestore Collections Not Created</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  The Firestore collections don't exist yet. You need to create them first.
                </p>
                <ol className="text-sm text-yellow-800 dark:text-yellow-200 list-decimal list-inside space-y-2 mb-3">
                  <li>Go to your Firebase Console: <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">https://console.firebase.google.com</a></li>
                  <li>Select your project</li>
                  <li>Navigate to <strong>Firestore Database</strong></li>
                  <li>Create the required collections: <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">articles</code>, <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">categories</code>, <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">tags</code></li>
                  <li><strong>Restart your dev server</strong> (stop with Ctrl+C, then run <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">npm run dev</code>)</li>
                  <li>Refresh this page</li>
                </ol>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                  📝 See <code className="bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded">FIREBASE_SETUP.md</code> for detailed steps
                </p>
              </div>
            )}

            {/* Environment Variables Not Loaded */}
            {(!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID) && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mt-4 text-left">
                <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2">⚠️ Environment Variables Not Loaded</h3>
                <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                  Your .env file exists but Vite hasn't loaded the variables. You need to restart the dev server.
                </p>
                <ol className="text-sm text-orange-800 dark:text-orange-200 list-decimal list-inside space-y-2 mb-3">
                  <li>Stop the current dev server (press <strong>Ctrl+C</strong> in the terminal)</li>
                  <li>Run <code className="bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded">npm run dev</code> again</li>
                  <li>Wait for the server to start completely</li>
                  <li>Refresh this page</li>
                </ol>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                  💡 Make sure your .env file is in the root directory and contains VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID
                </p>
              </div>
            )}

            {/* Permission Error Help */}
            {(featuredError?.message?.includes('permission') || 
              featuredError?.message?.includes('Permission denied') ||
              latestError?.message?.includes('permission') ||
              latestError?.message?.includes('Permission denied')) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4 text-left">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">🔒 Firestore Security Rules Issue</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Your Firestore security rules may not allow public read access.
                </p>
                <ol className="text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside space-y-2">
                  <li>Go to your Firebase Console</li>
                  <li>Navigate to Firestore Database → Rules</li>
                  <li>Update your security rules to allow public read access for articles and categories</li>
                  <li>See <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">FIREBASE_SETUP.md</code> for example rules</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}
            
            {import.meta.env.DEV && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">Debug Info</summary>
                <pre className="mt-2 text-xs bg-background p-4 rounded overflow-auto">
                  {JSON.stringify({
                    featuredError: featuredError?.message,
                    trendingError: trendingError?.message,
                    latestError: latestError?.message,
                    categoriesError: categoriesError?.message,
                    env: {
                      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
                      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
                      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET',
                    },
                    instructions: [
                      '1. Restart your dev server (npm run dev) to load .env variables',
                      '2. Set up Firebase Firestore collections (articles, categories, etc.)',
                      '3. Configure Firestore security rules',
                      '4. Refresh this page'
                    ]
                  }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Show message when no articles */}
      {!hasError && (!latestArticles || latestArticles.length === 0) && !isLoading && (
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Articles Yet</h2>
          <p className="text-muted-foreground">Check back soon for new content!</p>
        </div>
      )}
    </Layout>
  );
};

export default Index;