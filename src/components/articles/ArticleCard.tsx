import { Link } from "react-router-dom";
import { Clock, Eye, TrendingUp, ArrowUp } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { cn } from "@/lib/utils";
import type { PublicArticle } from "@/hooks/usePublicArticles";

interface ArticleCardProps {
  article: PublicArticle;
  variant?: "default" | "featured" | "horizontal" | "compact" | "mobile" | "latest";
  className?: string;
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

export function ArticleCard({ article, variant = "default", className }: ArticleCardProps) {
  const placeholderImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop";

  if (variant === "featured") {
    return (
      <article className={cn("group relative overflow-hidden rounded-xl", className)}>
        <Link to={`/article/${article.slug || article.id}?id=${article.id}`} className="block">
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={article.featured_image || placeholderImage}
              alt={article.featured_image_alt || article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            {article.category && (
              <CategoryBadge category={article.category} className="mb-2 md:mb-3" />
            )}
            <h2 className="text-lg md:text-2xl lg:text-3xl font-display font-bold text-primary-foreground mb-1 md:mb-2 line-clamp-2">
              {article.title}
            </h2>
            <p className="text-primary-foreground/80 text-sm mb-3 line-clamp-2 hidden md:block">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-2 md:gap-4 text-xs text-primary-foreground/70">
              <span>{formatRelativeDate(article.published_at)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.reading_time || 1} min
              </span>
              {article.is_trending && (
                <span className="flex items-center gap-1 text-accent">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">Trending</span>
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className={cn("group article-card flex gap-4", className)}>
        <Link to={`/article/${article.slug || article.id}?id=${article.id}`} className="shrink-0">
          <div className="w-32 h-24 md:w-48 md:h-32 overflow-hidden rounded-lg">
            <img
              src={article.featured_image || placeholderImage}
              alt={article.featured_image_alt || article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
        <div className="flex flex-col justify-center min-w-0">
          {article.category && (
            <CategoryBadge category={article.category} className="mb-2 self-start" />
          )}
          <Link to={`/article/${article.slug || article.id}?id=${article.id}`}>
            <h3 className="font-display font-bold text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatRelativeDate(article.published_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.reading_time || 1} min
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group flex items-start gap-3", className)}>
        <span className="shrink-0 text-3xl font-display font-bold text-muted-foreground/30 group-hover:text-accent transition-colors">
          {String(article.view_count || 0).padStart(2, "0").slice(0, 2)}
        </span>
        <div className="min-w-0">
          <Link to={`/article/${article.slug || article.id}?id=${article.id}`}>
            <h4 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-accent transition-colors">
              {article.title}
            </h4>
          </Link>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{article.category?.name || 'Uncategorized'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {(article.view_count || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "mobile") {
    return (
      <article className={cn("group article-card bg-card rounded-lg overflow-hidden border border-border", className)}>
        <Link to={`/article/${article.slug || article.id}?id=${article.id}`} className="block">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={article.featured_image || placeholderImage}
              alt={article.featured_image_alt || article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
        <div className="p-2.5">
          {article.category && (
            <CategoryBadge category={article.category} size="sm" className="mb-1.5" />
          )}
          <Link to={`/article/${article.slug || article.id}?id=${article.id}`}>
            <h3 className="font-display font-bold text-sm text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors leading-tight">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{formatRelativeDate(article.published_at)}</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {article.reading_time || 1}m
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "latest") {
    return (
      <article className={cn("group article-card bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300", className)}>
        <Link to={`/article/${article.slug || article.id}?id=${article.id}`} className="block">
          <div className="aspect-[4/3] relative overflow-hidden">
            <img
              src={article.featured_image || placeholderImage}
              alt={article.featured_image_alt || article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Hot Badge - Top Right */}
            {(article.is_trending || article.is_featured) && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold shadow-lg">
                <ArrowUp className="h-3 w-3" />
                Hot
              </div>
            )}
          </div>
        </Link>
        <div className="p-4">
          {/* Category Tag */}
          {article.category && (
            <div className="mb-2">
              <span className="inline-block px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md uppercase tracking-wide">
                {article.category.name}
              </span>
            </div>
          )}
          {/* Article Title */}
          <Link to={`/article/${article.slug || article.id}?id=${article.id}`}>
            <h3 className="font-display font-bold text-base md:text-lg text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors leading-tight">
              {article.title}
            </h3>
          </Link>
          {/* Reading Time */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{article.reading_time || 1}m</span>
          </div>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className={cn("group article-card bg-card rounded-lg md:rounded-xl overflow-hidden border border-border", className)}>
      <Link to={`/article/${article.slug || article.id}?id=${article.id}`} className="block">
        <div className="aspect-[4/3] md:aspect-[16/10] overflow-hidden">
          <img
            src={article.featured_image || placeholderImage}
            alt={article.featured_image_alt || article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-2.5 md:p-4">
        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
          {article.category && (
            <CategoryBadge category={article.category} size="sm" className="md:text-xs" />
          )}
          {article.is_trending && (
            <span className="hidden md:flex items-center gap-1 text-xs text-accent font-medium">
              <TrendingUp className="h-3 w-3" />
              Trending
            </span>
          )}
        </div>
        <Link to={`/article/${article.slug || article.id}?id=${article.id}`}>
          <h3 className="font-display font-bold text-sm md:text-lg text-foreground mb-1 md:mb-2 line-clamp-2 group-hover:text-accent transition-colors leading-tight">
            {article.title}
          </h3>
        </Link>
        <p className="hidden md:block text-sm text-muted-foreground line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground">
          <div className="flex items-center gap-2 md:gap-3">
            <span>{formatRelativeDate(article.published_at)}</span>
            <span className="flex items-center gap-0.5 md:gap-1">
              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
              {article.reading_time || 1}m
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}