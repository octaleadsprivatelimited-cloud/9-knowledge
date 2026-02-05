import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useArticlesByCategory } from "@/hooks/usePublicArticles";
import { PageHero } from "@/components/layout/PageHero";

const normalize = (s: string | undefined) => s?.toLowerCase().trim() ?? '';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const slugNorm = normalize(slug);
  const category = categories?.find(
    (c) => normalize(c.slug) === slugNorm || normalize(c.name) === slugNorm
  );
  const { data: articles, isLoading: articlesLoading } = useArticlesByCategory(category?.slug ?? slug ?? '', 20);
  const isLoading = categoriesLoading || articlesLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="container py-3 border-b border-border">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" />
          <li className="text-foreground font-medium">{category.name}</li>
        </ol>
      </nav>

      <PageHero
        title={category.name}
        subtitle={`Explore the latest articles and insights about ${category.name.toLowerCase()}.`}
      />

      {/* Articles Grid – space between hero and cards */}
      <section className="container pt-10 sm:pt-12 pb-12">
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles in this category yet.</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default CategoryPage;