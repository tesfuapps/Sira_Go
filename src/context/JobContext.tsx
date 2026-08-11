import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Job, JobStatus } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { collection, doc, query, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, where, Query, DocumentData } from 'firebase/firestore';

interface JobContextType {
  jobs: Job[];
  savedJobIds: string[];
  jobsLoading: boolean;
  jobsError: string | null;
  addJob: (job: Omit<Job, 'id' | 'status' | 'createdAt' | 'employerId'>) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  editJob: (id: string, updatedData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  toggleSavedJob: (id: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const getCreatedAtIso = (createdAt: any) => {
    if (createdAt && typeof createdAt.toDate === 'function') {
      try {
        return createdAt.toDate().toISOString();
      } catch (e) {
        return new Date().toISOString();
      }
    }
    if (typeof createdAt === 'string') return createdAt;
    return new Date().toISOString();
  };

  useEffect(() => {
    if (authLoading) {
      setJobsLoading(true);
      return;
    }
    setJobsLoading(true);
    setJobsError(null);

    if (profile?.role === 'admin') {
      const q = query(collection(db, 'jobs'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedJobs: Job[] = [];
        snapshot.docs.forEach(docSnap => {
          fetchedJobs.push({ id: docSnap.id, ...docSnap.data(), createdAt: getCreatedAtIso(docSnap.data().createdAt) } as Job);
        });
        setJobs(fetchedJobs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setJobsLoading(false);
      }, (err) => { console.error(err); setJobsError(err.message); setJobsLoading(false); });
      return () => unsubscribe();
    } else if (profile?.role === 'employer' && user) {
      const q1 = query(collection(db, 'jobs'), where('status', '==', 'Approved'));
      const q2 = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
      
      let firstLoad1 = true;
      let firstLoad2 = true;
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
        if (firstLoad1 && firstLoad2) {
          setJobsLoading(false);
          setJobsError(null);
        }
      };

      const unsub1 = onSnapshot(q1, (snapshot) => {
        approvedJobs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), createdAt: getCreatedAtIso(docSnap.data().createdAt) } as Job));
        firstLoad1 = false;
        updateJobs();
      }, (err) => { console.error(err); setJobsError(err.message); setJobsLoading(false); });

      const unsub2 = onSnapshot(q2, (snapshot) => {
        employerJobs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), createdAt: getCreatedAtIso(docSnap.data().createdAt) } as Job));
        firstLoad2 = false;
        updateJobs();
      }, (err) => { console.error(err); setJobsError(err.message); setJobsLoading(false); });

      return () => { unsub1(); unsub2(); };
    } else {
      const q = query(collection(db, 'jobs'), where('status', '==', 'Approved'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedJobs: Job[] = [];
        snapshot.docs.forEach(docSnap => {
          fetchedJobs.push({ id: docSnap.id, ...docSnap.data(), createdAt: getCreatedAtIso(docSnap.data().createdAt) } as Job);
        });
        setJobs(fetchedJobs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setJobsLoading(false);
      }, (err) => { console.error(err); setJobsError(err.message); setJobsLoading(false); });
      return () => unsubscribe();
    }
  }, [user, profile, authLoading]);

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
    <JobContext.Provider value={{ jobs, savedJobIds, jobsLoading, jobsError, addJob, updateJobStatus, editJob, deleteJob, toggleSavedJob }}>
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
