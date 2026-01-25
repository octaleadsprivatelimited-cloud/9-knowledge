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

export type AdPosition = 'header' | 'sidebar' | 'in-article' | 'footer' | 'between-posts';

interface AdSlot {
  id: string;
  name: string;
  slot_id: string;
  position: string;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface AdSlotInsert {
  name: string;
  slot_id: string;
  position: string;
  is_active?: boolean;
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

export const useAdSlots = (position?: AdPosition) => {
  return useQuery({
    queryKey: ['ad-slots', position],
    queryFn: async () => {
      let adSlotsQuery = query(
        collection(db, 'ad_slots'),
        orderBy('created_at', 'desc')
      );

      if (position) {
        adSlotsQuery = query(
          collection(db, 'ad_slots'),
          where('position', '==', position),
          where('is_active', '==', true),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(adSlotsQuery);
      const adSlots: AdSlot[] = [];

      snapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        adSlots.push({
          id: docSnapshot.id,
          ...data,
          created_at: convertTimestamp(data.created_at),
          updated_at: convertTimestamp(data.updated_at),
        } as AdSlot);
      });

      return adSlots;
    },
  });
};

export const useActiveAdSlot = (position: AdPosition) => {
  return useQuery({
    queryKey: ['ad-slot', position],
    queryFn: async () => {
      const adSlotsQuery = query(
        collection(db, 'ad_slots'),
        where('position', '==', position),
        where('is_active', '==', true),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(adSlotsQuery);
      
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
      } as AdSlot;
    },
  });
};

export const useCreateAdSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adSlot: AdSlotInsert) => {
      const adSlotData = {
        ...adSlot,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'ad_slots'), adSlotData);
      const newDoc = await getDoc(docRef);
      
      if (!newDoc.exists()) {
        throw new Error('Failed to create ad slot');
      }

      const data = newDoc.data();
      return {
        id: newDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
      } as AdSlot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-slots'] });
      queryClient.invalidateQueries({ queryKey: ['ad-slot'] });
    },
  });
};

export const useUpdateAdSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...adSlot }: Partial<AdSlotInsert> & { id: string }) => {
      const adSlotData = {
        ...adSlot,
        updated_at: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'ad_slots', id), adSlotData);
      
      const updatedDoc = await getDoc(doc(db, 'ad_slots', id));
      if (!updatedDoc.exists()) {
        throw new Error('Failed to update ad slot');
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
      } as AdSlot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-slots'] });
      queryClient.invalidateQueries({ queryKey: ['ad-slot'] });
    },
  });
};

export const useDeleteAdSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'ad_slots', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-slots'] });
      queryClient.invalidateQueries({ queryKey: ['ad-slot'] });
    },
  });
};
