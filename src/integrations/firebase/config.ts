/**
 * Firebase Configuration
 * 
 * Setup Instructions:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Go to Project Settings > General
 * 3. Scroll down to "Your apps" and add a web app
 * 4. Copy your Firebase config object
 * 5. Create a .env file in the root directory with:
 *    VITE_FIREBASE_API_KEY=your_api_key
 *    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
 *    VITE_FIREBASE_PROJECT_ID=your_project_id
 *    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
 *    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
 *    VITE_FIREBASE_APP_ID=your_app_id
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Validate environment variables in development
if (import.meta.env.DEV) {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn('⚠️ Missing Firebase environment variables:', missingVars.join(', '));
    console.warn('Please check your .env file and ensure all Firebase variables are set.');
    console.warn('The app will still load, but Firebase features will not work until configured.');
  } else {
    console.log('✅ Firebase environment variables loaded successfully');
  }
}

// Initialize Firebase safely
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

try {
  // Only initialize if we have required config values
  const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;
  
  if (hasConfig) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Initialize Analytics only in browser environment
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (analyticsError) {
        console.warn('Analytics initialization failed:', analyticsError);
      }
    }

    // Log success in development
    if (import.meta.env.DEV) {
      console.log('✅ Firebase initialized successfully');
      console.log('📍 Firebase Project ID:', firebaseConfig.projectId);
      if (analytics) {
        console.log('✅ Firebase Analytics initialized');
      }
    }
  } else {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Firebase not initialized - missing configuration. App will run but Firebase features will not work.');
    }
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  if (import.meta.env.DEV) {
    console.error('The app will continue to load, but Firebase features will not be available.');
  }
}

// Export Firebase services (may be null if not configured)
export { auth, db, storage, analytics };

export default app;
