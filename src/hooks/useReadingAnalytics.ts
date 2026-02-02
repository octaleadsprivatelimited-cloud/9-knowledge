import { useEffect, useRef, useCallback } from 'react';
import { collection, addDoc, doc, updateDoc, Timestamp, increment } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('reading_session_id');
  if (stored) return stored;
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('reading_session_id', id);
  return id;
};

export const useReadingAnalytics = (articleId: string | undefined) => {
  const startTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const hasTracked = useRef<boolean>(false);
  const sessionId = useRef<string>(generateSessionId());

  const trackScrollDepth = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercent);
  }, []);

  const saveAnalytics = useCallback(async () => {
    if (!articleId || hasTracked.current) return;
    
    const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
    const completedReading = maxScrollDepth.current >= 90;
    
    // Only track if user spent at least 5 seconds
    if (timeOnPage < 5) return;
    
    hasTracked.current = true;

    try {
      await addDoc(collection(db, 'reading_analytics'), {
        article_id: articleId,
        session_id: sessionId.current,
        scroll_depth: maxScrollDepth.current,
        time_on_page: timeOnPage,
        completed_reading: completedReading,
        created_at: Timestamp.now(),
      });
      // Increment article view_count so admin panel shows updated views
      await updateDoc(doc(db, 'articles', articleId), {
        view_count: increment(1),
      });
    } catch (error) {
      console.error('Error tracking reading analytics:', error);
    }
  }, [articleId]);

  useEffect(() => {
    if (!articleId) return;

    // Reset tracking for new article
    startTime.current = Date.now();
    maxScrollDepth.current = 0;
    hasTracked.current = false;

    // Track scroll depth
    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Save analytics when user leaves
    const handleBeforeUnload = () => saveAnalytics();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveAnalytics();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      saveAnalytics();
    };
  }, [articleId, trackScrollDepth, saveAnalytics]);
};
