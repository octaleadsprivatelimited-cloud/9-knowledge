import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'archived';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  video_url?: string | null;
  author_id?: string | null;
  category_id?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    [key: string]: any;
  } | null;
  status?: ArticleStatus | null;
  is_featured?: boolean | null;
  is_trending?: boolean | null;
  published_at?: string | null;
  scheduled_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  og_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

interface ArticleInsert {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  video_url?: string | null;
  author_id?: string | null;
  category_id?: string | null;
  status?: ArticleStatus | null;
  is_featured?: boolean | null;
  is_trending?: boolean | null;
  published_at?: string | null;
  scheduled_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  og_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean | null;
}

interface ArticleUpdate extends Partial<ArticleInsert> {
  id: string;
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
  if (!categoryId) return null;
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

export const useArticles = (status?: ArticleStatus) => {
  return useQuery({
    queryKey: ['articles', status],
    queryFn: async () => {
      let articlesQuery = query(
        collection(db, 'articles'),
        orderBy('created_at', 'desc')
      );

      if (status) {
        articlesQuery = query(
          collection(db, 'articles'),
          where('status', '==', status),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(articlesQuery);
      const articles: Article[] = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const category = await fetchCategory(data.category_id);
        
        articles.push({
          id: docSnapshot.id,
          ...data,
          created_at: convertTimestamp(data.created_at),
          updated_at: convertTimestamp(data.updated_at),
          published_at: convertTimestamp(data.published_at),
          scheduled_at: convertTimestamp(data.scheduled_at),
          category,
        } as Article);
      }

      return articles;
    },
  });
};

export const useArticle = (id: string) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const articleDoc = await getDoc(doc(db, 'articles', id));
      
      if (!articleDoc.exists()) {
        return null;
      }

      const data = articleDoc.data();
      const category = await fetchCategory(data.category_id);

      return {
        id: articleDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
        published_at: convertTimestamp(data.published_at),
        scheduled_at: convertTimestamp(data.scheduled_at),
        category,
      } as Article;
    },
    enabled: !!id,
  });
};

export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['article', 'slug', slug],
    queryFn: async () => {
      const articlesQuery = query(
        collection(db, 'articles'),
        where('slug', '==', slug),
        firestoreLimit(1)
      );

      const snapshot = await getDocs(articlesQuery);
      
      if (snapshot.empty) {
        return null;
      }

      const docSnapshot = snapshot.docs[0];
      const data = docSnapshot.data();
      const category = await fetchCategory(data.category_id);

      return {
        id: docSnapshot.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
        published_at: convertTimestamp(data.published_at),
        scheduled_at: convertTimestamp(data.scheduled_at),
        category,
      } as Article;
    },
    enabled: !!slug,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: Omit<ArticleInsert, 'id'>) => {
      const articleData = {
        ...article,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'articles'), articleData);
      const newDoc = await getDoc(docRef);
      
      if (!newDoc.exists()) {
        throw new Error('Failed to create article');
      }

      const data = newDoc.data();
      const category = await fetchCategory(data.category_id);

      return {
        id: newDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
        published_at: convertTimestamp(data.published_at),
        scheduled_at: convertTimestamp(data.scheduled_at),
        category,
      } as Article;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['published-articles'] });
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
      queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
      queryClient.invalidateQueries({ queryKey: ['latest-articles'] });
      // Invalidate public article queries
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: ['public-article', data.slug] });
      }
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...article }: ArticleUpdate) => {
      const articleData = {
        ...article,
        updated_at: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'articles', id), articleData);
      
      const updatedDoc = await getDoc(doc(db, 'articles', id));
      if (!updatedDoc.exists()) {
        throw new Error('Failed to update article');
      }

      const data = updatedDoc.data();
      const category = await fetchCategory(data.category_id);

      return {
        id: updatedDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
        published_at: convertTimestamp(data.published_at),
        scheduled_at: convertTimestamp(data.scheduled_at),
        category,
      } as Article;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', data.id] });
      queryClient.invalidateQueries({ queryKey: ['articles-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['published-articles'] });
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
      queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
      queryClient.invalidateQueries({ queryKey: ['latest-articles'] });
      // Invalidate public article queries
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: ['public-article', data.slug] });
      }
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'articles', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['published-articles'] });
      queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
      queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
      queryClient.invalidateQueries({ queryKey: ['latest-articles'] });
      queryClient.invalidateQueries({ queryKey: ['public-article'] });
    },
  });
};
