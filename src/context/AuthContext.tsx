import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, logOut } from '../lib/firebase';

export interface UserProfile {
  email: string;
  role: 'admin' | 'employer' | 'seeker';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  createUserProfile: (role: 'employer' | 'seeker') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await logOut();
  };

  const createUserProfile = async (role: 'employer' | 'seeker') => {
    if (!user || profile) return;
    try {
      const newUserProfile = {
        email: user.email || 'user',
        role,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), newUserProfile);
      setProfile(newUserProfile as unknown as UserProfile); // optimistic
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
         setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error("Failed to create user profile", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, createUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
