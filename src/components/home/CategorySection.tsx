import { Link } from "react-router-dom";
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

const placeholderImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop";

/** Boldsky-style: section heading + row of article cards (image, title, category) */
export function CategorySection({ category, articles }: CategorySectionProps) {
  return (
    <section className="border-b border-border py-8">
      <div className="container">
        <h2 className="text-xl font-bold text-foreground mb-6">
          <Link to={`/category/${category.slug}`} className="hover:text-primary transition-colors">
            {category.name}
          </Link>
        </h2>
        {articles.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug || article.id}?id=${article.id}`}
              className="group block bg-card rounded-lg border border-border overflow-hidden hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden">
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
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        ) : (
          <p className="text-muted-foreground text-sm">No articles in this category yet.</p>
        )}
      </div>
    </section>
  );
}
