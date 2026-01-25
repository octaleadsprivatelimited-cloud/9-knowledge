import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/client';

type AppRole = 'super_admin' | 'editor' | 'author' | 'viewer';

interface AuthContextType {
  user: FirebaseUser | null;
  session: { user: FirebaseUser } | null; // Firebase doesn't have sessions, but we'll keep this for compatibility
  loading: boolean;
  role: AppRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<{ user: FirebaseUser } | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  const fetchUserRole = async (userId: string): Promise<AppRole | null> => {
    if (!db) return null;
    
    try {
      const userRoleDoc = await getDoc(doc(db, 'user_roles', userId));
      
      if (userRoleDoc.exists()) {
        const data = userRoleDoc.data();
        return data.role as AppRole;
      }

      // If no role exists, check if this is the first user (no users exist)
      // If so, automatically assign super_admin role
      try {
        const { collection, getDocs, setDoc, Timestamp } = await import('firebase/firestore');
        const allRolesSnapshot = await getDocs(collection(db, 'user_roles'));
        
        // If no users exist, make this user super_admin
        if (allRolesSnapshot.empty) {
          await setDoc(doc(db, 'user_roles', userId), {
            role: 'super_admin',
            created_at: Timestamp.now(),
            auto_assigned: true,
          });
          console.log('✅ First user automatically assigned super_admin role');
          return 'super_admin';
        }
      } catch (autoAssignError) {
        console.warn('Failed to auto-assign role:', autoAssignError);
      }

      // Check if user has custom claims (set via Firebase Admin SDK)
      // For now, we'll rely on Firestore user_roles collection
      return null;
    } catch (err) {
      console.error('Error fetching user role:', err);
      return null;
    }
  };

  useEffect(() => {
    // Only set up auth state listener if Firebase is initialized
    if (!auth) {
      setLoading(false);
      return;
    }

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setSession({ user: firebaseUser });
        
        // Fetch user role if db is available
        if (db) {
          const userRole = await fetchUserRole(firebaseUser.uid);
          setRole(userRole);
        }
      } else {
        setUser(null);
        setSession(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      return { error: new Error('Firebase is not configured. Please set up your Firebase credentials.') };
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Failed to sign in') };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!auth || !db) {
      return { error: new Error('Firebase is not configured. Please set up your Firebase credentials.') };
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (fullName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });
      }

      // Create user role document in Firestore (default to 'viewer')
      if (userCredential.user) {
        try {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'user_roles', userCredential.user.uid), {
            role: 'viewer',
            created_at: new Date().toISOString(),
          });
        } catch (roleError) {
          console.warn('Failed to create user role document:', roleError);
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Failed to sign up') };
    }
  };

  const signOut = async () => {
    if (!auth) return;
    
    try {
      await firebaseSignOut(auth);
      setRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = role === 'super_admin' || role === 'editor' || role === 'author';
  const isSuperAdmin = role === 'super_admin';
  const isEditor = role === 'editor' || role === 'super_admin';
  const isAuthor = role === 'author' || role === 'editor' || role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        isAdmin,
        isSuperAdmin,
        isEditor,
        isAuthor,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
