import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { JobCard } from '../components/JobCard';
import { AlertModal } from '../components/AlertModal';
import { Zap, Search, Bell, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { JobCategory } from '../types';
import { isJobExpired, parseSalary } from '../lib/utils';

export function Home() {
  const { jobs, jobsLoading, jobsError } = useJobs();
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<'Any' | '24h' | 'Week' | 'Month'>('Any');
  const [salaryRange, setSalaryRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showExpired, setShowExpired] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  const approvedJobs = jobs.filter(j => j.status === 'Approved');

  const filteredJobs = useMemo(() => {
    let result = approvedJobs;

    // Filter out expired jobs unless explicitly shown
    if (!showExpired) {
      result = result.filter(job => !isJobExpired(job.deadline));
    }

    // Apply specific category filter
    if (categoryFilter !== 'All') {
      result = result.filter(job => job.category === categoryFilter);
    }

    // Apply date filter
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

    // Apply salary range filter
    if (salaryRange.min || salaryRange.max) {
      const min = salaryRange.min ? parseFloat(salaryRange.min) : 0;
      const max = salaryRange.max ? parseFloat(salaryRange.max) : Infinity;
      result = result.filter(job => {
        const salary = parseSalary(job.salary);
        if (salary === null) return true; // keep jobs without salary
        return salary >= min && salary <= max;
      });
    }

    // Apply search query
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
  }, [approvedJobs, searchQuery, categoryFilter, dateFilter, salaryRange, showExpired]);

  const handleSeedJobs = async () => {
    setSeeding(true);
    const titles = ["Frontend Developer", "Backend Engineer", "Product Manager", "Data Analyst", "UX Designer", "Marketing Specialist", "DevOps Engineer"];
    const companies = ["TechCorp", "Innovatech", "CloudServe", "DataSys", "WebDesign Co", "NextGen Solutions"];
    const locations = ["Addis Ababa", "Remote", "Hawassa", "Dire Dawa", "Mekelle", "Bahir Dar", "Adama"];
    
    const categories: JobCategory[] = ['Developers', 'Creatives', 'Finance', 'Marketing & Sales', 'Management', 'Operations', 'Other'];
    const descriptions = [
      `We are looking for a highly skilled Software Engineer to join our core product team. You will be responsible for designing and implementing scalable backend services, optimizing API performance, and working closely with our frontend developers to deliver seamless user experiences.

Requirements:
• 3+ years of experience in Node.js and TypeScript.
• Strong understanding of SQL (PostgreSQL preferred) and database design.
• Familiarity with Docker and containerized deployments.
• Excellent problem-solving skills and clean code practices.
• Experience with Redis or similar caching mechanisms.

We offer flexible working hours, health coverage, and a collaborative work environment.`,
      `Join our creative team as a UX/UI Designer and help shape the next generation of our digital products. You'll work closely with product managers and engineers to craft intuitive, beautiful interfaces that our users love.

Responsibilities:
• Conduct user research and usability testing to validate design decisions.
• Create wireframes, interactive prototypes, and high-fidelity mockups.
• Maintain and evolve our internal design system.
• Ensure accessibility standards are met across all platforms.

Qualifications:
• A strong portfolio demonstrating complex problem solving through design.
• Proficiency in Figma.
• Basic understanding of HTML/CSS is a plus.`,
      `We're hiring a Data Analyst to translate raw data into actionable business insights. In this role, you will analyze user behavior, build automated reporting dashboards, and assist leadership in making data-driven decisions.

What you'll do:
• Develop and maintain complex SQL queries to extract data from our warehouse.
• Create automated dashboards using Tableau or Power BI.
• Identify trends and anomalies in user engagement metrics.
• Present analytical findings to non-technical stakeholders.

You should have:
• A degree in Computer Science, Statistics, Mathematics, or Economics.
• 2+ years of experience in a similar analytical role.
• High proficiency in Python (Pandas/NumPy) or R.`,
      `Are you a marketing wizard? We need a Digital Marketing Specialist to lead our user acquisition campaigns and manage our brand presence across social media channels.

Key Responsibilities:
• Plan and execute SEO and SEM strategies.
• Manage performance marketing budgets across Google Ads and Meta Ads.
• Track and report on campaign CPA, ROI, and conversion rates.
• Collaborate with content creators to produce engaging campaign materials.

Requirements:
• Proven track record of running successful paid acquisition campaigns.
• Deep understanding of Google Analytics and marketing attribution models.
• Creative mindset with a data-driven approach.`,
      `We are seeking a reliable and proactive Product Manager to guide our new mobile app initiative from conception to launch. You are the glue between engineering, design, and our stakeholders.

Your day-to-day:
• Define product vision, strategy, and roadmap.
• Write clear technical and non-technical specifications and user stories.
• Prioritize backlog based on business value and user impact.
• Run daily standups and sprint planning meetings.

What we're looking for:
• 4+ years of product management experience, preferably in B2C tech.
• Ability to influence cross-functional teams without direct authority.
• Strong communication and organizational skills.`
    ];

    try {
      for (let i = 0; i < 5; i++) {
        await addDoc(collection(db, 'jobs'), {
            title: titles[Math.floor(Math.random() * titles.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            salary: `${Math.floor(Math.random() * 50 + 20)},000 ETB`,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30 + 10))).toISOString(),
            description: descriptions[i % descriptions.length],
            status: 'Approved',
            employerId: 'admin-seed',
            createdAt: serverTimestamp(),
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

  return (
    <div className="flex flex-col gap-12 pb-10 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="flex flex-col gap-6 text-center max-w-2xl mx-auto pt-8 md:pt-12 relative">
        <button 
          onClick={handleSeedJobs}
          disabled={seeding}
          className="absolute -top-4 right-0 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-sira-orange transition-colors disabled:opacity-50"
          title="Generate 5 demo jobs"
        >
          <Zap size={14} className={seeding ? "animate-pulse" : ""} />
          {seeding ? "Seeding..." : "Seed Jobs"}
        </button>
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sira-blue/5 dark:bg-sira-blue/20 border border-sira-blue/15 dark:border-sira-blue/40 rounded-full text-sira-blue dark:text-blue-300 text-sm font-semibold mb-6">
            <Zap size={14} className="text-sira-orange" />
            Ethiopia's Fastest Hiring Platform
          </div>
          <h1 className="text-[3rem] md:text-6xl font-extrabold text-sira-blue leading-tight mb-6 tracking-tight">
            Find Jobs.<br />
            <span className="text-sira-orange">Apply in Seconds.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            Post jobs or apply instantly via Telegram. The fastest platform for the Ethiopian workforce.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <a href="#featured-jobs" className="px-8 py-5 bg-sira-orange text-black rounded-2xl font-bold text-lg shadow-[0_10px_25px_-5px_rgba(255,122,0,0.3)] hover:bg-[#E66E00] hover:scale-[1.02] transition-all">
            Browse Jobs
          </a>
          <Link to="/employer/post" className="px-8 py-5 border-2 border-sira-blue text-sira-blue rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02] transition-all">
            Post a Job
          </Link>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section id="featured-jobs" className="scroll-mt-8 w-full mt-8">
        
        {/* Search Bar & Alerts */}
        <div className="max-w-3xl mx-auto w-full mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-2xl shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-50 dark:bg-blue-900/20 text-sira-blue border border-blue-100 dark:border-blue-800 font-bold rounded-2xl shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors whitespace-nowrap"
          >
            <Bell size={20} />
            <span className="hidden sm:inline">Alert Me</span>
          </button>
        </div>

        {/* Filters */}
        <div className="max-w-3xl mx-auto w-full mb-12 flex flex-col items-start gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div className="w-full overflow-x-auto hide-scrollbar pb-1">
              <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-700 min-w-max pb-2">
                {['All', 'Developers', 'Creatives', 'Finance', 'Marketing & Sales', 'Management', 'Operations', 'Other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat as JobCategory | 'All')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold transition-all ${
                      categoryFilter === cat 
                        ? 'bg-[#0B2C5F] text-white shadow-sm dark:bg-gray-200 dark:text-[#0B2C5F]' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative shrink-0 w-full sm:w-[150px]">
               <select
                 value={dateFilter}
                 onChange={(e) => setDateFilter(e.target.value as 'Any' | '24h' | 'Week' | 'Month')}
                 className="appearance-none bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2C5F] focus:border-transparent block w-full py-2.5 pl-4 pr-10 cursor-pointer hover:bg-gray-100 transition-colors"
               >
                 <option value="Any">Any time</option>
                 <option value="24h">Past 24 hours</option>
                 <option value="Week">Past week</option>
                 <option value="Month">Past month</option>
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                 <ChevronDown size={16} />
               </div>
            </div>
          </div>

          {/* Salary Range Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Salary range (ETB):</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                placeholder="Min"
                value={salaryRange.min}
                onChange={(e) => setSalaryRange({ ...salaryRange, min: e.target.value })}
                className="w-24 px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sira-blue transition-all"
              />
              <span className="text-gray-400 dark:text-gray-500">—</span>
              <input
                type="number"
                placeholder="Max"
                value={salaryRange.max}
                onChange={(e) => setSalaryRange({ ...salaryRange, max: e.target.value })}
                className="w-24 px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sira-blue transition-all"
              />
            </div>
            <button
              onClick={() => setShowExpired(!showExpired)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                showExpired
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Include expired jobs in results"
            >
              Include Expired
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B2C5F] dark:text-white mb-1">Latest Opportunities</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Curated roles from top companies</p>
          </div>
          <p className="text-sm font-semibold text-sira-orange hidden sm:block">{filteredJobs.length} jobs available</p>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : jobsError ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load jobs</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{jobsError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length === 0 ? (
              <p className="col-span-1 md:col-span-2 lg:col-span-3 text-gray-500 dark:text-gray-400 py-16 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 font-medium text-lg">
                {searchQuery ? `No jobs found matching "${searchQuery}"` : "No jobs available right now. Check back later!"}
              </p>
            ) : (
              filteredJobs.map(job => <JobCard key={job.id} job={job} />)
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
