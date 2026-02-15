import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit as firestoreLimit, type QueryDocumentSnapshot } from 'firebase/firestore';
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
        if (!db) {
          setResults([]);
          return;
        }

        const searchLower = searchQuery.toLowerCase().trim();
        let docs: QueryDocumentSnapshot[] = [];

        try {
          const articlesQuery = query(
            collection(db, 'articles'),
            where('status', '==', 'published'),
            orderBy('published_at', 'desc'),
            firestoreLimit(100)
          );
          const snapshot = await getDocs(articlesQuery);
          docs = snapshot.docs;
        } catch (indexErr: unknown) {
          const err = indexErr as { code?: string; message?: string };
          if (err?.code === 'failed-precondition' || err?.message?.includes('index')) {
            const fallbackQuery = query(
              collection(db, 'articles'),
              where('status', '==', 'published'),
              firestoreLimit(100)
            );
            const snapshot = await getDocs(fallbackQuery);
            docs = snapshot.docs;
            docs.sort((a, b) => {
              const aTime = a.data().published_at?.toDate?.()?.getTime() ?? 0;
              const bTime = b.data().published_at?.toDate?.()?.getTime() ?? 0;
              return bTime - aTime;
            });
          } else {
            throw indexErr;
          }
        }

        const filteredResults: SearchResult[] = [];

        for (const docSnapshot of docs) {
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
            const publishedAt = data.published_at;
            const publishedAtStr =
              publishedAt?.toDate?.()?.toISOString?.() ??
              (typeof publishedAt === 'string' ? publishedAt : null);

            filteredResults.push({
              id: docSnapshot.id,
              title: data.title,
              slug: data.slug,
              excerpt: data.excerpt,
              featured_image: data.featured_image,
              published_at: publishedAtStr,
              reading_time: data.reading_time,
              category: category ? {
                name: category.name,
                slug: category.slug,
              } : null,
            });

            if (filteredResults.length >= 15) break;
          }
        }

        setResults(filteredResults);
      } catch (err) {
        setError(err as Error);
        setResults([]);
        if (import.meta.env.DEV) {
          console.warn('Search error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debounceMs]);

  return { results, isLoading, error };
};
