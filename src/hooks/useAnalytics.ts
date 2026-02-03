import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Get all articles
      const articlesSnapshot = await getDocs(collection(db, 'articles'));
      const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalArticles = articles.length;
      const publishedArticles = articles.filter(a => a.status === 'published').length;
      const draftArticles = articles.filter(a => a.status === 'draft').length;
      const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);

      // Get category count
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoryCount = categoriesSnapshot.size;

      // Get subscriber count
      const subscribersQuery = query(
        collection(db, 'newsletter_subscribers'),
        where('is_active', '==', true)
      );
      const subscribersSnapshot = await getDocs(subscribersQuery);
      const subscriberCount = subscribersSnapshot.size;

      // Get recent articles
      const recentArticlesQuery = query(
        collection(db, 'articles'),
        orderBy('created_at', 'desc'),
        firestoreLimit(5)
      );
      const recentSnapshot = await getDocs(recentArticlesQuery);
      const recentArticles = [];

      for (const docSnapshot of recentSnapshot.docs) {
        const data = docSnapshot.data();
        let categoryName = null;
        
        if (data.category_id) {
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const categoryDoc = await getDoc(doc(db, 'categories', data.category_id));
            if (categoryDoc.exists()) {
              categoryName = categoryDoc.data().name;
            }
          } catch (error) {
            console.error('Error fetching category:', error);
          }
        }

        recentArticles.push({
          id: docSnapshot.id,
          title: data.title,
          slug: data.slug,
          status: data.status,
          view_count: data.view_count,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          category: categoryName ? { name: categoryName } : null,
        });
      }

      return {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        categoryCount,
        subscriberCount,
        recentArticles,
      };
    },
    refetchInterval: 15_000, // live view counts on dashboard
  });
};
