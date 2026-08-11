import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { JobCard } from '../components/JobCard';

export function SavedJobs() {
  const { jobs, savedJobIds } = useJobs();
  
  const savedJobs = jobs.filter(job => savedJobIds.includes(job.id));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-sira-blue mb-2 transition-colors w-fit">
          <ArrowLeft size={18} /> Back to jobs
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sira-orange/10 flex items-center justify-center shrink-0">
            <Bookmark size={24} className="text-sira-orange" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0B2C5F]">Saved Jobs</h1>
            <p className="text-gray-500 font-medium">Your bookmarked opportunities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savedJobs.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-16 px-6 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 mb-2">
              <Bookmark size={28} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't saved any jobs yet.</p>
            <Link to="/" className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-bold rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              Browse Jobs
            </Link>
          </div>
        ) : (
          savedJobs.map(job => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
