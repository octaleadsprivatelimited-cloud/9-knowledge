import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useArticlesByCategory } from "@/hooks/usePublicArticles";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: articles, isLoading: articlesLoading } = useArticlesByCategory(slug || '', 20);
  
  const category = categories?.find((c) => c.slug === slug);
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
      {/* Breadcrumb */}
      <nav className="container py-4 border-b border-border">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" />
          <li className="text-foreground font-medium">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <header className="container py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          {category.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the latest articles and insights about {category.name.toLowerCase()}.
        </p>
      </header>

      {/* Articles Grid */}
      <section className="container pb-12">
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