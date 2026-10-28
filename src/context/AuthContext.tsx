import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db, logOut } from '../lib/firebase';

export interface UserProfile {
  email: string;
  role: 'admin' | 'employer' | 'seeker';
  createdAt: Timestamp | null | any;
  displayName?: string;
  phone?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  createUserProfile: (role: 'employer' | 'seeker') => Promise<void>;
  updateUserProfile: (data: { displayName?: string; phone?: string }) => Promise<void>;
  loginManual: (username: string, role: 'admin' | 'employer' | 'seeker') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for manual demo login first
    const demoUser = localStorage.getItem('sira_go_demo_user');
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        setUser({ uid: parsed.email, email: parsed.email });
        setProfile({
          email: parsed.email,
          role: parsed.role,
          displayName: parsed.displayName,
          phone: parsed.phone,
          createdAt: null
        });
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('sira_go_demo_user');
      }
    }

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
    localStorage.removeItem('sira_go_demo_user');
    setUser(null);
    setProfile(null);
    try {
      await logOut();
    } catch (e) {
      // ignore firebase sign out error if demo user
    }
  };

  const loginManual = (username: string, role: 'admin' | 'employer' | 'seeker') => {
    const demoData = { email: username, role };
    localStorage.setItem('sira_go_demo_user', JSON.stringify(demoData));
    setUser({ uid: username, email: username });
    setProfile({ email: username, role, createdAt: null });
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
      setProfile({ ...newUserProfile, createdAt: null } as UserProfile);
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
         setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error("Failed to create user profile", error);
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; phone?: string }) => {
    if (!user) return;
    const isDemoMode = !!localStorage.getItem('sira_go_demo_user');
    if (isDemoMode) {
      const stored = localStorage.getItem('sira_go_demo_user');
      const current = stored ? JSON.parse(stored) : {};
      const updated = {
        ...current,
        displayName: data.displayName || undefined,
        phone: data.phone || undefined,
      };
      localStorage.setItem('sira_go_demo_user', JSON.stringify(updated));
      setProfile(prev => prev ? { ...prev, displayName: data.displayName, phone: data.phone } : null);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      displayName: data.displayName || null,
      phone: data.phone || null,
    });
    setProfile(prev => prev ? { ...prev, displayName: data.displayName, phone: data.phone } : null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, createUserProfile, updateUserProfile, loginManual }}>
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
