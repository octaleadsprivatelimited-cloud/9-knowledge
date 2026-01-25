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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoryInsert {
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
}

interface CategoryUpdate extends Partial<CategoryInsert> {
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

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!db) {
        throw new Error('Firebase is not configured');
      }

      try {
        // Try query with orderBy first
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('is_active', '==', true),
          orderBy('sort_order', 'asc')
        );

        const snapshot = await getDocs(categoriesQuery);
        const categories: Category[] = [];

        snapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          categories.push({
            id: docSnapshot.id,
            ...data,
            created_at: convertTimestamp(data.created_at),
            updated_at: convertTimestamp(data.updated_at),
          } as Category);
        });

        if (import.meta.env.DEV) {
          console.log('Categories loaded:', categories.length);
        }

        return categories;
      } catch (error: any) {
        // If orderBy fails, try without orderBy
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('Categories: orderBy failed, trying without orderBy:', error.message);
          
          const categoriesQuery = query(
            collection(db, 'categories'),
            where('is_active', '==', true)
          );

          const snapshot = await getDocs(categoriesQuery);
          const categories: Category[] = [];

          snapshot.docs.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            categories.push({
              id: docSnapshot.id,
              ...data,
              created_at: convertTimestamp(data.created_at),
              updated_at: convertTimestamp(data.updated_at),
            } as Category);
          });

          // Sort manually by sort_order
          categories.sort((a, b) => {
            const aOrder = a.sort_order || 0;
            const bOrder = b.sort_order || 0;
            return aOrder - bOrder;
          });

          return categories;
        }
        // If collection doesn't exist or is empty, return empty array
        if (error?.code === 'not-found' || error?.message?.includes('not found')) {
          console.warn('Categories collection not found or empty');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 10 * 60 * 1000, // Cache categories for 10 minutes (they change less frequently)
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const categoryDoc = await getDoc(doc(db, 'categories', id));
      
      if (!categoryDoc.exists()) {
        return null;
      }

      const data = categoryDoc.data();
      return {
        id: categoryDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
      } as Category;
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const categoryData = {
        ...category,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'categories'), categoryData);
      const newDoc = await getDoc(docRef);
      
      if (!newDoc.exists()) {
        throw new Error('Failed to create category');
      }

      const data = newDoc.data();
      return {
        id: newDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
      } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: CategoryUpdate) => {
      const categoryData = {
        ...category,
        updated_at: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'categories', id), categoryData);
      
      const updatedDoc = await getDoc(doc(db, 'categories', id));
      if (!updatedDoc.exists()) {
        throw new Error('Failed to update category');
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
      } as Category;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', data.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'categories', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
