import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { PublicArticle } from "@/hooks/usePublicArticles";

interface CategorySectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
  articles: PublicArticle[];
}

export function CategorySection({ category, articles }: CategorySectionProps) {
  if (articles.length === 0) return null;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background border-t border-border">
      <div className="container py-16 md:py-20">
        {/* Section Header - Completely New Design */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              Featured Category
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Category Icon/Image - Special for Yoga */}
              {category.slug.toLowerCase() === 'yoga' || category.name.toLowerCase() === 'yoga' ? (
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-accent/20 shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop"
                      alt="Yoga"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}
              
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-3 leading-tight">
                  {category.name}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Discover curated stories and insights from our {category.name.toLowerCase()} collection
                </p>
              </div>
            </div>
            
            <Link
              to={`/category/${category.slug}`}
              className="group flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 w-fit"
            >
              <span>Explore All</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* New Layout: Main Article + Side Articles */}
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Main Featured Article - Large */}
          {mainArticle && (
            <div className="lg:col-span-7">
              <Link
                to={`/article/${mainArticle.slug}`}
                className="group block relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-accent/50 transition-all duration-500 hover:shadow-2xl"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={mainArticle.featured_image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop"}
                    alt={mainArticle.featured_image_alt || mainArticle.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  {mainArticle.category && (
                    <div className="mb-4">
                      <span className="inline-block px-4 py-1.5 bg-accent text-white rounded-full text-sm font-semibold">
                        {mainArticle.category.name}
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                    {mainArticle.title}
                  </h3>
                  <p className="text-white/90 text-base mb-4 line-clamp-2">
                    {mainArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span>{new Date(mainArticle.published_at || '').toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{mainArticle.reading_time || 5} min read</span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Side Articles - Vertical Stack */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {sideArticles.map((article, index) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group flex gap-4 bg-card rounded-xl border border-border hover:border-accent/50 p-4 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-32 h-24 md:w-40 md:h-28 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={article.featured_image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop"}
                    alt={article.featured_image_alt || article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {article.category && (
                    <span className="inline-block px-2.5 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-semibold mb-2">
                      {article.category.name}
                    </span>
                  )}
                  <h4 className="font-display font-bold text-base md:text-lg text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(article.published_at || '').toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{article.reading_time || 3} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Articles Grid */}
        {articles.length > 4 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            {articles.slice(4, 8).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                className="hover:scale-[1.02] transition-transform duration-300"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}