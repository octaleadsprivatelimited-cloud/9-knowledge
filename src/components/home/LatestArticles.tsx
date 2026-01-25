import { Clock } from "lucide-react";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { PublicArticle } from "@/hooks/usePublicArticles";

interface LatestArticlesProps {
  articles: PublicArticle[];
}

export function LatestArticles({ articles }: LatestArticlesProps) {
  return (
    <section className="container py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {articles.map((article, index) => (
          <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <ArticleCard article={article} variant="latest" />
          </div>
        ))}
      </div>
    </section>
  );
}