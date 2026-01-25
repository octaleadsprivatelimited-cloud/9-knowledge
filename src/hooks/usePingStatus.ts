import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, orderBy, limit as firestoreLimit, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

interface PingRecord {
  id: string;
  pinged_at: string;
  status: string;
  response_time_ms: number | null;
  error_message: string | null;
}

export const useLastPing = () => {
  return useQuery({
    queryKey: ['last-ping'],
    queryFn: async () => {
      const pingsQuery = query(
        collection(db, 'firebase_pings'),
        orderBy('pinged_at', 'desc'),
        firestoreLimit(1)
      );

      const snapshot = await getDocs(pingsQuery);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        pinged_at: data.pinged_at?.toDate?.()?.toISOString() || data.pinged_at,
        status: data.status,
        response_time_ms: data.response_time_ms,
        error_message: data.error_message,
      } as PingRecord;
    },
  });
};

export const usePingHistory = (limit = 10) => {
  return useQuery({
    queryKey: ['ping-history', limit],
    queryFn: async () => {
      const pingsQuery = query(
        collection(db, 'firebase_pings'),
        orderBy('pinged_at', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(pingsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          pinged_at: data.pinged_at?.toDate?.()?.toISOString() || data.pinged_at,
          status: data.status,
          response_time_ms: data.response_time_ms,
          error_message: data.error_message,
        } as PingRecord;
      });
    },
  });
};

export const useManualPing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const startTime = Date.now();
      
      try {
        // Simple ping test - try to read from Firestore
        await getDocs(query(collection(db, 'articles'), firestoreLimit(1)));
        const responseTime = Date.now() - startTime;
        
        // Record ping
        await addDoc(collection(db, 'firebase_pings'), {
          pinged_at: Timestamp.now(),
          status: 'success',
          response_time_ms: responseTime,
          error_message: null,
        });
        
        return { status: 'success', response_time_ms: responseTime };
      } catch (error: any) {
        // Record failed ping
        await addDoc(collection(db, 'firebase_pings'), {
          pinged_at: Timestamp.now(),
          status: 'error',
          response_time_ms: null,
          error_message: error.message || 'Unknown error',
        });
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['last-ping'] });
      queryClient.invalidateQueries({ queryKey: ['ping-history'] });
    },
  });
};
