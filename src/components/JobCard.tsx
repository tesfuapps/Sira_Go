import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Clock, Loader2, Share2, AlertCircle, MapPin, Eye, Zap, ShieldCheck, UserCheck, Settings, Copy } from 'lucide-react';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { isJobExpired, formatETB } from '../lib/utils';

export function JobCard({ job }: { job: Job; key?: React.Key }) {
  const { savedJobIds, toggleSavedJob } = useJobs();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const typePill = job.location.toLowerCase().includes('remote') ? 'Remote' : 'Full-time';
  const isSaved = savedJobIds.includes(job.id);

  const isEmployer = profile?.role === 'employer';
  const isMyJob = !!user && (job.employerId === user.uid || (!!profile?.companyName && profile.companyName.toLowerCase() === job.company.toLowerCase()));

  const displayCompany = job.isConfidential && profile?.role !== 'admin'
    ? 'Confidential Employer (Verified)'
    : (job.isPrivateEmployer ? 'Private Employer' : job.company);

  const companyInitial = displayCompany.charAt(0).toUpperCase();

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
        text: `Check out this job on Sira Go: ${job.title} at ${displayCompany}`,
        url: url,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const jobIsExpired = isJobExpired(job.deadline);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEmployer) {
      if (isMyJob) {
        navigate('/employer');
      } else {
        navigate(`/employer/post?title=${encodeURIComponent(job.title)}&category=${encodeURIComponent(job.category || '')}`);
      }
    } else {
      navigate(`/jobs/${job.id}`);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/jobs/${job.id}`)}
      className={`group bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 ease-out transform hover:-translate-y-1 shadow-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col relative cursor-pointer ${jobIsExpired ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {jobIsExpired && (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-full text-xs font-bold border border-red-200 dark:border-red-800/60 flex items-center gap-1">
              <AlertCircle size={12} /> Expired
            </span>
          )}
          <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-bold">
            {typePill}
          </span>
          {job.category && (
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-500/20 dark:border-blue-500/30">
              {job.category}
            </span>
          )}
          {job.isConfidential && (
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-1">
              <ShieldCheck size={12} /> Confidential
            </span>
          )}
          {job.isPrivateEmployer && (
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-500/20 flex items-center gap-1">
              <UserCheck size={12} /> Private Employer
            </span>
          )}
        </div>
        <span className="shrink-0 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          {formatETB(job.salary || 'Negotiable')}
        </span>
      </div>

      <h3 className="font-extrabold text-lg mb-2 text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {job.title}
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md">
          {companyInitial}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-gray-200 truncate flex items-center gap-1">
            <span>{displayCompany}</span>
            {job.isConfidential && profile?.role === 'admin' && (
              <span className="text-[10px] text-slate-400 font-normal">({job.company})</span>
            )}
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0 text-sira-orange" />
            <span>{job.location}</span>
            {job.isPrivateEmployer && job.privateEmployerContext && (
              <span className="text-purple-500 font-medium ml-1">• {job.privateEmployerContext}</span>
            )}
          </p>
        </div>
      </div>

      <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
        {job.description}
      </p>

      {/* Engagement Live Counter */}
      <div className="flex items-center gap-3 text-xs font-bold text-slate-400 dark:text-gray-500 mb-4 bg-slate-50 dark:bg-gray-800/50 py-1.5 px-3 rounded-xl border border-slate-100 dark:border-gray-800 w-fit">
        <span className="flex items-center gap-1">
          <Eye size={13} className="text-blue-500" />
          <span>{job.viewCount ?? 0} views</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Zap size={13} className="text-sira-orange" />
          <span>{job.applyClickCount ?? 0} clicks</span>
        </span>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#1F2937]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-gray-400">
            <Clock size={14} className="text-sira-orange" />
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Share this job"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${isSaving ? 'text-slate-400' : isSaved ? 'text-sira-orange' : 'text-slate-400 hover:text-sira-orange hover:bg-slate-100 dark:hover:bg-gray-800'}`}
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

        {/* Action Button: Replace Apply button for Employers */}
        {isEmployer ? (
          isMyJob ? (
            <button 
              onClick={handleActionClick}
              className="w-full text-center py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl text-sm font-extrabold transition-all border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Settings size={16} />
              <span>Manage Your Listing</span>
            </button>
          ) : (
            <button 
              onClick={handleActionClick}
              className="w-full text-center py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-xl text-sm font-extrabold transition-all border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Copy size={16} />
              <span>Post Similar Role</span>
            </button>
          )
        ) : (
          <button 
            onClick={handleActionClick}
            className="w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            View Details & Apply
          </button>
        )}
      </div>
    </div>
  );
}
