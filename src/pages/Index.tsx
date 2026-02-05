import { Layout } from "@/components/layout/Layout";
import { LatestUpdatesStrip } from "@/components/home/LatestUpdatesStrip";
import { CategoryArticlesSection } from "@/components/home/CategoryArticlesSection";
import { WebsiteSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { Helmet } from "react-helmet-async";
import { useLatestArticles } from "@/hooks/usePublicArticles";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

/** Business and Entertainment always show as separate sections (first), even if empty */
const PRIORITY_SECTION_NAMES = ["Business", "Entertainment"] as const;
const normalizeName = (s: string) => s?.toLowerCase().trim() ?? "";
const isPrioritySection = (name: string) =>
  PRIORITY_SECTION_NAMES.some((p) => normalizeName(p) === normalizeName(name));

/** Order: Business and Entertainment first, then the rest */
function orderCategoriesForHome<T extends { name: string }>(categories: T[]): T[] {
  if (!categories.length) return categories;
  const priority: T[] = [];
  const rest: T[] = [];
  for (const c of categories) {
    if (isPrioritySection(c.name)) priority.push(c);
    else rest.push(c);
  }
  const ordered = [...priority.sort((a, b) => {
    const ai = PRIORITY_SECTION_NAMES.findIndex((p) => normalizeName(p) === normalizeName(a.name));
    const bi = PRIORITY_SECTION_NAMES.findIndex((p) => normalizeName(p) === normalizeName(b.name));
    return ai - bi;
  }), ...rest];
  return ordered;
}

const Index = () => {
  const { data: categoriesRaw = [], error: categoriesError } = useCategories();
  const categories = orderCategoriesForHome(categoriesRaw);
  const { data: latestArticles, isLoading: latestLoading, error: latestError } = useLatestArticles(12);

  const isLoading = latestLoading;
  const hasError = latestError || categoriesError;

  if (import.meta.env.DEV) {
    if (latestError) console.error("Latest articles error:", latestError);
    if (categoriesError) console.error("Categories error:", categoriesError);
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-[280px] shrink-0 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
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

      {/* Latest Updates strip */}
      {latestArticles && latestArticles.length > 0 && (
        <LatestUpdatesStrip articles={latestArticles} />
      )}

      {/* All categories one by one – Business & Entertainment first as separate sections, then rest */}
      {categories && categories.length > 0 && categories.map((category) => (
        <CategoryArticlesSection
          key={category.id}
          category={category}
          alwaysShow={isPrioritySection(category.name)}
        />
      ))}

      {hasError && !isLoading && (
        <div className="container py-16 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Content</h2>
            <p className="text-muted-foreground">
              {latestError?.message || categoriesError?.message || "Failed to load content."}
            </p>
          </div>
        </div>
      )}

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
