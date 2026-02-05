import { CategorySection } from "@/components/home/CategorySection";
import { useArticlesByCategory } from "@/hooks/usePublicArticles";

interface CategoryArticlesSectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
  /** When true, section is shown even when there are no articles (e.g. Business, Entertainment) */
  alwaysShow?: boolean;
}

export function CategoryArticlesSection({ category, alwaysShow = false }: CategoryArticlesSectionProps) {
  const { data: articles, error, isLoading } = useArticlesByCategory(category.slug, 4, { enabled: !!category.slug });
  
  if (process.env.NODE_ENV === 'development' && error) {
    console.warn(`Error loading articles for category ${category.slug}:`, error);
  }
  
  if (isLoading && !alwaysShow) {
    return null;
  }
  
  const list = articles ?? [];
  const hasArticles = list.length > 0;
  
  if (!hasArticles && !alwaysShow) {
    return null;
  }
  
  return (
    <CategorySection
      category={category}
      articles={list}
    />
  );
}
