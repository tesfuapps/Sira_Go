import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Job, JobStatus } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { collection, doc, query, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp, where } from 'firebase/firestore';

interface JobContextType {
  jobs: Job[];
  savedJobIds: string[];
  jobsLoading: boolean;
  jobsError: string | null;
  addJob: (job: Omit<Job, 'id' | 'status' | 'createdAt' | 'employerId'>) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus, extra?: Partial<Job>) => Promise<void>;
  markJobBroadcasted: (id: string, messageId?: number) => Promise<void>;
  editJob: (id: string, updatedData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  toggleSavedJob: (id: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const INITIAL_DEMO_JOBS: Job[] = [
  {
    id: 'demo-1',
    title: 'Frontend Developer',
    company: 'TechCorp Ethiopia',
    category: 'Developers',
    location: 'Addis Ababa',
    salary: '45,000 ETB',
    deadline: new Date(Date.now() + 86400000 * 15).toISOString(),
    description: 'We are looking for a React / TypeScript developer to build high-performance web applications.',
    status: 'Approved',
    employerId: 'Comp1',
    createdAt: new Date().toISOString(),
    applyMethod: { type: 'telegram', value: '@techcorp_hr' }
  },
  {
    id: 'demo-2',
    title: 'Backend Engineer',
    company: 'CloudServe',
    category: 'Developers',
    location: 'Remote',
    salary: '60,000 ETB',
    deadline: new Date(Date.now() + 86400000 * 20).toISOString(),
    description: 'Node.js and PostgreSQL backend engineer needed for scaling our microservices.',
    status: 'Approved',
    employerId: 'Comp1',
    createdAt: new Date().toISOString(),
    applyMethod: { type: 'link', value: 'https://cloudserve.et/apply' }
  },
  {
    id: 'demo-3',
    title: 'Product Manager',
    company: 'Innovatech',
    category: 'Management',
    location: 'Addis Ababa',
    salary: '55,000 ETB',
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
    description: 'Lead product roadmap and coordinate between design and engineering teams.',
    status: 'Pending',
    employerId: 'Comp1',
    createdAt: new Date().toISOString(),
    applyMethod: { type: 'phone', value: '+251911223344' }
  },
  {
    id: 'demo-4',
    title: 'UX/UI Designer',
    company: 'CreativeStudio',
    category: 'Creatives',
    location: 'Addis Ababa',
    salary: '40,000 ETB',
    deadline: new Date(Date.now() + 86400000 * 25).toISOString(),
    description: 'Design beautiful, intuitive interfaces for mobile and web apps in Figma.',
    status: 'Approved',
    employerId: 'other-employer',
    createdAt: new Date().toISOString(),
    applyMethod: { type: 'telegram', value: '@creative_hr' }
  },
  {
    id: 'demo-5',
    title: 'Data Analyst',
    company: 'DataSys',
    category: 'Finance',
    location: 'Remote',
    salary: '50,000 ETB',
    deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
    description: 'Build automated reporting dashboards and analyze user engagement metrics.',
    status: 'Approved',
    employerId: 'other-employer',
    createdAt: new Date().toISOString(),
    applyMethod: { type: 'link', value: 'https://datasys.et/jobs' }
  }
];

export function JobProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const isDemoMode = !!localStorage.getItem('sira_go_demo_user');

  // Handle LocalStorage Demo Mode Jobs
  useEffect(() => {
    if (isDemoMode) {
      const storedJobs = localStorage.getItem('sira_go_demo_jobs');
      if (storedJobs) {
        try {
          setJobs(JSON.parse(storedJobs));
        } catch (e) {
          setJobs(INITIAL_DEMO_JOBS);
          localStorage.setItem('sira_go_demo_jobs', JSON.stringify(INITIAL_DEMO_JOBS));
        }
      } else {
        setJobs(INITIAL_DEMO_JOBS);
        localStorage.setItem('sira_go_demo_jobs', JSON.stringify(INITIAL_DEMO_JOBS));
      }

      const storedSaved = localStorage.getItem(`sira_go_saved_${user?.uid || 'user'}`);
      if (storedSaved) {
        try {
          setSavedJobIds(JSON.parse(storedSaved));
        } catch (e) {
          setSavedJobIds([]);
        }
      } else {
        setSavedJobIds([]);
      }

      setJobsLoading(false);
      setJobsError(null);
      return;
    }
  }, [user, isDemoMode]);

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
    if (isDemoMode) return; // handled by demo effect above

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
      }, (err) => { 
        console.error(err); 
        // Fallback to demo jobs if permission error occurs
        setJobs(INITIAL_DEMO_JOBS);
        setJobsLoading(false); 
      });
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
      }, (err) => { 
        console.error(err); 
        setJobs(INITIAL_DEMO_JOBS);
        setJobsLoading(false); 
      });

      const unsub2 = onSnapshot(q2, (snapshot) => {
        employerJobs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), createdAt: getCreatedAtIso(docSnap.data().createdAt) } as Job));
        firstLoad2 = false;
        updateJobs();
      }, (err) => { 
        console.error(err); 
        setJobs(INITIAL_DEMO_JOBS);
        setJobsLoading(false); 
      });

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
      }, (err) => { 
        console.error(err); 
        setJobs(INITIAL_DEMO_JOBS);
        setJobsLoading(false); 
      });
      return () => unsubscribe();
    }
  }, [user, profile, authLoading, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
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
    }, (err) => {
      console.error(err);
      setSavedJobIds([]);
    });
    return () => unsubscribe();
  }, [user, isDemoMode]);

  const addJob = async (jobData: Omit<Job, 'id' | 'status' | 'employerId' | 'createdAt'>) => {
    if (!user) throw new Error("You must be signed in to post a job.");

    if (isDemoMode) {
      const newJob: Job = {
        ...jobData,
        id: 'job-' + Date.now(),
        status: profile?.role === 'admin' ? 'Approved' : 'Pending',
        employerId: user.uid,
        createdAt: new Date().toISOString()
      };
      const updatedJobs = [newJob, ...jobs];
      setJobs(updatedJobs);
      localStorage.setItem('sira_go_demo_jobs', JSON.stringify(updatedJobs));
      return;
    }

    const newDocId = doc(collection(db, 'jobs')).id;
    await setDoc(doc(db, 'jobs', newDocId), {
      ...jobData,
      status: 'Pending',
      employerId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const updateJobStatus = async (id: string, status: JobStatus, extra?: Partial<Job>) => {
    if (!user) return;
    if (isDemoMode) {
      const updatedJobs = jobs.map(j => j.id === id ? { ...j, status, ...(extra || {}) } : j);
      setJobs(updatedJobs);
      localStorage.setItem('sira_go_demo_jobs', JSON.stringify(updatedJobs));
      return;
    }
    await updateDoc(doc(db, 'jobs', id), { status, ...(extra || {}) });
  };

  const markJobBroadcasted = async (id: string, messageId?: number) => {
    const timestamp = new Date().toISOString();
    if (isDemoMode) {
      const updatedJobs = jobs.map(j => j.id === id ? {
        ...j,
        telegramBroadcastedAt: timestamp,
        ...(messageId ? { telegramMessageId: messageId } : {})
      } : j);
      setJobs(updatedJobs);
      localStorage.setItem('sira_go_demo_jobs', JSON.stringify(updatedJobs));
      return;
    }
    try {
      await updateDoc(doc(db, 'jobs', id), {
        telegramBroadcastedAt: timestamp,
        ...(messageId ? { telegramMessageId: messageId } : {})
      });
    } catch (e) {
      console.error('Error marking job broadcasted:', e);
    }
  };

  const editJob = async (id: string, updatedData: Partial<Job>) => {
    if (!user) return;
    if (isDemoMode) {
      const updatedJobs = jobs.map(j => j.id === id ? { ...j, ...updatedData } : j);
      setJobs(updatedJobs);
      localStorage.setItem('sira_go_demo_jobs', JSON.stringify(updatedJobs));
      return;
    }
    const cleanData = { ...updatedData };
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.employerId;
    await updateDoc(doc(db, 'jobs', id), cleanData);
  };

  const deleteJob = async (id: string) => {
    if (!user) return;
    if (isDemoMode) {
      const updatedJobs = jobs.filter(j => j.id !== id);
      setJobs(updatedJobs);
      localStorage.setItem('sira_go_demo_jobs', JSON.stringify(updatedJobs));
      return;
    }
    await deleteDoc(doc(db, 'jobs', id));
  };

  const toggleSavedJob = async (id: string) => {
    if (!user) return; 
    if (isDemoMode) {
      let newSaved: string[];
      if (savedJobIds.includes(id)) {
        newSaved = savedJobIds.filter(item => item !== id);
      } else {
        newSaved = [...savedJobIds, id];
      }
      setSavedJobIds(newSaved);
      localStorage.setItem(`sira_go_saved_${user.uid}`, JSON.stringify(newSaved));
      return;
    }

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
    <JobContext.Provider value={{ jobs, savedJobIds, jobsLoading, jobsError, addJob, updateJobStatus, markJobBroadcasted, editJob, deleteJob, toggleSavedJob }}>
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
