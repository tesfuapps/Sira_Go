import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Building2, Banknote, Calendar, ArrowLeft, Send, Bookmark, Share2, Loader2, Eye, Zap, ShieldCheck, UserCheck, Copy, Check, Settings, Sparkles } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Job } from '../types';

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, jobsLoading, savedJobIds, toggleSavedJob, incrementViewCount, incrementApplyClickCount } = useJobs();
  const { user, profile } = useAuth();
  const [individualJob, setIndividualJob] = useState<Job | null>(null);
  const [fetchingDoc, setFetchingDoc] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const viewedRef = useRef<string | null>(null);

  const contextJob = jobs.find(j => j.id === id);
  const job = contextJob || individualJob;

  useEffect(() => {
    if (!contextJob && id && !jobsLoading) {
      setFetchingDoc(true);
      getDoc(doc(db, 'jobs', id))
        .then(snap => {
          if (snap.exists()) {
            const data = snap.data();
            setIndividualJob({
              id: snap.id,
              ...data,
              viewCount: data.viewCount ?? 110,
              applyClickCount: data.applyClickCount ?? 20,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            } as Job);
          }
        })
        .catch(err => console.error("Could not fetch job doc:", err))
        .finally(() => setFetchingDoc(false));
    }
  }, [id, contextJob, jobsLoading]);

  // Increment viewCount on mount
  useEffect(() => {
    if (job?.id && viewedRef.current !== job.id) {
      viewedRef.current = job.id;
      incrementViewCount(job.id);
    }
  }, [job?.id, incrementViewCount]);

  if (jobsLoading || fetchingDoc) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <Loader2 size={44} className="animate-spin text-sira-blue mb-4" />
        <p className="text-gray-400 font-semibold">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-24 bg-[#111827] border border-[#1F2937] rounded-3xl max-w-xl mx-auto my-12">
        <h2 className="text-2xl font-bold text-white mb-2">Job not found</h2>
        <p className="text-gray-400 text-sm mb-6">This job posting may have expired or been removed.</p>
        <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors inline-block">
          Return to All Jobs
        </Link>
      </div>
    );
  }

  const isEmployer = profile?.role === 'employer';
  const isMyJob = !!user && (job.employerId === user.uid || (!!profile?.companyName && profile.companyName.toLowerCase() === job.company.toLowerCase()));

  const displayCompany = job.isConfidential && profile?.role !== 'admin'
    ? 'Confidential Employer (Verified)'
    : (job.isPrivateEmployer ? 'Private Employer' : job.company);

  const pitchText = `Hello! I saw your "${job.title}" opening on SiraGo and would love to apply. Here is my background and portfolio:`;

  const handleApply = () => {
    incrementApplyClickCount(job.id);

    if (job.applyMethod.type === 'telegram') {
      const username = job.applyMethod.value.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').trim();
      const telegramUrl = `https://t.me/${username}?text=${encodeURIComponent(pitchText)}`;
      window.open(telegramUrl, '_blank');
    } else if (job.applyMethod.type === 'phone') {
      window.location.href = `tel:${job.applyMethod.value}`;
    } else {
      window.open(job.applyMethod.value, '_blank');
    }
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2200);
  };

  const handleShare = () => {
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-sira-blue mb-8 transition-colors text-sm font-semibold">
        <ArrowLeft size={18} /> Back to jobs
      </Link>
      
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl border border-gray-100 dark:border-[#1F2937]">
        <div className="mb-8 pb-8 border-b border-gray-100 dark:border-[#1F2937]">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {job.category && (
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                {job.category}
              </span>
            )}
            {job.isConfidential && (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-1">
                <ShieldCheck size={14} /> Confidential Employer
              </span>
            )}
            {job.isPrivateEmployer && (
              <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-500/20 flex items-center gap-1">
                <UserCheck size={14} /> Private Employer
              </span>
            )}
            {/* Live Engagement Badge */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400 ml-auto bg-slate-100 dark:bg-gray-800 py-1 px-3 rounded-full">
              <span className="flex items-center gap-1"><Eye size={12} className="text-blue-500" /> {job.viewCount ?? 0} views</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Zap size={12} className="text-sira-orange" /> {job.applyClickCount ?? 0} clicks</span>
            </div>
          </div>

          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B2C5F] dark:text-white shrink">
              {job.title}
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="p-3 rounded-full shrink-0 transition-colors bg-gray-50 text-gray-500 hover:text-sira-blue hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
                aria-label="Share this job"
                title="Share job"
              >
                <Share2 size={20} />
              </button>

              <button 
                onClick={() => toggleSavedJob(job.id)}
                className={`p-3 rounded-full shrink-0 transition-colors cursor-pointer ${savedJobIds.includes(job.id) ? 'bg-sira-orange/15 text-sira-orange hover:bg-sira-orange/25' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                aria-label={savedJobIds.includes(job.id) ? "Remove from bookmarks" : "Save this job"}
                title="Save job"
              >
                <Bookmark size={20} fill={savedJobIds.includes(job.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <Building2 size={18} className="text-sira-blue dark:text-blue-400" />
              <span>{displayCompany}</span>
              {job.isConfidential && profile?.role === 'admin' && (
                <span className="text-xs text-slate-400 font-normal">({job.company})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-sira-orange" />
              <span>{job.location}</span>
              {job.isPrivateEmployer && job.privateEmployerContext && (
                <span className="text-purple-500 font-medium">({job.privateEmployerContext})</span>
              )}
            </div>
            {job.salary && (
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                <Banknote size={18} />
                <span>{job.salary}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sira-orange">
              <Calendar size={18} />
              <span className="font-semibold">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="prose prose-gray max-w-none mb-10 dark:prose-dark">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Job Description</h3>
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            {job.description}
          </p>
        </div>

        {/* Action Panel */}
        {isEmployer ? (
          /* Employer Action Replacement: Never show Apply to Employers */
          <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-sira-orange" />
                <h4 className="font-extrabold text-slate-900 dark:text-white">
                  {isMyJob ? 'Your Active Listing' : 'Looking to Hire Similar Talent?'}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isMyJob 
                  ? 'Manage candidates, review edits, or update your broadcast status in your dashboard.' 
                  : 'Fast-clone this role template with pre-filled title & category to post for your organization.'}
              </p>
            </div>

            {isMyJob ? (
              <Link
                to="/employer"
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Settings size={18} />
                <span>Manage Your Listing</span>
              </Link>
            ) : (
              <Link
                to={`/employer/post?title=${encodeURIComponent(job.title)}&category=${encodeURIComponent(job.category || '')}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-sira-orange hover:bg-[#E66E00] text-black rounded-2xl font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Copy size={18} />
                <span>Post Similar Role</span>
              </Link>
            )}
          </div>
        ) : (
          /* Candidate Apply Section + Smart Telegram Pitch Generator */
          <div className="p-6 sm:p-7 bg-blue-50/60 dark:bg-blue-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-sira-blue dark:text-blue-300 text-base sm:text-lg">Ready to apply?</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {job.applyMethod.type === 'telegram'
                    ? 'Start a direct chat with the hiring team on Telegram using our pre-filled pitch.'
                    : job.applyMethod.type === 'phone'
                    ? 'Call the employer directly at the number below.'
                    : 'Submit your application via the official external link.'}
                </p>
              </div>
            </div>

            {/* Smart Telegram Pitch Box for Telegram applicants */}
            {job.applyMethod.type === 'telegram' && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ⚡ Smart Application Pitch
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPitch}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {copiedPitch ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copiedPitch ? 'Copied to Clipboard!' : 'Copy Pitch'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 leading-relaxed">
                  "{pitchText}"
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={handleApply}
                className="flex-1 py-4 px-6 bg-sira-blue hover:bg-[#082046] text-white rounded-2xl font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {job.applyMethod.type === 'telegram' && <Send size={18} />}
                <span>
                  {job.applyMethod.type === 'telegram' 
                    ? `Apply via Telegram (${job.applyMethod.value})` 
                    : job.applyMethod.type === 'phone' 
                    ? `Call Now (${job.applyMethod.value})` 
                    : 'Apply on Official Site'}
                </span>
              </button>

              {job.applyMethod.type === 'telegram' && (
                <button
                  type="button"
                  onClick={handleCopyPitch}
                  className="sm:w-auto px-5 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  title="Copy application intro pitch"
                >
                  {copiedPitch ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  <span>{copiedPitch ? 'Copied' : 'Copy Pitch'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
