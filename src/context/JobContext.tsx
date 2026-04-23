import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Job, JobStatus } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { collection, doc, query, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, where, Query, DocumentData } from 'firebase/firestore';

interface JobContextType {
  jobs: Job[];
  savedJobIds: string[];
  addJob: (job: Omit<Job, 'id' | 'status' | 'createdAt' | 'employerId'>) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  editJob: (id: string, updatedData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  toggleSavedJob: (id: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      const q = query(collection(db, 'jobs'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedJobs: Job[] = [];
        snapshot.docs.forEach(docSnap => {
          fetchedJobs.push({ id: docSnap.id, ...docSnap.data(), createdAt: docSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString() } as Job);
        });
        setJobs(fetchedJobs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }, console.error);
      return () => unsubscribe();
    } else if (profile?.role === 'employer' && user) {
      // Avoid OR query index issues by using two separate queries
      const q1 = query(collection(db, 'jobs'), where('status', '==', 'Approved'));
      const q2 = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
      
      let approvedJobs: Job[] = [];
      let employerJobs: Job[] = [];
      
      const updateJobs = () => {
        const combined = [...approvedJobs, ...employerJobs];
        const uniqueItems = new Map();
        for (const item of combined) {
          uniqueItems.set(item.id, item);
        }
        const unique = Array.from(uniqueItems.values());
        setJobs(unique.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      };

      const unsub1 = onSnapshot(q1, (snapshot) => {
        approvedJobs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), createdAt: docSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString() } as Job));
        updateJobs();
      }, console.error);

      const unsub2 = onSnapshot(q2, (snapshot) => {
        employerJobs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), createdAt: docSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString() } as Job));
        updateJobs();
      }, console.error);

      return () => { unsub1(); unsub2(); };
    } else {
      const q = query(collection(db, 'jobs'), where('status', '==', 'Approved'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedJobs: Job[] = [];
        snapshot.docs.forEach(docSnap => {
          fetchedJobs.push({ id: docSnap.id, ...docSnap.data(), createdAt: docSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString() } as Job);
        });
        setJobs(fetchedJobs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }, console.error);
      return () => unsubscribe();
    }
  }, [user, profile]);

  useEffect(() => {
    if (!user) {
      setSavedJobIds([]);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, `users/${user.uid}/savedJobs`), (snapshot) => {
      const ids: string[] = [];
      snapshot.docs.forEach(docSnap => {
        ids.push(docSnap.data().jobId);
      });
      setSavedJobIds(ids);
    });
    return () => unsubscribe();
  }, [user]);

  const addJob = async (jobData: Omit<Job, 'id' | 'status' | 'employerId' | 'createdAt'>) => {
    if (!user) return;
    const newDocId = doc(collection(db, 'jobs')).id;
    await setDoc(doc(db, 'jobs', newDocId), {
      ...jobData,
      status: 'Pending',
      employerId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const updateJobStatus = async (id: string, status: JobStatus) => {
    if (!user) return;
    await updateDoc(doc(db, 'jobs', id), { status });
  };

  const editJob = async (id: string, updatedData: Partial<Job>) => {
    if (!user) return;
    const cleanData = { ...updatedData };
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.employerId;
    await updateDoc(doc(db, 'jobs', id), cleanData);
  };

  const deleteJob = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'jobs', id));
  };

  const toggleSavedJob = async (id: string) => {
    if (!user) return; 
    const savedRef = doc(db, `users/${user.uid}/savedJobs`, id);
    if (savedJobIds.includes(id)) {
      await deleteDoc(savedRef);
    } else {
      await setDoc(savedRef, {
        jobId: id,
        savedAt: serverTimestamp()
      });
    }
  };

  return (
    <JobContext.Provider value={{ jobs, savedJobIds, addJob, updateJobStatus, editJob, deleteJob, toggleSavedJob }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}
