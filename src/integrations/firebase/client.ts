// Re-export Firebase services for convenience
// Note: These may be null if Firebase is not configured
export { auth, db, storage, analytics } from './config';
export { default as firebaseApp } from './config';

// Export Firebase types
export type { User } from 'firebase/auth';
export type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
