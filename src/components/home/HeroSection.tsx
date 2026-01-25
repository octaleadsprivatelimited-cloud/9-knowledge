import { Link } from "react-router-dom";
import { Clock, TrendingUp, ArrowRight, Calendar, User } from "lucide-react";
import { CategoryBadge } from "@/components/articles/CategoryBadge";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data";
import type { PublicArticle } from "@/hooks/usePublicArticles";

interface HeroSectionProps {
  featuredArticles: PublicArticle[];
  trendingArticles?: PublicArticle[];
}

const formatRelativeDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function HeroSection({ featuredArticles, trendingArticles = [] }: HeroSectionProps) {
  const mainArticle = featuredArticles[0];
  const secondaryArticles = featuredArticles.slice(1, 4);
  
  // Use trending articles if provided, otherwise use featured articles that are trending
  const trendingNews = trendingArticles.length > 0 
    ? trendingArticles.slice(0, 12)
    : featuredArticles.filter(article => article.is_trending).slice(0, 12);

  if (!mainArticle) return null;

  const placeholderImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop";
  
  // Category images mapping
  const categoryImages: Record<string, string> = {
    health: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    food: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
    technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    facts: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop",
    finance: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop",
  };
  
  // Custom image for Yoga category
  const isYogaCategory = mainArticle.category?.slug?.toLowerCase() === 'yoga' || 
                         mainArticle.category?.name?.toLowerCase() === 'yoga';
  const yogaImage = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop";
  // Use yoga image for yoga category, otherwise use article image or placeholder
  const heroImage = isYogaCategory 
    ? yogaImage 
    : (mainArticle.featured_image || placeholderImage);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container py-8 md:py-12 lg:py-16">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Trending News - Mobile */}
          {trendingNews.length > 0 && (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-3">
                {trendingNews.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-accent/50 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={article.featured_image || placeholderImage}
                        alt={article.featured_image_alt || article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-accent/90 rounded-full text-white text-[9px] font-semibold">
                          <TrendingUp className="h-2 w-2" />
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-display font-bold text-xs text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2 w-2" />
                          {article.reading_time || 3}m
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories Grid - Mobile */}
          <div className="mt-6">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">
              Browse Categories
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <img
                      src={categoryImages[category.slug] || placeholderImage}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <h3 className="font-display font-bold text-lg text-white text-center group-hover:text-accent transition-colors drop-shadow-lg">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout - Modern Hero Design */}
        <div className="hidden md:block">
          {/* Trending News Section */}
          {trendingNews.length > 0 && (
            <div className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingNews.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={article.featured_image || placeholderImage}
                        alt={article.featured_image_alt || article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/90 backdrop-blur-sm rounded-full text-white text-[10px] font-semibold">
                          <TrendingUp className="h-2.5 w-2.5" />
                          Hot
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      {article.category && (
                        <div className="mb-2">
                          <CategoryBadge category={article.category} size="sm" className="text-[10px] px-1.5 py-0.5" />
                        </div>
                      )}
                      <h3 className="font-display font-bold text-xs md:text-sm text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {article.reading_time || 3}m
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Browse Categories
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <div className="aspect-square relative overflow-hidden rounded-xl">
                    <img
                      src={categoryImages[category.slug] || placeholderImage}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-2 text-center group-hover:text-accent transition-colors drop-shadow-lg">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-white/90 group-hover:text-accent transition-colors">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}