import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Clock, Loader2, Share2, AlertCircle, MapPin } from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { isJobExpired, formatETB } from '../lib/utils';

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
      className={`group bg-[#111827] border border-[#1F2937] hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 ease-out transform hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col relative cursor-pointer ${jobIsExpired ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {jobIsExpired && (
            <span className="px-2.5 py-1 bg-red-900/40 text-red-300 rounded-full text-xs font-bold border border-red-800/60 flex items-center gap-1">
              <AlertCircle size={12} /> Expired
            </span>
          )}
          <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-bold">
            {typePill}
          </span>
          {job.category && (
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">
              {job.category}
            </span>
          )}
        </div>
        <span className="shrink-0 text-emerald-400 font-extrabold text-xs sm:text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          {formatETB(job.salary || 'Negotiable')}
        </span>
      </div>

      <h3 className="font-extrabold text-lg mb-2 text-white leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">{job.title}</h3>

      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md">
          {companyInitial}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-200 truncate">{job.company}</p>
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0 text-sira-orange" /> {job.location}
          </p>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
        {job.description}
      </p>

      <div className="mt-auto pt-4 border-t border-[#1F2937]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <Clock size={14} className="text-sira-orange" />
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="p-2 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-gray-800 transition-colors"
              aria-label="Share this job"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`p-2 rounded-xl transition-colors ${isSaving ? 'text-gray-400' : isSaved ? 'text-sira-orange' : 'text-gray-400 hover:text-sira-orange hover:bg-gray-800'}`}
              aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
              )}
            </button>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
          className="w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          View Details & Apply
        </button>
      </div>
    </div>
  );
}
