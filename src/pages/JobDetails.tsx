import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Building2, Banknote, Calendar, ArrowLeft, Send, Bookmark, Share2 } from 'lucide-react';
import { useJobs } from '../context/JobContext';

export function JobDetails() {
  const { id } = useParams();
  const { jobs, savedJobIds, toggleSavedJob } = useJobs();
  const job = jobs.find(j => j.id === id);

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
        <Link to="/" className="text-sira-blue hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  const handleApply = () => {
    if (job.applyMethod.type === 'telegram') {
      const username = job.applyMethod.value.replace('@', '');
      window.open(`https://t.me/${username}`, '_blank');
    } else if (job.applyMethod.type === 'phone') {
      window.location.href = `tel:${job.applyMethod.value}`;
    } else {
      window.open(job.applyMethod.value, '_blank');
    }
  };

  const handleShare = () => {
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

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-sira-blue mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to jobs
      </Link>
      
      <div className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-white/60 dark:border-gray-700/80">
        <div className="mb-8 pb-8 border-b border-gray-100">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B2C5F] shrink">{job.title}</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="relative group p-3 rounded-full shrink-0 transition-colors bg-gray-50 text-gray-500 hover:text-sira-blue hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                aria-label="Share this job"
              >
                <Share2 size={24} />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs whitespace-nowrap py-1.5 px-2.5 rounded shadow z-20">
                  Share
                  <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
              </button>

              <button 
                onClick={() => toggleSavedJob(job.id)}
                className={`relative group p-3 rounded-full shrink-0 transition-colors ${savedJobIds.includes(job.id) ? 'bg-sira-orange/10 text-sira-orange hover:bg-sira-orange/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'}`}
                aria-label={savedJobIds.includes(job.id) ? "Remove from bookmarks" : "Save this job"}
              >
                <Bookmark size={24} fill={savedJobIds.includes(job.id) ? 'currentColor' : 'none'} />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs whitespace-nowrap py-1.5 px-2.5 rounded shadow z-20">
                  {savedJobIds.includes(job.id) ? "Remove from saved" : "Save job"}
                  <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <Building2 size={18} className="text-sira-blue" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{job.location}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2">
                <Banknote size={18} />
                <span>{job.salary}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sira-orange">
              <Calendar size={18} />
              <span className="font-medium">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="prose prose-gray max-w-none mb-12 dark:prose-dark">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Job Description</h3>
          <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed">{job.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-blue-50/50 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div>
            <h4 className="font-semibold text-sira-blue">Ready to apply?</h4>
            <p className="text-sm text-gray-600">
              {job.applyMethod.type === 'telegram' ? 'Click below to start a direct chat with HR.' : 
               job.applyMethod.type === 'phone' ? 'Call the employer directly to apply.' :
               'You will be redirected to the employer\'s website.'}
            </p>
          </div>
          <button 
            onClick={handleApply}
            className="w-full sm:w-auto px-8 py-4 bg-sira-blue text-white rounded-full font-bold hover:bg-[#082046] transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {job.applyMethod.type === 'telegram' && <Send size={18} />}
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
