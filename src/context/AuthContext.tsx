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
  employerType?: 'company' | 'private';
  companyName?: string;
  companyIndustry?: string;
  companyLocation?: string;
  hasTradeLicense?: boolean;
  privateActivityDescription?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  createUserProfile: (role: 'employer' | 'seeker', extra?: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  loginManual: (username: string, role: 'admin' | 'employer' | 'seeker', extra?: Partial<UserProfile>) => void;
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
          employerType: parsed.employerType || (parsed.role === 'employer' ? 'company' : undefined),
          companyName: parsed.companyName || (parsed.email === 'Comp1' ? 'TechCorp Ethiopia' : undefined),
          companyIndustry: parsed.companyIndustry || (parsed.email === 'Comp1' ? 'Technology & Software' : undefined),
          companyLocation: parsed.companyLocation || (parsed.email === 'Comp1' ? 'Addis Ababa (Bole)' : undefined),
          hasTradeLicense: parsed.hasTradeLicense ?? (parsed.email === 'Comp1' ? true : undefined),
          privateActivityDescription: parsed.privateActivityDescription,
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

  const loginManual = (username: string, role: 'admin' | 'employer' | 'seeker', extra?: Partial<UserProfile>) => {
    const isComp1 = username.toLowerCase() === 'comp1';
    const demoData: Partial<UserProfile> & { email: string; role: 'admin' | 'employer' | 'seeker' } = {
      email: username,
      role,
      displayName: extra?.displayName || (isComp1 ? 'TechCorp Ethiopia HR' : username),
      phone: extra?.phone || (isComp1 ? '+251911223344' : undefined),
      employerType: extra?.employerType || (role === 'employer' ? 'company' : undefined),
      companyName: extra?.companyName || (isComp1 ? 'TechCorp Ethiopia' : (role === 'employer' ? username : undefined)),
      companyIndustry: extra?.companyIndustry || (isComp1 ? 'Technology & Software' : undefined),
      companyLocation: extra?.companyLocation || (isComp1 ? 'Addis Ababa (Bole)' : undefined),
      hasTradeLicense: extra?.hasTradeLicense ?? (isComp1 ? true : undefined),
      privateActivityDescription: extra?.privateActivityDescription
    };
    localStorage.setItem('sira_go_demo_user', JSON.stringify(demoData));
    setUser({ uid: username, email: username });
    setProfile({ ...demoData, createdAt: null } as UserProfile);
  };

  const createUserProfile = async (role: 'employer' | 'seeker', extra?: Partial<UserProfile>) => {
    if (!user || profile) return;
    try {
      const newUserProfile: any = {
        email: user.email || 'user',
        role,
        createdAt: serverTimestamp(),
        ...(extra || {})
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

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const isDemoMode = !!localStorage.getItem('sira_go_demo_user');
    if (isDemoMode) {
      const stored = localStorage.getItem('sira_go_demo_user');
      const current = stored ? JSON.parse(stored) : {};
      const updated = {
        ...current,
        ...data,
      };
      localStorage.setItem('sira_go_demo_user', JSON.stringify(updated));
      setProfile(prev => prev ? { ...prev, ...data } : null);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const updatePayload: Record<string, any> = {};
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) {
        updatePayload[key] = val;
      }
    });

    await updateDoc(userRef, updatePayload);
    setProfile(prev => prev ? { ...prev, ...data } : null);
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
