import { CategorySection } from "@/components/home/CategorySection";
import { useArticlesByCategory } from "@/hooks/usePublicArticles";

interface CategoryArticlesSectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
}

export function CategoryArticlesSection({ category }: CategoryArticlesSectionProps) {
  const { data: articles, error, isLoading } = useArticlesByCategory(category.slug, 3, { enabled: !!category.slug });
  
  // Debug logging (remove in production if needed)
  if (process.env.NODE_ENV === 'development') {
    if (error) {
      console.warn(`Error loading articles for category ${category.slug}:`, error);
    }
    if (articles && articles.length === 0) {
      console.log(`No articles found for category ${category.slug}`);
    }
  }
  
  if (isLoading) {
    return null; // Don't show anything while loading
  }
  
  if (error || !articles || articles.length === 0) {
    return null;
  }
  
  return (
    <CategorySection
      category={category}
      articles={articles}
    />
  );
}
