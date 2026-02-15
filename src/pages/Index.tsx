import { useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { LatestUpdatesStrip } from "@/components/home/LatestUpdatesStrip";
import { CategoryArticlesSection } from "@/components/home/CategoryArticlesSection";
import { WebsiteSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { Helmet } from "react-helmet-async";
import { useLatestArticles } from "@/hooks/usePublicArticles";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryDisplayOrder } from "@/hooks/useCategoryDisplayOrder";
import { sortCategoriesByDisplayOrder } from "@/lib/categoryOrder";
import { Skeleton } from "@/components/ui/skeleton";
import { triggerTranslateForDynamicContent } from "@/components/GoogleTranslate";

/** These category sections always show on homepage (even with no articles), in display order */
const ALWAYS_SHOW_SECTIONS = ["News", "Life Style", "Entertainment", "Business", "National News"] as const;
const normalizeName = (s: string) => s?.toLowerCase().trim() ?? "";
const isPrioritySection = (name: string) =>
  ALWAYS_SHOW_SECTIONS.some((p) => normalizeName(p) === normalizeName(name));

const Index = () => {
  const { data: categoriesRaw = [], error: categoriesError } = useCategories();
  const { data: displayOrder = [] } = useCategoryDisplayOrder();
  const categories = useMemo(
    () => sortCategoriesByDisplayOrder(categoriesRaw, displayOrder.length ? displayOrder : undefined),
    [categoriesRaw, displayOrder]
  );
  const { data: latestArticles, isLoading: latestLoading, error: latestError } = useLatestArticles(6);

  const hasError = latestError || categoriesError;

  // Re-apply Google Translate when homepage content is ready (e.g. after selecting language and reloading)
  useEffect(() => {
    if (!latestLoading) triggerTranslateForDynamicContent();
  }, [latestLoading]);

  if (import.meta.env.DEV) {
    if (latestError) console.error("Latest articles error:", latestError);
    if (categoriesError) console.error("Categories error:", categoriesError);
  }

  return (
    <Layout>
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

      {/* Latest Updates strip - skeleton while loading so page shell appears fast */}
      {latestLoading ? (
        <section className="border-b border-border bg-muted/30">
          <div className="container py-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex gap-3 md:gap-4 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[140px] w-full min-w-[200px] max-w-[300px] rounded-lg shrink-0" />
              ))}
            </div>
          </div>
        </section>
      ) : latestArticles && latestArticles.length > 0 ? (
        <LatestUpdatesStrip articles={latestArticles} />
      ) : null}

      {/* Category sections in order: News, National News, Business, Entertainment, Life Style */}
      {categories && categories.length > 0 && categories.map((category) => (
        <CategoryArticlesSection
          key={category.id}
          category={category}
          alwaysShow={isPrioritySection(category.name)}
        />
      ))}

      {hasError && !latestLoading && (
        <div className="container py-16 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Content</h2>
            <p className="text-muted-foreground">
              {latestError?.message || categoriesError?.message || "Failed to load content."}
            </p>
          </div>
        </div>
      )}

      {!hasError && (!latestArticles || latestArticles.length === 0) && !latestLoading && (
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Articles Yet</h2>
          <p className="text-muted-foreground">Check back soon for new content!</p>
        </div>
      )}
    </Layout>
  );
};

export default Index;
