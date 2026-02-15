import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

const SETTINGS_DOC_ID = 'category_display';

export interface CategoryDisplaySettings {
  /** Category IDs in the order they should appear in header and homepage */
  order: string[];
}

const defaultOrder: string[] = [];

export function useCategoryDisplayOrder() {
  return useQuery({
    queryKey: ['settings', SETTINGS_DOC_ID],
    queryFn: async (): Promise<string[]> => {
      if (!db) return defaultOrder;
      const ref = doc(db, 'settings', SETTINGS_DOC_ID);
      const snap = await getDoc(ref);
      if (!snap.exists()) return defaultOrder;
      const data = snap.data();
      const order = data?.order;
      return Array.isArray(order) ? order : defaultOrder;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCategoryDisplayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: string[]) => {
      if (!db) throw new Error('Firebase not configured');
      const ref = doc(db, 'settings', SETTINGS_DOC_ID);
      await setDoc(ref, { order, updated_at: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', SETTINGS_DOC_ID] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
