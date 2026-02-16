import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export interface SiteSettings {
  social_media?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  site_info?: {
    name?: string;
    description?: string;
    url?: string;
    contact_email?: string;
  };
}

const SETTINGS_DOC_ID = 'site_settings';

export const useSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      if (!db) {
        console.warn('Firebase not configured');
        return null;
      }

      try {
        const settingsDoc = await getDoc(doc(db, 'settings', SETTINGS_DOC_ID));
        
        if (settingsDoc.exists()) {
          return settingsDoc.data() as SiteSettings;
        }
        
        return null;
      } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!db) {
        throw new Error('Firebase not configured');
      }

      await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), settings, { merge: true });
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};
