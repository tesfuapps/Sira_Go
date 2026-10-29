import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobCard } from '../components/JobCard';
import { TalentCard } from '../components/TalentCard';
import { AlertModal } from '../components/AlertModal';
import { Zap, Search, Bell, ChevronDown, AlertCircle, MapPin, Briefcase, Building, Users, TrendingUp, Code, Palette, Megaphone, DollarSign, Cpu, HeartPulse, ArrowRight, SlidersHorizontal, RotateCcw, Sparkles, Send } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';

import { JobCategory } from '../types';
import { isJobExpired, parseSalary } from '../lib/utils';

export function Home() {
  const { jobs, jobsLoading, jobsError, talents } = useJobs();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<'Any' | '24h' | 'Week' | 'Month'>('Any');
  const [salaryRange, setSalaryRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showExpired, setShowExpired] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const approvedJobs = jobs.filter(j => j.status === 'Approved');

  const filteredJobs = useMemo(() => {
    let result = approvedJobs;

    if (!showExpired) {
      result = result.filter(job => !isJobExpired(job.deadline));
    }

    if (categoryFilter !== 'All') {
      result = result.filter(job => job.category === categoryFilter);
    }

    if (locationQuery !== 'All') {
      if (locationQuery === 'Remote') {
        result = result.filter(job => job.location.toLowerCase().includes('remote'));
      } else {
        result = result.filter(job => job.location.toLowerCase().includes(locationQuery.toLowerCase()));
      }
    }

    if (dateFilter !== 'Any') {
      const now = new Date();
      result = result.filter(job => {
        const jobDate = new Date(job.createdAt);
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateFilter === '24h') return diffDays <= 1;
        if (dateFilter === 'Week') return diffDays <= 7;
        if (dateFilter === 'Month') return diffDays <= 30;
        return true;
      });
    }

    if (salaryRange.min || salaryRange.max) {
      const min = salaryRange.min ? parseFloat(salaryRange.min) : 0;
      const max = salaryRange.max ? parseFloat(salaryRange.max) : Infinity;
      result = result.filter(job => {
        const salary = parseSalary(job.salary);
        if (salary === null) return true;
        return salary >= min && salary <= max;
      });
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.toLowerCase().includes(lowerQuery) ||
        job.location.toLowerCase().includes(lowerQuery) ||
        (job.category && job.category.toLowerCase().includes(lowerQuery))
      );
    }
    
    return result;
  }, [approvedJobs, searchQuery, locationQuery, categoryFilter, dateFilter, salaryRange, showExpired]);

  const featuredTalents = useMemo(() => {
    const approved = (talents || []).filter(t => t.status === 'Approved');
    const featured = approved.filter(t => t.isFeatured);
    return featured.length > 0 ? featured.slice(0, 4) : approved.slice(0, 4);
  }, [talents]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocationQuery('All');
    setCategoryFilter('All');
    setDateFilter('Any');
    setSalaryRange({ min: '', max: '' });
    setShowExpired(false);
  };

  const handleSeedJobs = async () => {
    setSeeding(true);
    const titles = ["Senior Frontend Developer", "Backend Engineer", "Product Manager", "Data Analyst", "UX/UI Designer", "Digital Marketing Specialist", "DevOps Engineer"];
    const companies = ["TechCorp Ethiopia", "Innovatech", "CloudServe", "DataSys", "Abyssinia Solutions", "NextGen Digital"];
    const locations = ["Addis Ababa", "Remote", "Hawassa", "Dire Dawa", "Mekelle", "Bahir Dar", "Adama"];
    
    const categories: JobCategory[] = ['Developers', 'Creatives', 'Finance', 'Marketing & Sales', 'Management', 'Operations', 'Other'];
    const descriptions = [
      `We are looking for a highly skilled Software Engineer to join our core product team. You will be responsible for designing and implementing scalable backend services and working closely with our frontend developers.`,
      `Join our creative team as a UX/UI Designer and help shape the next generation of our digital products across Ethiopia.`,
      `We're hiring a Data Analyst to translate raw data into actionable business insights and automated reporting dashboards.`,
      `Are you a marketing wizard? We need a Digital Marketing Specialist to lead our user acquisition campaigns and manage brand presence.`
    ];

    try {
      const isDemoMode = !!localStorage.getItem('sira_go_demo_user');
      if (isDemoMode) {
        const stored = localStorage.getItem('sira_go_demo_jobs');
        const existingJobs = stored ? JSON.parse(stored) : [];
        const newDemoJobs = [];
        for (let i = 0; i < 5; i++) {
          newDemoJobs.push({
            id: 'demo-seed-' + Date.now() + '-' + i,
            title: titles[Math.floor(Math.random() * titles.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            salary: `${Math.floor(Math.random() * 50 + 25)},000 ETB / month`,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30 + 10))).toISOString(),
            description: descriptions[i % descriptions.length],
            status: 'Approved',
            employerId: 'admin-seed',
            createdAt: new Date().toISOString(),
            viewCount: Math.floor(Math.random() * 150 + 40),
            applyClickCount: Math.floor(Math.random() * 30 + 5),
            applyMethod: {
              type: Math.random() > 0.5 ? 'telegram' : 'link',
              value: Math.random() > 0.5 ? '@hr_contact' : 'https://example.com/apply'
            }
          });
        }
        localStorage.setItem('sira_go_demo_jobs', JSON.stringify([...newDemoJobs, ...existingJobs]));
        window.location.reload();
        return;
      }

      for (let i = 0; i < 5; i++) {
        await addDoc(collection(db, 'jobs'), {
            title: titles[Math.floor(Math.random() * titles.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            salary: `${Math.floor(Math.random() * 50 + 25)},000 ETB / month`,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30 + 10))).toISOString(),
            description: descriptions[i % descriptions.length],
            status: 'Approved',
            employerId: 'admin-seed',
            createdAt: serverTimestamp(),
            viewCount: Math.floor(Math.random() * 150 + 40),
            applyClickCount: Math.floor(Math.random() * 30 + 5),
            applyMethod: {
              type: Math.random() > 0.5 ? 'telegram' : 'link',
              value: Math.random() > 0.5 ? '@hr_contact' : 'https://example.com/apply'
            }
        });
      }
      alert("Successfully seeded 5 approved jobs!");
    } catch(err) {
       console.error("Failed to seed jobs:", err);
       alert("Error creating jobs.");
    } finally {
      setSeeding(false);
    }
  };

  const categoriesList = [
    { name: 'Developers', label: 'Technology', count: '1,250 Jobs', icon: Code, cat: 'Developers' },
    { name: 'Creatives', label: 'Design & Creative', count: '450 Jobs', icon: Palette, cat: 'Creatives' },
    { name: 'Marketing & Sales', label: 'Marketing', count: '320 Jobs', icon: Megaphone, cat: 'Marketing & Sales' },
    { name: 'Finance', label: 'Finance', count: '680 Jobs', icon: DollarSign, cat: 'Finance' },
    { name: 'Management', label: 'Business', count: '920 Jobs', icon: Cpu, cat: 'Management' },
    { name: 'Operations', label: 'Engineering', count: '410 Jobs', icon: Briefcase, cat: 'Operations' },
    { name: 'Other', label: 'Healthcare & More', count: '350 Jobs', icon: HeartPulse, cat: 'Other' },
  ];

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-20 max-w-7xl mx-auto">
      {/* AGR-019: Employer Hiring Hub & Guide Section */}
      {user && profile?.role === 'employer' && (
        <motion.section 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 bg-gradient-to-br from-[#0B2C5F] via-[#0F3A7D] to-[#0A1E3D] rounded-3xl text-white shadow-2xl relative overflow-hidden border border-blue-400/20"
        >
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-sira-orange border border-orange-500/30">
                  <Sparkles size={12} />
                  <span>Employer Hiring Hub</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">
                  Welcome back, {profile.displayName || profile.companyName || 'Employer'}
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                  Your smart pipeline for posting roles, broadcasting to Telegram, and scouting vetted Ethiopian talent.
                </p>
              </div>
              <Link
                to="/employer/post"
                className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 bg-sira-orange text-black font-extrabold text-sm rounded-2xl shadow-lg hover:bg-[#E66E00] transition transform hover:-translate-y-0.5"
              >
                + Post a Job
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/15 transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-xl font-bold mb-3">
                    ⚡
                  </div>
                  <h3 className="font-extrabold text-base mb-1">1. Post in 60 Seconds</h3>
                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    Auto-fills your company or private profile with 1-tap role templates and ETB salary presets.
                  </p>
                </div>
                <Link
                  to="/employer/post"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sira-orange hover:text-white transition"
                >
                  <span>+ Post a Job</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/15 transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center text-xl font-bold mb-3">
                    📢
                  </div>
                  <h3 className="font-extrabold text-base mb-1">2. Instant Telegram Broadcast</h3>
                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    Once approved by admin, your listings syndicate automatically to SiraGo's active Telegram channels.
                  </p>
                </div>
                <Link
                  to="/employer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-300 hover:text-white transition"
                >
                  <span>Manage Listings</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/15 transition">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-xl font-bold mb-3">
                    🎯
                  </div>
                  <h3 className="font-extrabold text-base mb-1">3. Scout Verified Talent</h3>
                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    Browse Graphic Designers, Video Creators, and Web Developers with visual portfolios.
                  </p>
                </div>
                <Link
                  to="/talent"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white transition"
                >
                  <span>Explore Talent</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col gap-8 text-center max-w-4xl mx-auto pt-4 md:pt-10 relative"
      >
        <button 
          onClick={handleSeedJobs}
          disabled={seeding}
          className="absolute -top-2 right-0 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-sira-orange border border-slate-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          title="Generate 5 demo jobs"
        >
          <Zap size={14} className={seeding ? "animate-spin text-sira-orange" : "text-sira-orange"} />
          {seeding ? "Seeding..." : "Seed Demo Jobs"}
        </button>

        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-extrabold shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-sira-orange animate-ping" />
            Ethiopia's Premier Job Marketplace
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight"
          >
            Find Jobs.<br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sira-orange bg-clip-text text-transparent">Build Your Future.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
          >
            Discover opportunities from companies and organizations across Ethiopia. Find the right opportunity and take your next step.
          </motion.p>
        </div>

        {/* Premium Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] p-3 sm:p-4 rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-3 items-center"
        >
          <div className="relative flex-1 w-full flex items-center px-4 py-3 bg-slate-50 dark:bg-[#1F2937]/50 rounded-2xl border border-slate-200 dark:border-gray-700/50 focus-within:border-blue-500 transition-colors">
            <Search size={20} className="text-slate-400 dark:text-gray-400 mr-3 shrink-0" />
            <div className="flex flex-col w-full text-left">
              <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">What</span>
              <input
                type="text"
                placeholder="Job title, skill or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-gray-500 text-sm font-semibold focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="relative flex-1 w-full flex items-center px-4 py-3 bg-slate-50 dark:bg-[#1F2937]/50 rounded-2xl border border-slate-200 dark:border-gray-700/50 focus-within:border-blue-500 transition-colors">
            <MapPin size={20} className="text-slate-400 dark:text-gray-400 mr-3 shrink-0" />
            <div className="flex flex-col w-full text-left">
              <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Where</span>
              <select
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white text-sm font-semibold focus:outline-none w-full cursor-pointer"
              >
                <option value="All" className="bg-white text-slate-900 dark:bg-[#111827] dark:text-white">All Locations (Ethiopia)</option>
                <option value="Addis Ababa" className="bg-white text-slate-900 dark:bg-[#111827] dark:text-white">Addis Ababa</option>
                <option value="Remote" className="bg-white text-slate-900 dark:bg-[#111827] dark:text-white">Remote</option>
                <option value="Adama" className="bg-white text-slate-900 dark:bg-[#111827] dark:text-white">Adama</option>
                <option value="Hawassa" className="bg-white text-slate-900 dark:bg-[#111827] dark:text-white">Hawassa</option>
                <option value="Bahir Dar" className="bg-white text-slate-900 dark:bg-[#111827] dark:text-white">Bahir Dar</option>
                <option value="Mekelle" className="bg-white text-slate-900 dark:bg-[#111827] dark:text-white">Mekelle</option>
              </select>
            </div>
          </div>

          <a 
            href="#featured-jobs"
            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Search size={18} />
            Search Jobs
          </a>
        </motion.div>

        {/* Quick Filter Pills & Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="text-slate-500 dark:text-gray-500 mr-1">Popular:</span>
          {['Remote', 'Full Time', 'Part Time', 'Internship', 'Entry Level'].map((pill) => (
            <button
              key={pill}
              onClick={() => setSearchQuery(pill)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] dark:text-gray-300 dark:border-[#1F2937] rounded-full transition-colors cursor-pointer shadow-sm"
            >
              {pill}
            </button>
          ))}

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer border ${
              showAdvancedFilters || dateFilter !== 'Any' || salaryRange.min || salaryRange.max || showExpired
                ? 'bg-blue-600/20 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] dark:text-gray-300 dark:border-[#1F2937]'
            }`}
          >
            <SlidersHorizontal size={12} />
            <span>Filters {(dateFilter !== 'Any' || salaryRange.min || salaryRange.max || showExpired) && '• Active'}</span>
          </button>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-3.5 py-1.5 bg-sira-orange/15 hover:bg-sira-orange/25 text-sira-orange border border-sira-orange/30 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Bell size={12} />
            <span>Alert Me</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-3xl p-6 text-left shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2937] pb-3">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-blue-500 dark:text-blue-400" />
                Refine Your Search
              </h4>
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 cursor-pointer font-bold"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Date Posted
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Any', '24h', 'Week', 'Month'] as const).map(df => (
                    <button
                      key={df}
                      type="button"
                      onClick={() => setDateFilter(df)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                        dateFilter === df
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-950 dark:bg-[#1F2937]/50 dark:text-gray-400 dark:border-gray-700/60 dark:hover:text-white'
                      }`}
                    >
                      {df === 'Any' ? 'Anytime' : df === '24h' ? 'Past 24h' : df === 'Week' ? 'Past Week' : 'Past Month'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Salary Range (ETB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min (e.g. 20000)"
                    value={salaryRange.min}
                    onChange={(e) => setSalaryRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#1F2937]/50 border border-slate-200 dark:border-gray-700/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max (e.g. 80000)"
                    value={salaryRange.max}
                    onChange={(e) => setSalaryRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#1F2937]/50 border border-slate-200 dark:border-gray-700/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Options
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#1F2937]/40 border border-slate-200 dark:border-gray-700/60 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1F2937]/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showExpired}
                    onChange={(e) => setShowExpired(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 bg-white dark:bg-[#111827] border-slate-300 dark:border-gray-600 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 dark:text-gray-300 font-bold">Include Expired Listings</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-3xl shadow-xl"
      >
        {[
          { label: 'Jobs Available', value: '10,000+', icon: Briefcase, color: 'text-blue-500' },
          { label: 'Active Companies', value: '2,500+', icon: Building, color: 'text-sira-orange' },
          { label: 'Professionals', value: '50,000+', icon: Users, color: 'text-purple-500' },
          { label: 'New Jobs Weekly', value: '100+', icon: TrendingUp, color: 'text-emerald-500' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex flex-col items-center text-center p-4">
              <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-gray-800/80 mb-3 ${stat.color}`}>
                <Icon size={24} />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </motion.section>

      {/* Job Categories Section */}
      <section id="categories" className="w-full">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-[#1F2937] pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Explore Opportunities</h2>
            <p className="text-slate-600 dark:text-gray-400 font-semibold text-sm">Browse jobs by industry and expertise</p>
          </div>
          <Link to="/" onClick={() => setCategoryFilter('All')} className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriesList.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = categoryFilter === cat.cat;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCategoryFilter(cat.cat as JobCategory)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-blue-600/15 border-blue-500 text-slate-900 dark:text-white shadow-lg shadow-blue-500/10' 
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1F2937] hover:border-blue-500/50 text-slate-800 dark:text-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700/80 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400">{cat.count}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{cat.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Explore open roles</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section id="featured-jobs" className="scroll-mt-8 w-full">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-[#1F2937] pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Featured Opportunities</h2>
            <p className="text-slate-600 dark:text-gray-400 font-semibold text-sm">Hand-picked roles from top Ethiopian organizations</p>
          </div>
          <span className="text-xs font-extrabold text-sira-orange uppercase tracking-wider bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Featured
          </span>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-3xl p-6 animate-pulse h-64"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Technical & Creative Talent Spotlight Section */}
      {featuredTalents.length > 0 && (
        <section className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-slate-200 dark:border-[#1F2937] pb-4 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-xs font-extrabold mb-2">
                <Sparkles size={12} className="text-sira-orange" />
                <span>Featured Creators</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                Featured Technical & Creative Talent
              </h2>
              <p className="text-slate-600 dark:text-gray-400 font-semibold text-sm">
                Discover verified Ethiopian designers, developers, and visual creators open for hire
              </p>
            </div>
            <Link
              to="/talent"
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white flex items-center gap-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] hover:border-blue-500/40 px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer shadow-sm"
            >
              <span>View All Talent</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredTalents.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Opportunities Section */}
      <section className="w-full">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-[#1F2937] pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Latest Opportunities</h2>
            <p className="text-slate-600 dark:text-gray-400 font-semibold text-sm">Browse all open positions in ETB</p>
          </div>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{filteredJobs.length} available</span>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-3xl p-6 animate-pulse h-64"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-[#1F2937]">
                <p className="text-slate-700 dark:text-gray-300 font-bold text-lg mb-2">No opportunities found matching your search.</p>
                <button onClick={handleResetFilters} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm">Reset Filters</button>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        )}
      </section>
      
      <AlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
        initialKeyword={searchQuery}
      />
    </div>
  );
}
