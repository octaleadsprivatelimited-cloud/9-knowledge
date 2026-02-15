import { useQuery } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  type DocumentSnapshot
} from 'firebase/firestore';

// Firestore doc IDs are typically 20 chars alphanumeric
const looksLikeDocId = (s: string) => /^[a-zA-Z0-9]{19,21}$/.test(s);
import { db } from '@/integrations/firebase/client';

export interface PublicArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  reading_time: number | null;
  published_at: string | null;
  is_featured: boolean | null;
  is_trending: boolean | null;
  view_count: number | null;
  author_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

// Helper to convert Firestore timestamp to ISO string
const convertTimestamp = (timestamp: any): string | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// Helper to fetch category data
const fetchCategory = async (categoryId: string | null | undefined) => {
  if (!categoryId || !db) return null;
  try {
    const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
    if (categoryDoc.exists()) {
      return { id: categoryDoc.id, ...categoryDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

// Helper to convert article document to PublicArticle
const convertToPublicArticle = async (docSnapshot: any): Promise<PublicArticle> => {
  const data = docSnapshot.data();
  
  // Handle missing db gracefully
  const metaKeywords = data.meta_keywords;
  const metaKeywordsArr = Array.isArray(metaKeywords) ? metaKeywords : (metaKeywords ? [metaKeywords] : null);

  if (!db) {
    return {
      id: docSnapshot.id,
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || null,
      content: data.content || null,
      featured_image: data.featured_image || null,
      featured_image_alt: data.featured_image_alt || null,
      reading_time: data.reading_time || null,
      published_at: convertTimestamp(data.published_at),
      is_featured: data.is_featured || null,
      is_trending: data.is_trending || null,
      view_count: data.view_count || null,
      author_id: data.author_id || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      meta_keywords: metaKeywordsArr,
      category: null,
    };
  }

  const category = await fetchCategory(data.category_id);

  return {
    id: docSnapshot.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    featured_image: data.featured_image,
    featured_image_alt: data.featured_image_alt,
    reading_time: data.reading_time,
    published_at: convertTimestamp(data.published_at),
    is_featured: data.is_featured,
    is_trending: data.is_trending,
    view_count: data.view_count,
    author_id: data.author_id,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    meta_keywords: metaKeywordsArr,
    category: category ? {
      id: category.id,
      name: category.name,
      slug: category.slug,
      color: category.color || null,
    } : null,
  };
};

/** Convert doc to PublicArticle using a pre-fetched category map (no extra getDoc). Used for batch loading. */
const convertToPublicArticleWithCategoryMap = (docSnapshot: any, categoryMap: Map<string, { id: string; name?: string; slug?: string; color?: string }>): PublicArticle => {
  const data = docSnapshot.data();
  const metaKeywords = data.meta_keywords;
  const metaKeywordsArr = Array.isArray(metaKeywords) ? metaKeywords : (metaKeywords ? [metaKeywords] : null);
  const category = data.category_id ? categoryMap.get(data.category_id) : null;
  return {
    id: docSnapshot.id,
    title: data.title || '',
    slug: data.slug || '',
    excerpt: data.excerpt || null,
    content: data.content || null,
    featured_image: data.featured_image || null,
    featured_image_alt: data.featured_image_alt || null,
    reading_time: data.reading_time || null,
    published_at: convertTimestamp(data.published_at),
    is_featured: data.is_featured || null,
    is_trending: data.is_trending || null,
    view_count: data.view_count || null,
    author_id: data.author_id || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    meta_keywords: metaKeywordsArr,
    category: category ? { id: category.id, name: category.name ?? '', slug: category.slug ?? '', color: category.color ?? null } : null,
  };
};

export const usePublishedArticles = () => {
  return useQuery({
    queryKey: ['published-articles'],
    queryFn: async () => {
      if (!db) {
        throw new Error('Firebase is not configured');
      }

      try {
        const articlesQuery = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('published_at', 'desc')
        );

        const snapshot = await getDocs(articlesQuery);
        const articles: PublicArticle[] = [];

        for (const docSnapshot of snapshot.docs) {
          articles.push(await convertToPublicArticle(docSnapshot));
        }

        return articles;
      } catch (error: any) {
        // If collection doesn't exist or permission denied, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Published articles: Collection not found or permission denied');
          return [];
        }
        // If orderBy fails, try without orderBy
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          if (import.meta.env.DEV) {
            console.warn('Published articles: orderBy failed, trying without orderBy:', error.message);
          }
          
          const articlesQuery = query(
            collection(db, 'articles'),
            where('status', '==', 'published')
          );

          const snapshot = await getDocs(articlesQuery);
          const articles: PublicArticle[] = [];

          for (const docSnapshot of snapshot.docs) {
            articles.push(await convertToPublicArticle(docSnapshot));
          }

          // Sort manually
          articles.sort((a, b) => {
            if (!a.published_at || !b.published_at) return 0;
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          });

          return articles;
        }
        // If collection doesn't exist or permission denied, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Published articles: Collection not found or permission denied');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
  });
};

export const useFeaturedArticles = () => {
  return useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      if (!db) {
        throw new Error('Firebase is not configured');
      }

      try {
        // Try query with orderBy first
        const articlesQuery = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          where('is_featured', '==', true),
          orderBy('published_at', 'desc'),
          firestoreLimit(5)
        );

        const snapshot = await getDocs(articlesQuery);
        const articles: PublicArticle[] = [];

        for (const docSnapshot of snapshot.docs) {
          articles.push(await convertToPublicArticle(docSnapshot));
        }

        if (import.meta.env.DEV) {
          console.log('Featured articles loaded:', articles.length);
        }

        return articles;
      } catch (error: any) {
        // If orderBy fails (likely missing index), try without orderBy
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          if (import.meta.env.DEV) {
            console.warn('Featured articles: orderBy failed, trying without orderBy:', error.message);
          }
          
          const articlesQuery = query(
            collection(db, 'articles'),
            where('status', '==', 'published'),
            where('is_featured', '==', true),
            firestoreLimit(5)
          );

          const snapshot = await getDocs(articlesQuery);
          const articles: PublicArticle[] = [];

          for (const docSnapshot of snapshot.docs) {
            articles.push(await convertToPublicArticle(docSnapshot));
          }

          // Sort manually by published_at
          articles.sort((a, b) => {
            if (!a.published_at || !b.published_at) return 0;
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          });

          return articles;
        }
        // If collection doesn't exist or permission denied, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Featured articles: Collection not found or permission denied');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useTrendingArticles = () => {
  return useQuery({
    queryKey: ['trending-articles'],
    queryFn: async () => {
      if (!db) {
        throw new Error('Firebase is not configured');
      }

      try {
        // Try query with orderBy first
        const articlesQuery = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          where('is_trending', '==', true),
          orderBy('view_count', 'desc'),
          firestoreLimit(12)
        );

        const snapshot = await getDocs(articlesQuery);
        const articles: PublicArticle[] = [];

        for (const docSnapshot of snapshot.docs) {
          articles.push(await convertToPublicArticle(docSnapshot));
        }

        if (import.meta.env.DEV) {
          console.log('Trending articles loaded:', articles.length);
        }

        return articles;
      } catch (error: any) {
        // If orderBy fails (likely missing index), try without orderBy
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          if (import.meta.env.DEV) {
            console.warn('Trending articles: orderBy failed, trying without orderBy:', error.message);
          }
          
          const articlesQuery = query(
            collection(db, 'articles'),
            where('status', '==', 'published'),
            where('is_trending', '==', true),
            firestoreLimit(12)
          );

          const snapshot = await getDocs(articlesQuery);
          const articles: PublicArticle[] = [];

          for (const docSnapshot of snapshot.docs) {
            articles.push(await convertToPublicArticle(docSnapshot));
          }

          // Sort manually by view_count
          articles.sort((a, b) => {
            const aViews = a.view_count || 0;
            const bViews = b.view_count || 0;
            return bViews - aViews;
          });

          return articles;
        }
        // If collection doesn't exist or permission denied, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Trending articles: Collection not found or permission denied');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/** Fetch unique categories in one parallel batch (avoids N sequential getDoc in latest articles). */
const fetchCategoryMap = async (categoryIds: string[]): Promise<Map<string, { id: string; name?: string; slug?: string; color?: string }>> => {
  const unique = [...new Set(categoryIds.filter(Boolean))];
  if (!db || unique.length === 0) return new Map();
  const pairs = await Promise.all(
    unique.map(async (id) => {
      try {
        const snap = await getDoc(doc(db, 'categories', id));
        if (snap.exists()) return [id, { id: snap.id, ...snap.data() }] as const;
      } catch (_) {}
      return null;
    })
  );
  return new Map(pairs.filter((p): p is [string, { id: string; name?: string; slug?: string; color?: string }] => p !== null));
};

export const useLatestArticles = (limit: number = 9) => {
  return useQuery({
    queryKey: ['latest-articles', limit],
    queryFn: async () => {
      if (!db) {
        throw new Error('Firebase is not configured');
      }

      try {
        const articlesQuery = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('published_at', 'desc'),
          firestoreLimit(limit)
        );

        const snapshot = await getDocs(articlesQuery);
        const categoryIds = snapshot.docs.map((d) => d.data().category_id).filter(Boolean);
        const categoryMap = await fetchCategoryMap(categoryIds);
        const articles = snapshot.docs.map((d) => convertToPublicArticleWithCategoryMap(d, categoryMap));

        if (import.meta.env.DEV) {
          console.log('Latest articles loaded:', articles.length);
        }

        return articles;
      } catch (error: any) {
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Latest articles: Collection not found or permission denied');
          return [];
        }
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          if (import.meta.env.DEV) {
            console.warn('Latest articles: orderBy failed, trying without orderBy:', error.message);
          }

          const articlesQuery = query(
            collection(db, 'articles'),
            where('status', '==', 'published'),
            firestoreLimit(limit * 2)
          );

          const snapshot = await getDocs(articlesQuery);
          const categoryIds = snapshot.docs.map((d) => d.data().category_id).filter(Boolean);
          const categoryMap = await fetchCategoryMap(categoryIds);
          const articles = snapshot.docs.map((d) => convertToPublicArticleWithCategoryMap(d, categoryMap));

          articles.sort((a, b) => {
            if (!a.published_at || !b.published_at) return 0;
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          });

          return articles.slice(0, limit);
        }
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Latest articles: Collection not found or permission denied');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 min - fewer refetches, faster repeat loads
  });
};

/** Filter and convert article docs with batch category fetch (avoids N sequential getDoc). */
const filterAndConvertArticlesByCategory = async (
  docs: Array<{ id: string; data: () => any }>,
  limit: number,
  now: Date
): Promise<PublicArticle[]> => {
  const filtered: Array<{ id: string; data: () => any }> = [];
  for (const docSnapshot of docs) {
    const data = docSnapshot.data();
    const isPublished = data.status === 'published';
    const isScheduledAndReady = data.status === 'scheduled' && data.scheduled_at &&
      new Date(data.scheduled_at?.toDate ? data.scheduled_at.toDate() : data.scheduled_at) <= now;
    if (isPublished || isScheduledAndReady) filtered.push(docSnapshot);
  }
  const categoryIds = filtered.map((d) => d.data().category_id).filter(Boolean);
  const categoryMap = await fetchCategoryMap(categoryIds);
  const articles = filtered.map((d) => convertToPublicArticleWithCategoryMap(d, categoryMap));
  articles.sort((a, b) => {
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return dateB - dateA;
  });
  return articles.slice(0, limit);
};

export const useArticlesByCategory = (categorySlug: string, limit: number = 6, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['articles-by-category', categorySlug, limit],
    queryFn: async () => {
      if (!db) {
        console.warn('Firebase is not configured');
        return [];
      }

      try {
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('slug', '==', categorySlug),
          firestoreLimit(1)
        );
        const categorySnapshot = await getDocs(categoriesQuery);
        if (categorySnapshot.empty) return [];

        const categoryId = categorySnapshot.docs[0].id;
        const articlesQuery = query(
          collection(db, 'articles'),
          where('category_id', '==', categoryId),
          orderBy('published_at', 'desc'),
          firestoreLimit(limit * 2)
        );
        const snapshot = await getDocs(articlesQuery);
        const now = new Date();
        return filterAndConvertArticlesByCategory(snapshot.docs, limit, now);
      } catch (error: any) {
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Articles by category: Collection not found or permission denied');
          return [];
        }
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          if (import.meta.env.DEV) {
            console.warn('Articles by category: orderBy failed, trying without orderBy:', error.message);
          }
          try {
            const categoriesQuery = query(
              collection(db, 'categories'),
              where('slug', '==', categorySlug),
              firestoreLimit(1)
            );
            const categorySnapshot = await getDocs(categoriesQuery);
            if (categorySnapshot.empty) return [];
            const categoryId = categorySnapshot.docs[0].id;
            const articlesQuery = query(
              collection(db, 'articles'),
              where('category_id', '==', categoryId)
            );
            const snapshot = await getDocs(articlesQuery);
            const now = new Date();
            return filterAndConvertArticlesByCategory(snapshot.docs, limit, now);
          } catch (fallbackError: any) {
            console.error('Articles by category: Fallback query also failed:', fallbackError);
            return [];
          }
        }
        console.error('Articles by category: Unexpected error:', error);
        return [];
      }
    },
    enabled: options?.enabled !== false && !!categorySlug,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};

// Normalize slug from URL: decode and trim (handles encoding and extra spaces)
const normalizeSlug = (slug: string): string => {
  try {
    return decodeURIComponent(slug || '').trim();
  } catch {
    return (slug || '').trim();
  }
};

export const usePublicArticleBySlug = (slug: string, options?: { id?: string | null }) => {
  const normalizedSlug = normalizeSlug(slug || '');
  const idParam = options?.id?.trim() || '';

  return useQuery({
    queryKey: ['public-article', normalizedSlug, idParam],
    queryFn: async () => {
      if (!db) return null;
      // Need either slug or id to look up
      if (!normalizedSlug && !idParam) return null;

      let docSnapshot: DocumentSnapshot | null = null;

      if (normalizedSlug) {
        let articlesQuery = query(
          collection(db, 'articles'),
          where('slug', '==', normalizedSlug),
          firestoreLimit(1)
        );
        let snapshot = await getDocs(articlesQuery);

        if (snapshot.empty && normalizedSlug !== normalizedSlug.toLowerCase()) {
          articlesQuery = query(
            collection(db, 'articles'),
            where('slug', '==', normalizedSlug.toLowerCase()),
            firestoreLimit(1)
          );
          snapshot = await getDocs(articlesQuery);
        }

        if (!snapshot.empty) docSnapshot = snapshot.docs[0];
        if (!docSnapshot && looksLikeDocId(normalizedSlug)) {
          const byId = await getDoc(doc(db, 'articles', normalizedSlug));
          if (byId.exists()) docSnapshot = byId;
        }
      }

      // Fallback: load by document ID (from ?id= in URL or when slug failed)
      if (!docSnapshot && idParam) {
        const byId = await getDoc(doc(db, 'articles', idParam));
        if (byId.exists()) docSnapshot = byId;
      }

      if (!docSnapshot) return null;

      const data = docSnapshot.data();
      const status = (data.status || '').toString().toLowerCase();
      const isPublished = status === 'published';
      const scheduledAt = data.scheduled_at;
      const isScheduledAndDue =
        status === 'scheduled' &&
        scheduledAt &&
        new Date(scheduledAt?.toDate ? scheduledAt.toDate() : scheduledAt) <= new Date();

      if (!isPublished && !isScheduledAndDue) return null;

      return await convertToPublicArticle(docSnapshot);
    },
    enabled: !!normalizedSlug || !!idParam,
  });
};
