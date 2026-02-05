import { Link } from "react-router-dom";
import type { PublicArticle } from "@/hooks/usePublicArticles";

interface LatestUpdatesStripProps {
  articles: PublicArticle[];
}

const placeholderImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop";

export function LatestUpdatesStrip({ articles }: LatestUpdatesStripProps) {
  if (!articles.length) return null;

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="container py-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Latest Updates</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="group shrink-0 w-[280px] sm:w-[300px] bg-card rounded-lg border border-border overflow-hidden hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={article.featured_image || placeholderImage}
                  alt={article.featured_image_alt || article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                {article.category && (
                  <span className="text-xs font-medium text-primary">
                    {article.category.name}
                  </span>
                )}
                <h3 className="font-semibold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
