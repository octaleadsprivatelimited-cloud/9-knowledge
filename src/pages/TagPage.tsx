import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Tag } from "lucide-react";
import { useArticlesByTag, useTagBySlug } from "@/hooks/useTags";
import { PageHero } from "@/components/layout/PageHero";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: tag, isLoading: tagLoading } = useTagBySlug(slug || '');
  const { data: articles, isLoading: articlesLoading } = useArticlesByTag(slug || '', 20);
  
  const isLoading = tagLoading || articlesLoading;

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

  if (!tag) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Tag Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The tag you're looking for doesn't exist.
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
          <li className="text-foreground font-medium flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {tag.name}
          </li>
        </ol>
      </nav>

      <PageHero
        title={
          <>
            <span className="inline-flex items-center gap-2">
              <Tag className="h-8 w-8 sm:h-9 sm:w-9 opacity-90" />
              {tag.name}
            </span>
          </>
        }
        subtitle={`Articles tagged "${tag.name}".`}
      />

      <div className="container py-4 text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {articles?.length || 0} article{articles?.length !== 1 ? 's' : ''} found with this tag.
        </p>
      </div>

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
            <p className="text-muted-foreground">No articles with this tag yet.</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TagPage;
