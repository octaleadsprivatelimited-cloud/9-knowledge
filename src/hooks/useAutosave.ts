import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface AutosaveOptions {
  data: Record<string, any>;
  storageKey: string;
  debounceMs?: number;
  onRestore?: (data: Record<string, any>) => void;
}

export const useAutosave = ({ data, storageKey, debounceMs = 3000, onRestore }: AutosaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const hasRestoredRef = useRef<boolean>(false);

  // Save data to localStorage
  const save = useCallback(() => {
    const serialized = JSON.stringify(data);
    if (serialized !== lastSavedRef.current && serialized !== '{}') {
      localStorage.setItem(storageKey, serialized);
      localStorage.setItem(`${storageKey}_timestamp`, new Date().toISOString());
      lastSavedRef.current = serialized;
    }
  }, [data, storageKey]);

  // Debounced save
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, debounceMs]);

  // Restore from localStorage on mount
  const restore = useCallback(() => {
    if (hasRestoredRef.current) return null;
    
    const saved = localStorage.getItem(storageKey);
    const timestamp = localStorage.getItem(`${storageKey}_timestamp`);
    
    if (saved && timestamp) {
      const savedTime = new Date(timestamp);
      const now = new Date();
      const hoursSinceSave = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      
      // Only restore if saved within last 24 hours
      if (hoursSinceSave < 24) {
        hasRestoredRef.current = true;
        return JSON.parse(saved);
      }
    }
    return null;
  }, [storageKey]);

  // Check for saved draft and notify
  const checkForDraft = useCallback(() => {
    const saved = localStorage.getItem(storageKey);
    const timestamp = localStorage.getItem(`${storageKey}_timestamp`);
    
    if (saved && timestamp && onRestore) {
      const savedTime = new Date(timestamp);
      const now = new Date();
      const hoursSinceSave = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSave < 24) {
        toast('Draft found', {
          description: `Last saved ${savedTime.toLocaleTimeString()}`,
          action: {
            label: 'Restore',
            onClick: () => {
              const data = restore();
              if (data) onRestore(data);
            },
          },
          duration: 10000,
        });
      }
    }
  }, [storageKey, onRestore, restore]);

  // Clear saved draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_timestamp`);
    lastSavedRef.current = '';
  }, [storageKey]);

  // Save immediately (before navigation)
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save();
  }, [save]);

  return {
    restore,
    clearDraft,
    saveNow,
    checkForDraft,
  };
};
