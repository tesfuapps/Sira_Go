import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Job, JobStatus, TalentPortfolio } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { collection, doc, query, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp, where, increment } from 'firebase/firestore';

interface JobContextType {
  jobs: Job[];
  savedJobIds: string[];
  jobsLoading: boolean;
  jobsError: string | null;
  talents: TalentPortfolio[];
  addJob: (job: Omit<Job, 'id' | 'status' | 'createdAt' | 'employerId'>) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus, extra?: Partial<Job>) => Promise<void>;
  markJobBroadcasted: (id: string, messageId?: number) => Promise<void>;
  editJob: (id: string, updatedData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  toggleSavedJob: (id: string) => Promise<void>;
  incrementViewCount: (id: string) => Promise<void>;
  incrementApplyClickCount: (id: string) => Promise<void>;
  addTalent: (talent: Omit<TalentPortfolio, 'id' | 'createdAt' | 'status' | 'userId'> & { status?: TalentPortfolio['status']; userId?: string }) => Promise<void>;
  endorseTalentSkill: (talentId: string, skill: string) => Promise<void>;
  addTalentReview: (talentId: string, review: { reviewerName: string; reviewerRole?: string; rating: number; comment: string }) => Promise<void>;
  toggleTalentBadge: (talentId: string, badge: string) => Promise<void>;
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
    applyMethod: { type: 'telegram', value: '@techcorp_hr' },
    viewCount: 142,
    applyClickCount: 28
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
    applyMethod: { type: 'link', value: 'https://cloudserve.et/apply' },
    viewCount: 215,
    applyClickCount: 41
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
    applyMethod: { type: 'phone', value: '+251911223344' },
    viewCount: 98,
    applyClickCount: 14
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
    applyMethod: { type: 'telegram', value: '@creative_hr' },
    viewCount: 176,
    applyClickCount: 35
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
    applyMethod: { type: 'link', value: 'https://datasys.et/jobs' },
    viewCount: 120,
    applyClickCount: 19
  }
];

export const INITIAL_DEMO_TALENTS: TalentPortfolio[] = [
  {
    id: 'talent-1',
    userId: 'user-t1',
    fullName: 'Selamawit Tadesse',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    title: 'Senior Graphic & Print Specialist',
    category: 'Graphic Design',
    location: 'Addis Ababa',
    availability: 'Both',
    rateInfo: 'From 4,500 ETB / project',
    bio: 'With 6+ years designing for top Ethiopian FMCG brands, cultural exhibitions, and corporate publications. Specialist in typography, print production, and high-impact poster artwork.',
    skills: ['Adobe Illustrator', 'InDesign', 'Photoshop', 'Print Production', 'Typography', 'Visual Identity'],
    projects: [
      {
        title: 'Habesha Coffee Cultural Exhibition Poster',
        imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://behance.net/gallery/habesha-coffee'
      },
      {
        title: 'Addis Literary Magazine Book Layout',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://behance.net/gallery/addis-mag'
      },
      {
        title: 'Entoto Natural Honey Label & Print System',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://behance.net/gallery/entoto-honey'
      }
    ],
    telegramUsername: 'selam_design',
    phone: '+251911445566',
    externalPortfolioUrl: 'https://behance.net/selamtadesse',
    isFeatured: true,
    status: 'Approved',
    rating: 4.9,
    reviewCount: 18,
    badges: ['Verified Pro', 'Top Rated', 'Fast Responder'],
    skillEndorsements: {
      'Adobe Illustrator': 24,
      'InDesign': 19,
      'Photoshop': 16,
      'Print Production': 22,
      'Typography': 15,
      'Visual Identity': 20
    },
    reviews: [
      {
        id: 'rev-101',
        reviewerName: 'Dawit Hailu',
        reviewerRole: 'Marketing Director, Habesha Brew',
        rating: 5,
        comment: 'Selamawit delivered stunning print packaging and billboard adaptations ahead of our festival launch. Outstanding typographic precision!',
        createdAt: '2026-10-15T10:00:00.000Z'
      },
      {
        id: 'rev-102',
        reviewerName: 'Hanna Mengistu',
        reviewerRole: 'Founder, Addis LitFest',
        rating: 5,
        comment: 'Our festival magazine layout received compliments from every international guest. Her pre-press print color proofing is flawless.',
        createdAt: '2026-10-02T14:30:00.000Z'
      },
      {
        id: 'rev-103',
        reviewerName: 'Ermias K.',
        reviewerRole: 'Creative Director, Entoto Organics',
        rating: 4.8,
        comment: 'Very professional, quick revisions on Telegram, and perfectly print-ready vector files for our packaging suppliers.',
        createdAt: '2026-09-20T09:15:00.000Z'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'talent-2',
    userId: 'user-t2',
    fullName: 'Dawit Bekele',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    title: 'Brand Identity & Packaging Designer',
    category: 'Print & Packaging',
    location: 'Addis Ababa',
    availability: 'Freelance',
    rateInfo: 'From 8,000 ETB / brand kit',
    bio: 'Award-winning brand strategist and packaging engineer. Helped 20+ Ethiopian export businesses craft international-grade packaging boxes, embossed labels, and cohesive brand systems.',
    skills: ['Packaging Design', 'Dieline Engineering', 'Brand Guidelines', 'Logo Design', 'Mockups', '3D Prototyping'],
    projects: [
      {
        title: 'Yirgacheffe Specialty Coffee Box & Tin',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://dribbble.com/shots/yirgacheffe'
      },
      {
        title: 'Zoma Botanical Cosmetics Glass Jar Packaging',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://dribbble.com/shots/zoma-cosmetics'
      },
      {
        title: 'Walia Spices Premium Tin Canister System',
        imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://dribbble.com/shots/walia-spices'
      }
    ],
    telegramUsername: 'dawit_brandcraft',
    phone: '+251912334455',
    externalPortfolioUrl: 'https://dribbble.com/dawitbekele',
    isFeatured: true,
    status: 'Approved',
    rating: 4.9,
    reviewCount: 22,
    badges: ['Verified Pro', 'Top Rated', 'Featured Spot'],
    skillEndorsements: {
      'Packaging Design': 31,
      'Dieline Engineering': 27,
      'Brand Guidelines': 25,
      'Logo Design': 29,
      'Mockups': 18,
      '3D Prototyping': 14
    },
    reviews: [
      {
        id: 'rev-201',
        reviewerName: 'Solomon Teshome',
        reviewerRole: 'CEO, Yirgacheffe Specialty Roasters',
        rating: 5,
        comment: 'Dawit transformed our coffee brand for export to European markets. The dieline engineering and gold foil stamp specifications saved us weeks.',
        createdAt: '2026-10-18T16:20:00.000Z'
      },
      {
        id: 'rev-202',
        reviewerName: 'Rahel Abebe',
        reviewerRole: 'Brand Manager, Zoma Naturals',
        rating: 5,
        comment: 'World-class packaging aesthetics. Our cosmetic jar sales surged 40% after rolling out Dawit’s new label architecture.',
        createdAt: '2026-09-28T11:45:00.000Z'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'talent-3',
    userId: 'user-t3',
    fullName: 'Natnael Getachew',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    title: 'Senior UI/UX & Full-Stack Web Developer',
    category: 'UI/UX Design',
    location: 'Addis Ababa (Bole)',
    availability: 'Full-Time',
    rateInfo: 'From 12,000 ETB / web project',
    bio: 'Crafting intuitive mobile and web platforms that scale. Skilled in end-to-end design thinking: user journey maps, wireframes in Figma, and production-ready React / Tailwind code.',
    skills: ['Figma', 'UI/UX Research', 'React.js', 'Tailwind CSS', 'Next.js', 'Design Systems', 'Prototyping'],
    projects: [
      {
        title: 'FinTech Mobile Banking Dashboard',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://github.com/natnael-dev/fintech-dashboard'
      },
      {
        title: 'AfroStream Music Streaming App Design',
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://github.com/natnael-dev/afrostream-ui'
      },
      {
        title: 'EthioMart E-Commerce Web Storefront',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://github.com/natnael-dev/ethiomart'
      }
    ],
    telegramUsername: 'natnael_ui',
    phone: '+251920889900',
    externalPortfolioUrl: 'https://github.com/natnael-dev',
    isFeatured: true,
    status: 'Approved',
    rating: 4.8,
    reviewCount: 15,
    badges: ['Verified Pro', 'Top Rated', 'Fast Responder'],
    skillEndorsements: {
      'Figma': 28,
      'UI/UX Research': 19,
      'React.js': 24,
      'Tailwind CSS': 22,
      'Next.js': 17,
      'Design Systems': 20,
      'Prototyping': 16
    },
    reviews: [
      {
        id: 'rev-301',
        reviewerName: 'Bisrat Kebede',
        reviewerRole: 'CTO, FinPay Solutions',
        rating: 5,
        comment: 'Natnael designed and implemented our mobile fintech app interface in record time. Clean component architecture and 60fps animations.',
        createdAt: '2026-10-12T13:00:00.000Z'
      },
      {
        id: 'rev-302',
        reviewerName: 'Sara Tilahun',
        reviewerRole: 'Product Lead, AfroStream Media',
        rating: 4.8,
        comment: 'Great eye for micro-interactions and dark-mode UX. He translates complex user flows into effortless screens.',
        createdAt: '2026-09-14T10:10:00.000Z'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'talent-4',
    userId: 'user-t4',
    fullName: 'Bethlehem Assefa',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: '3D Motion Designer & Video Editor',
    category: 'Video & Motion',
    location: 'Addis Ababa',
    availability: 'Both',
    rateInfo: 'From 6,000 ETB / reel',
    bio: 'Visual storyteller crafting kinetic motion graphics, commercial 3D product animations, and cinematic social ads for modern Ethiopian startups and music videos.',
    skills: ['After Effects', 'Cinema 4D', 'Blender', 'Premiere Pro', 'Kinetic Typography', 'Sound Design'],
    projects: [
      {
        title: 'Addis FinTech Kinetic 3D Logo Sting',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://vimeo.com/bethlehem/logo-sting'
      },
      {
        title: 'Commercial Product Showcase & Particle VFX',
        imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
        linkUrl: 'https://vimeo.com/bethlehem/product-vfx'
      },
      {
        title: 'Fashion Week Addis Title Sequence',
        imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
        linkUrl: 'https://vimeo.com/bethlehem/fashion-week'
      }
    ],
    telegramUsername: 'bethlehem_motion',
    phone: '+251913221100',
    externalPortfolioUrl: 'https://vimeo.com/bethlehem',
    isFeatured: true,
    status: 'Approved',
    rating: 5.0,
    reviewCount: 12,
    badges: ['Verified Pro', 'Top Rated', 'Fast Responder', 'Featured Spot'],
    skillEndorsements: {
      'After Effects': 26,
      'Cinema 4D': 20,
      'Blender': 22,
      'Premiere Pro': 18,
      'Kinetic Typography': 25,
      'Sound Design': 15
    },
    reviews: [
      {
        id: 'rev-401',
        reviewerName: 'Kaleb Worku',
        reviewerRole: 'Agency Producer, Addis Creatives',
        rating: 5,
        comment: 'The 3D logo sting and particle effects Bethlehem produced gave our client campaign an ultra-premium feel. She communicates rapidly on Telegram.',
        createdAt: '2026-10-21T15:00:00.000Z'
      },
      {
        id: 'rev-402',
        reviewerName: 'Senait D.',
        reviewerRole: 'Event Director, Addis Fashion Week',
        rating: 5,
        comment: 'Mind-blowing kinetic typography and rhythm synchronization. She understands tempo and luxury aesthetics like no one else.',
        createdAt: '2026-10-05T08:30:00.000Z'
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export function JobProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [talents, setTalents] = useState<TalentPortfolio[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const isDemoMode = !!localStorage.getItem('sira_go_demo_user');

  // Handle LocalStorage Demo Mode Talents
  useEffect(() => {
    const storedTalents = localStorage.getItem('sira_go_demo_talents');
    if (storedTalents) {
      try {
        const parsed = JSON.parse(storedTalents);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].rating !== undefined && parsed[0].badges && parsed[0].skillEndorsements) {
          setTalents(parsed);
        } else {
          setTalents(INITIAL_DEMO_TALENTS);
          localStorage.setItem('sira_go_demo_talents', JSON.stringify(INITIAL_DEMO_TALENTS));
        }
      } catch (e) {
        setTalents(INITIAL_DEMO_TALENTS);
        localStorage.setItem('sira_go_demo_talents', JSON.stringify(INITIAL_DEMO_TALENTS));
      }
    } else {
      setTalents(INITIAL_DEMO_TALENTS);
      localStorage.setItem('sira_go_demo_talents', JSON.stringify(INITIAL_DEMO_TALENTS));
    }
  }, []);

  // Handle LocalStorage Demo Mode Jobs
  useEffect(() => {
    if (isDemoMode) {
      const storedJobs = localStorage.getItem('sira_go_demo_jobs');
      if (storedJobs) {
        try {
          const parsed = JSON.parse(storedJobs);
          // ensure viewCount and applyClickCount are populated
          const seeded = parsed.map((j: Job, idx: number) => ({
            ...j,
            viewCount: j.viewCount ?? (100 + (idx * 27) % 150),
            applyClickCount: j.applyClickCount ?? (15 + (idx * 7) % 35)
          }));
          setJobs(seeded);
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
    if (isDemoMode) return;

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
          const data = docSnap.data();
          fetchedJobs.push({
            id: docSnap.id,
            ...data,
            viewCount: data.viewCount ?? 110,
            applyClickCount: data.applyClickCount ?? 22,
            createdAt: getCreatedAtIso(data.createdAt)
          } as Job);
        });
        setJobs(fetchedJobs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setJobsLoading(false);
      }, (err) => { 
        console.error(err); 
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
        approvedJobs = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            viewCount: data.viewCount ?? 115,
            applyClickCount: data.applyClickCount ?? 20,
            createdAt: getCreatedAtIso(data.createdAt)
          } as Job;
        });
        firstLoad1 = false;
        updateJobs();
      }, (err) => { 
        console.error(err); 
        setJobs(INITIAL_DEMO_JOBS);
        setJobsLoading(false); 
      });

      const unsub2 = onSnapshot(q2, (snapshot) => {
        employerJobs = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            viewCount: data.viewCount ?? 115,
            applyClickCount: data.applyClickCount ?? 20,
            createdAt: getCreatedAtIso(data.createdAt)
          } as Job;
        });
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
          const data = docSnap.data();
          fetchedJobs.push({
            id: docSnap.id,
            ...data,
            viewCount: data.viewCount ?? 115,
            applyClickCount: data.applyClickCount ?? 20,
            createdAt: getCreatedAtIso(data.createdAt)
          } as Job);
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
        viewCount: 0,
        applyClickCount: 0,
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
      viewCount: 0,
      applyClickCount: 0,
      createdAt: serverTimestamp()
    });
  };

  const incrementViewCount = async (id: string) => {
    setJobs(prev => {
      const updated = prev.map(j => j.id === id ? { ...j, viewCount: (j.viewCount || 0) + 1 } : j);
      if (isDemoMode) {
        localStorage.setItem('sira_go_demo_jobs', JSON.stringify(updated));
      }
      return updated;
    });

    if (!isDemoMode) {
      try {
        await updateDoc(doc(db, 'jobs', id), {
          viewCount: increment(1)
        });
      } catch (e) {
        // quiet error on firestore
      }
    }
  };

  const incrementApplyClickCount = async (id: string) => {
    setJobs(prev => {
      const updated = prev.map(j => j.id === id ? { ...j, applyClickCount: (j.applyClickCount || 0) + 1 } : j);
      if (isDemoMode) {
        localStorage.setItem('sira_go_demo_jobs', JSON.stringify(updated));
      }
      return updated;
    });

    if (!isDemoMode) {
      try {
        await updateDoc(doc(db, 'jobs', id), {
          applyClickCount: increment(1)
        });
      } catch (e) {
        // quiet error on firestore
      }
    }
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

  const addTalent = async (talentData: Omit<TalentPortfolio, 'id' | 'createdAt' | 'status' | 'userId'> & { status?: TalentPortfolio['status']; userId?: string }) => {
    const newTalent: TalentPortfolio = {
      status: talentData.status || 'Approved',
      userId: talentData.userId || user?.uid || 'user-demo-' + Date.now(),
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      badges: ['Verified Pro'],
      skillEndorsements: (talentData.skills || []).reduce((acc, s) => ({ ...acc, [s]: 1 }), {}),
      ...talentData,
      id: 'talent-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newTalent, ...talents];
    setTalents(updated);
    localStorage.setItem('sira_go_demo_talents', JSON.stringify(updated));
  };

  const endorseTalentSkill = async (talentId: string, skill: string) => {
    const endorsementKey = `sira_go_endorsed_${talentId}_${skill}`;
    if (localStorage.getItem(endorsementKey)) {
      return;
    }
    localStorage.setItem(endorsementKey, 'true');

    setTalents(prev => {
      const updated = prev.map(t => {
        if (t.id !== talentId) return t;
        const currentCount = t.skillEndorsements?.[skill] ?? 0;
        return {
          ...t,
          skillEndorsements: {
            ...(t.skillEndorsements || {}),
            [skill]: currentCount + 1
          }
        };
      });
      localStorage.setItem('sira_go_demo_talents', JSON.stringify(updated));
      return updated;
    });

    try {
      const talentRef = doc(db, 'talents', talentId);
      updateDoc(talentRef, {
        [`skillEndorsements.${skill}`]: ((talents.find(t => t.id === talentId)?.skillEndorsements?.[skill] ?? 0) + 1)
      }).catch(() => {});
    } catch (e) {}
  };

  const addTalentReview = async (talentId: string, review: { reviewerName: string; reviewerRole?: string; rating: number; comment: string }) => {
    const newReview = {
      id: 'rev-' + Date.now(),
      reviewerName: review.reviewerName.trim(),
      reviewerRole: review.reviewerRole?.trim() || 'Client',
      rating: review.rating,
      comment: review.comment.trim(),
      createdAt: new Date().toISOString()
    };

    setTalents(prev => {
      const updated = prev.map(t => {
        if (t.id !== talentId) return t;
        const currentReviews = t.reviews || [];
        const nextReviews = [newReview, ...currentReviews];
        const sumStars = nextReviews.reduce((acc, r) => acc + r.rating, 0);
        const newRating = Number((sumStars / nextReviews.length).toFixed(1));
        const newCount = nextReviews.length;

        let badges = [...(t.badges || [])];
        if (newRating >= 4.8 && newCount >= 3 && !badges.includes('Top Rated')) {
          badges.push('Top Rated');
        }

        return {
          ...t,
          rating: newRating,
          reviewCount: newCount,
          reviews: nextReviews,
          badges
        };
      });
      localStorage.setItem('sira_go_demo_talents', JSON.stringify(updated));
      return updated;
    });

    try {
      const talentRef = doc(db, 'talents', talentId);
      updateDoc(talentRef, {
        rating: 5,
        reviewCount: 1
      }).catch(() => {});
    } catch (e) {}
  };

  const toggleTalentBadge = async (talentId: string, badge: string) => {
    setTalents(prev => {
      const updated = prev.map(t => {
        if (t.id !== talentId) return t;
        const currentBadges = t.badges || [];
        const exists = currentBadges.includes(badge as any);
        const nextBadges = exists
          ? currentBadges.filter(b => b !== badge)
          : [...currentBadges, badge as any];
        return {
          ...t,
          badges: nextBadges
        };
      });
      localStorage.setItem('sira_go_demo_talents', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <JobContext.Provider value={{
      jobs,
      savedJobIds,
      jobsLoading,
      jobsError,
      talents,
      addJob,
      updateJobStatus,
      markJobBroadcasted,
      editJob,
      deleteJob,
      toggleSavedJob,
      incrementViewCount,
      incrementApplyClickCount,
      addTalent,
      endorseTalentSkill,
      addTalentReview,
      toggleTalentBadge
    }}>
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
