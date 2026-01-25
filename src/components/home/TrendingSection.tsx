import { TrendingUp } from "lucide-react";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { PublicArticle } from "@/hooks/usePublicArticles";

interface TrendingSectionProps {
  articles: PublicArticle[];
}

export function TrendingSection({ articles }: TrendingSectionProps) {
  return (
    <section className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10">
          <TrendingUp className="h-4 w-4 text-accent" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">
          Trending News
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {articles.slice(0, 4).map((article, index) => (
          <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <ArticleCard article={article} variant="compact" className="hidden md:flex" />
            <ArticleCard article={article} className="md:hidden" />
          </div>
        ))}
      </div>
    </section>
  );
}