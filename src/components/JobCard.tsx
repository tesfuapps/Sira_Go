import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Clock, Loader2, Share2, AlertCircle, MapPin } from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { isJobExpired } from '../lib/utils';

export function JobCard({ job }: { job: Job; key?: React.Key }) {
  const { savedJobIds, toggleSavedJob } = useJobs();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const typePill = job.location.toLowerCase().includes('remote') ? 'Remote' : 'Full-time';
  const isSaved = savedJobIds.includes(job.id);
  const companyInitial = (job.company || 'S').charAt(0).toUpperCase();

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const delay = new Promise(resolve => setTimeout(resolve, 300));
      await Promise.all([toggleSavedJob(job.id), delay]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.id}`;
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job on Sira Go: ${job.title} at ${job.company}`,
        url: url,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const jobIsExpired = isJobExpired(job.deadline);

  return (
    <div 
      onClick={() => navigate(`/jobs/${job.id}`)}
      className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/60 dark:border-gray-700/60 rounded-2xl p-5 transition-all duration-300 ease-out transform shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(11,44,95,0.18)] hover:bg-white/95 dark:hover:bg-gray-800/95 hover:border-sira-blue/50 dark:hover:border-sira-blue/60 flex flex-col relative cursor-pointer ${jobIsExpired ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {jobIsExpired && (
            <span className="px-2.5 py-1 bg-red-50/90 dark:bg-red-900/40 backdrop-blur-sm text-red-700 dark:text-red-300 rounded-full text-xs font-medium border border-red-200/60 dark:border-red-800/60 flex items-center gap-1">
              <AlertCircle size={12} /> Expired
            </span>
          )}
          <span className="px-3 py-1 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 rounded-full text-xs font-semibold">
            {typePill}
          </span>
          {job.category && (
            <span className="px-3 py-1 bg-blue-50/80 dark:bg-blue-900/40 backdrop-blur-sm text-sira-blue dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-100/60 dark:border-blue-800/60">
              {job.category}
            </span>
          )}
        </div>
        <span className="shrink-0 text-sira-blue dark:text-blue-300 font-bold text-sm bg-blue-50/80 dark:bg-blue-900/40 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100/60 dark:border-blue-800/60">
          {job.salary || 'Negotiable'}
        </span>
      </div>

      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white leading-tight line-clamp-2">{job.title}</h3>

      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-9 h-9 rounded-xl bg-sira-blue dark:bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          {companyInitial}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{job.company}</p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0" /> {job.location}
          </p>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
        {job.description}
      </p>

      <div className="mt-auto pt-4 border-t border-gray-100/80 dark:border-gray-700/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
            <Clock size={14} className="text-sira-orange" />
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="relative group/btn p-2 rounded-full transition-colors text-gray-400 hover:text-sira-blue hover:bg-blue-50/80 dark:hover:bg-gray-700/80"
              aria-label="Share this job"
            >
              <Share2 size={18} />
              <div className="absolute opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs whitespace-nowrap py-1.5 px-2.5 rounded shadow z-10">
                Share
              </div>
            </button>
            <button 
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`relative group/btn p-2 rounded-full transition-colors ${isSaving ? 'text-gray-400' : isSaved ? 'text-sira-orange' : 'text-gray-400 hover:text-sira-orange hover:bg-orange-50/80 dark:hover:bg-gray-700/80'}`}
              aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
              )}
              <div className="absolute opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs whitespace-nowrap py-1.5 px-2.5 rounded shadow z-10">
                {isSaved ? "Remove from saved" : "Save job"}
              </div>
            </button>
          </div>
        </div>
        <Link 
          to={`/jobs/${job.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block w-full text-center py-2.5 bg-sira-blue text-white rounded-xl text-sm font-bold hover:bg-[#082046] hover:shadow-md transition-all shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
