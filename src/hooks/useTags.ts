import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  deleteDoc,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import type { PublicArticle } from './usePublicArticles';

interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

interface TagInsert {
  name: string;
  slug: string;
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

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const tagsQuery = query(
        collection(db, 'tags'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(tagsQuery);
      const tags: Tag[] = [];

      snapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        tags.push({
          id: docSnapshot.id,
          ...data,
          created_at: convertTimestamp(data.created_at),
          updated_at: convertTimestamp(data.updated_at),
        } as Tag);
      });

      return tags;
    },
  });
};

export const useTagBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['tag', slug],
    queryFn: async () => {
      const tagsQuery = query(
        collection(db, 'tags'),
        where('slug', '==', slug),
        firestoreLimit(1)
      );

      const snapshot = await getDocs(tagsQuery);
      
      if (snapshot.empty) {
        return null;
      }

      const docSnapshot = snapshot.docs[0];
      const data = docSnapshot.data();
      
      return {
        id: docSnapshot.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
      } as Tag;
    },
    enabled: !!slug,
  });
};

export const useArticlesByTag = (tagSlug: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['articles-by-tag', tagSlug, limit],
    queryFn: async () => {
      // First get the tag
      const tagsQuery = query(
        collection(db, 'tags'),
        where('slug', '==', tagSlug),
        firestoreLimit(1)
      );

      const tagSnapshot = await getDocs(tagsQuery);
      if (tagSnapshot.empty) return [];

      const tagId = tagSnapshot.docs[0].id;

      // Get article IDs from article_tags subcollection or array field
      // Assuming articles have a tags array field, or we use a subcollection
      const articlesQuery = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        orderBy('published_at', 'desc'),
        firestoreLimit(limit)
      );

      const articlesSnapshot = await getDocs(articlesQuery);
      const articles: PublicArticle[] = [];

      for (const docSnapshot of articlesSnapshot.docs) {
        const data = docSnapshot.data();
        
        // Check if article has this tag (assuming tags array or tag_ids array)
        const articleTags = data.tag_ids || data.tags || [];
        if (!articleTags.includes(tagId)) continue;

        const category = await fetchCategory(data.category_id);

        articles.push({
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
        } as PublicArticle);
      }

      return articles;
    },
    enabled: !!tagSlug,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: TagInsert) => {
      const tagData = {
        ...tag,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'tags'), tagData);
      const newDoc = await getDoc(docRef);
      
      if (!newDoc.exists()) {
        throw new Error('Failed to create tag');
      }

      const data = newDoc.data();
      return {
        id: newDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
      } as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'tags', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
