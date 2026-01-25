import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
  published_at: string | null;
  reading_time: number | null;
}

// Helper to fetch category data
const fetchCategory = async (categoryId: string | null | undefined) => {
  if (!categoryId) return null;
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
    if (categoryDoc.exists()) {
      return categoryDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const useSearch = (searchQuery: string, debounceMs: number = 300) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Firestore doesn't support full-text search natively
        // We'll fetch published articles and filter in memory
        const articlesQuery = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('published_at', 'desc'),
          firestoreLimit(50) // Fetch more to filter
        );

        const snapshot = await getDocs(articlesQuery);
        const searchLower = searchQuery.toLowerCase();
        
        const filteredResults: SearchResult[] = [];

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          const title = (data.title || '').toLowerCase();
          const excerpt = (data.excerpt || '').toLowerCase();
          const content = (data.content || '').toLowerCase();

          if (
            title.includes(searchLower) ||
            excerpt.includes(searchLower) ||
            content.includes(searchLower)
          ) {
            const category = await fetchCategory(data.category_id);
            
            filteredResults.push({
              id: docSnapshot.id,
              title: data.title,
              slug: data.slug,
              excerpt: data.excerpt,
              featured_image: data.featured_image,
              published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at,
              reading_time: data.reading_time,
              category: category ? {
                name: category.name,
                slug: category.slug,
              } : null,
            });

            if (filteredResults.length >= 10) break;
          }
        }

        setResults(filteredResults);
      } catch (err) {
        setError(err as Error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debounceMs]);

  return { results, isLoading, error };
};
