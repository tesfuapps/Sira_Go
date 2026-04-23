import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Clock, Loader2 } from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';

export function JobCard({ job }: { job: Job; key?: React.Key }) {
  const { savedJobIds, toggleSavedJob } = useJobs();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const typePill = job.location.toLowerCase().includes('remote') ? 'Remote' : 'Full-time';
  const isSaved = savedJobIds.includes(job.id);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Add a minimum visual delay so the spinner is actually seen by the user
      // Firebase optimistic updates are often too fast to see the loader
      const delay = new Promise(resolve => setTimeout(resolve, 300));
      await Promise.all([toggleSavedJob(job.id), delay]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 ease-out transform shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:scale-[1.02] hover:shadow-[0_14px_28px_-6px_rgba(11,44,95,0.12)] hover:border-[--color-sira-blue] flex flex-col relative cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-2">
          <span className="w-max px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {typePill}
          </span>
          <span className="text-[--color-sira-blue] font-bold text-sm">
            {job.salary || 'Negotiable'}
          </span>
        </div>
        <button 
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`relative group p-2 rounded-full shrink-0 transition-colors ${isSaving ? 'text-gray-400' : isSaved ? 'text-[--color-sira-orange]' : 'text-gray-300 hover:text-gray-400 hover:bg-gray-50'}`}
          aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
        >
          {isSaving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
          )}
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs whitespace-nowrap py-1.5 px-2.5 rounded shadow z-10">
            {isSaved ? "Remove from saved" : "Save job"}
            <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        </button>
      </div>
      <h3 className="font-bold text-lg mb-1 text-gray-900 pr-8 leading-tight">{job.title}</h3>
      <p className="text-gray-500 text-sm mb-3 line-clamp-1 font-medium">
        {job.company} <span className="mx-1">·</span> {job.location}
      </p>
      <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
        {job.description}
      </p>
      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Clock size={14} className="text-[--color-sira-orange]" />
          <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
        </div>
        <div 
          className="block w-full text-center py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-[--color-sira-blue] hover:bg-[--color-sira-blue] hover:text-black hover:border-[--color-sira-blue] transition-all"
        >
          View Details
        </div>
      </div>
    </div>
  );
}
