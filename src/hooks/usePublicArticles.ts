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
  Timestamp
} from 'firebase/firestore';
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
    category: category ? {
      id: category.id,
      name: category.name,
      slug: category.slug,
      color: category.color || null,
    } : null,
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
          console.warn('Published articles: orderBy failed, trying without orderBy:', error.message);
          
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
          console.warn('Featured articles: orderBy failed, trying without orderBy:', error.message);
          
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
          console.warn('Trending articles: orderBy failed, trying without orderBy:', error.message);
          
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

export const useLatestArticles = (limit: number = 9) => {
  return useQuery({
    queryKey: ['latest-articles', limit],
    queryFn: async () => {
      if (!db) {
        throw new Error('Firebase is not configured');
      }

      try {
        // Try query with orderBy first
        const articlesQuery = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('published_at', 'desc'),
          firestoreLimit(limit)
        );

        const snapshot = await getDocs(articlesQuery);
        const articles: PublicArticle[] = [];

        for (const docSnapshot of snapshot.docs) {
          articles.push(await convertToPublicArticle(docSnapshot));
        }

        if (import.meta.env.DEV) {
          console.log('Latest articles loaded:', articles.length);
        }

        return articles;
      } catch (error: any) {
        // If collection doesn't exist or permission denied, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Latest articles: Collection not found or permission denied');
          return [];
        }
        // If orderBy fails (likely missing index), try without orderBy
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('Latest articles: orderBy failed, trying without orderBy:', error.message);
          
          const articlesQuery = query(
            collection(db, 'articles'),
            where('status', '==', 'published'),
            firestoreLimit(limit * 2) // Get more to sort manually
          );

          const snapshot = await getDocs(articlesQuery);
          const articles: PublicArticle[] = [];

          for (const docSnapshot of snapshot.docs) {
            articles.push(await convertToPublicArticle(docSnapshot));
          }

          // Sort manually by published_at and limit
          articles.sort((a, b) => {
            if (!a.published_at || !b.published_at) return 0;
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          });

          return articles.slice(0, limit);
        }
        // If collection doesn't exist or permission denied, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Latest articles: Collection not found or permission denied');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
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
        // First get the category
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('slug', '==', categorySlug),
          firestoreLimit(1)
        );

        const categorySnapshot = await getDocs(categoriesQuery);
        if (categorySnapshot.empty) return [];

        const categoryId = categorySnapshot.docs[0].id;

        // Get articles for this category - include both published and scheduled articles
        const articlesQuery = query(
          collection(db, 'articles'),
          where('category_id', '==', categoryId),
          orderBy('published_at', 'desc'),
          firestoreLimit(limit * 2) // Get more to filter client-side
        );

        const snapshot = await getDocs(articlesQuery);
        const articles: PublicArticle[] = [];
        const now = new Date();

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          
          // Include published articles OR scheduled articles that should be published
          const isPublished = data.status === 'published';
          const isScheduledAndReady = data.status === 'scheduled' && 
            data.scheduled_at && 
            new Date(data.scheduled_at.toDate ? data.scheduled_at.toDate() : data.scheduled_at) <= now;

          if (isPublished || isScheduledAndReady) {
            articles.push(await convertToPublicArticle(docSnapshot));
          }
        }

        // Sort by published_at (or use created_at as fallback) and limit
        articles.sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        });

        return articles.slice(0, limit);
      } catch (error: any) {
        // If collection doesn't exist or permission denied, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found') || error?.code === 'permission-denied') {
          console.warn('Articles by category: Collection not found or permission denied');
          return [];
        }
        // If orderBy fails, try without orderBy
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('Articles by category: orderBy failed, trying without orderBy:', error.message);
          
          try {
            // First get the category
            const categoriesQuery = query(
              collection(db, 'categories'),
              where('slug', '==', categorySlug),
              firestoreLimit(1)
            );

            const categorySnapshot = await getDocs(categoriesQuery);
            if (categorySnapshot.empty) return [];

            const categoryId = categorySnapshot.docs[0].id;

            // Get articles for this category without orderBy
            const articlesQuery = query(
              collection(db, 'articles'),
              where('category_id', '==', categoryId)
            );

            const snapshot = await getDocs(articlesQuery);
            const articles: PublicArticle[] = [];
            const now = new Date();

            for (const docSnapshot of snapshot.docs) {
              const data = docSnapshot.data();
              
              // Include published articles OR scheduled articles that should be published
              const isPublished = data.status === 'published';
              const isScheduledAndReady = data.status === 'scheduled' && 
                data.scheduled_at && 
                new Date(data.scheduled_at.toDate ? data.scheduled_at.toDate() : data.scheduled_at) <= now;

              if (isPublished || isScheduledAndReady) {
                articles.push(await convertToPublicArticle(docSnapshot));
              }
            }

            // Sort manually by published_at (or use created_at as fallback)
            articles.sort((a, b) => {
              const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
              const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
              return dateB - dateA;
            });

            return articles.slice(0, limit);
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const usePublicArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['public-article', slug],
    queryFn: async () => {
      const articlesQuery = query(
        collection(db, 'articles'),
        where('slug', '==', slug),
        where('status', '==', 'published'),
        firestoreLimit(1)
      );

      const snapshot = await getDocs(articlesQuery);
      
      if (snapshot.empty) {
        return null;
      }

      return await convertToPublicArticle(snapshot.docs[0]);
    },
    enabled: !!slug,
  });
};
