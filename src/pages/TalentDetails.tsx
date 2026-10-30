import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Banknote, 
  Send, 
  Phone, 
  ExternalLink, 
  Sparkles, 
  Briefcase, 
  X, 
  Maximize2,
  Star,
  CheckCircle2,
  Award,
  Zap,
  Check,
  ThumbsUp,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { TalentProject } from '../types';

export function TalentDetails() {
  const { id } = useParams<{ id: string }>();
  const { talents, endorseTalentSkill, addTalentReview } = useJobs();
  const [zoomedProject, setZoomedProject] = useState<TalentProject | null>(null);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRole, setReviewRole] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(false);

  // Endorsements Tracker State (to reflect instant 1-tap feedback)
  const [endorsedSkills, setEndorsedSkills] = useState<Record<string, boolean>>({});

  const talent = (talents || []).find((t) => t.id === id);

  // Initialize endorsed skills from localStorage
  useEffect(() => {
    if (!talent) return;
    const initialEndorsed: Record<string, boolean> = {};
    (talent.skills || []).forEach(skill => {
      const key = `sira_go_endorsed_${talent.id}_${skill}`;
      if (localStorage.getItem(key)) {
        initialEndorsed[skill] = true;
      }
    });
    setEndorsedSkills(initialEndorsed);
  }, [talent?.id, talent?.skills]);

  if (!talent) {
    return (
      <div className="text-center py-24 bg-white dark:bg-[#111827] border border-gray-100 dark:border-[#1F2937] rounded-3xl max-w-xl mx-auto my-12 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Talent Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          This creator profile may have been removed or the link is incorrect.
        </p>
        <Link 
          to="/talent" 
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors inline-block text-sm"
        >
          Return to Talent Directory
        </Link>
      </div>
    );
  }

  const handleEndorse = async (skill: string) => {
    if (endorsedSkills[skill]) return;
    setEndorsedSkills(prev => ({ ...prev, [skill]: true }));
    await endorseTalentSkill(talent.id, skill);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Please enter your name and a brief review comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      await addTalentReview(talent.id, {
        reviewerName: reviewName,
        reviewerRole: reviewRole || undefined,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewName('');
      setReviewRole('');
      setReviewComment('');
      setReviewRating(5);
      setReviewSuccessMessage(true);
      setTimeout(() => setReviewSuccessMessage(false), 4000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleContactTelegram = () => {
    if (!talent.telegramUsername) return;
    const cleanHandle = talent.telegramUsername.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').trim();
    const introText = `Hello ${talent.fullName}! I discovered your portfolio on Sira Go and would like to discuss a project with you.`;
    window.open(`https://t.me/${cleanHandle}?text=${encodeURIComponent(introText)}`, '_blank');
  };

  const ratingValue = (talent.rating ?? 5.0).toFixed(1);
  const reviewsCount = talent.reviewCount ?? talent.reviews?.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-20">
      {/* Back Link */}
      <Link 
        to="/talent" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft size={16} /> Back to all talents
      </Link>

      {/* Creator Profile Header Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl overflow-hidden border border-gray-100 dark:border-[#1F2937] shadow-lg">
        {/* Banner Cover */}
        <div className="h-44 md:h-56 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 relative">
          {(talent.isFeatured || talent.badges?.includes('Featured Spot')) && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 z-10">
              <Sparkles size={14} className="fill-white" /> Featured Spot
            </div>
          )}
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20 mb-6">
            {/* Avatar */}
            <div className="flex items-end gap-5">
              {talent.avatarUrl ? (
                <img
                  src={talent.avatarUrl}
                  alt={talent.fullName}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover border-4 border-white dark:border-[#111827] shadow-xl bg-white dark:bg-gray-800"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-white dark:border-[#111827] shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-4xl">
                  {talent.fullName.charAt(0)}
                </div>
              )}

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                    {talent.fullName}
                  </h1>
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-600 dark:text-gray-300">
                  {talent.title}
                </p>

                {/* Star Rating & Reviews Badge */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-extrabold text-xs">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>{ratingValue}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    ({reviewsCount} {reviewsCount === 1 ? 'review' : 'client reviews'})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {talent.telegramUsername && (
                <button
                  onClick={handleContactTelegram}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send size={15} /> Contact on Telegram
                </button>
              )}

              {talent.phone && (
                <a
                  href={`tel:${talent.phone}`}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl font-bold text-xs transition-colors flex items-center gap-2"
                >
                  <Phone size={15} /> Call Now
                </a>
              )}

              {talent.externalPortfolioUrl && (
                <a
                  href={talent.externalPortfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl transition-colors"
                  title="External Portfolio Link"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Trust Badges Bar */}
          {talent.badges && talent.badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-[#1F2937]">
              <span className="text-xs font-bold text-gray-400 mr-1">Trust Badges:</span>
              {talent.badges.includes('Verified Pro') && (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm">
                  <CheckCircle2 size={13} className="text-blue-400" /> Verified Pro
                </span>
              )}
              {talent.badges.includes('Top Rated') && (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
                  <Award size={13} className="text-amber-400" /> Top Rated Creator
                </span>
              )}
              {talent.badges.includes('Fast Responder') && (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
                  <Zap size={13} className="text-emerald-400" /> Fast Responder
                </span>
              )}
            </div>
          )}

          {/* Quick Details Pills */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
            <span className="font-bold px-3 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {talent.category}
            </span>

            <span className="font-bold px-3 py-1 rounded-xl bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
              Availability: {talent.availability === 'Both' ? 'Freelance & Full-Time' : talent.availability}
            </span>

            <div className="flex items-center gap-1.5 font-medium">
              <MapPin size={14} className="text-gray-400" />
              <span>{talent.location}</span>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <Banknote size={14} />
              <span>{talent.rateInfo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio / About Section */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#1F2937] shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          About the Creator
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
          {talent.bio}
        </p>
      </div>

      {/* Interactive 1-Tap Skill Endorsements Section */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#1F2937] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-[#1F2937] pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <ThumbsUp size={18} className="text-blue-500" />
              Skills & 1-Tap Endorsements
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Click any skill below to endorse {talent.fullName.split(' ')[0]}'s technical expertise
            </p>
          </div>
          <span className="text-xs text-gray-400 font-semibold self-start sm:self-auto">
            1 endorsement per skill
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {(talent.skills || []).map((skill, idx) => {
            const isEndorsed = !!endorsedSkills[skill];
            const baseCount = talent.skillEndorsements?.[skill] ?? 0;
            const currentCount = baseCount + (isEndorsed && !talent.skillEndorsements?.[skill] ? 1 : 0);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleEndorse(skill)}
                disabled={isEndorsed}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer text-left ${
                  isEndorsed
                    ? 'bg-blue-600/15 border-blue-500/50 text-white cursor-default'
                    : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/60 hover:border-blue-500/50 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{skill}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    {currentCount} {currentCount === 1 ? 'endorsement' : 'endorsements'}
                  </span>
                </div>

                <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                  isEndorsed
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  {isEndorsed ? (
                    <>
                      <Check size={12} />
                      <span>Endorsed</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp size={11} />
                      <span>+1 Endorse</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Project Showcase Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase size={22} className="text-blue-500" />
              Portfolio Showcase & Case Studies
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Click on any project image to expand and view details
            </p>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {(talent.projects || []).length} Projects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(talent.projects || []).map((project, idx) => (
            <div
              key={idx}
              onClick={() => setZoomedProject(project)}
              className="group bg-white dark:bg-[#111827] rounded-3xl overflow-hidden border border-gray-100 dark:border-[#1F2937] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3.5 py-2 bg-white/90 text-gray-900 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                    <Maximize2 size={13} /> Zoom
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                  {project.title}
                </h4>

                {project.linkUrl && (
                  <a
                    href={project.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                    title="Open Project Link"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Ratings & Reviews Section */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#1F2937] shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-[#1F2937] pb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Star size={20} className="fill-amber-400 text-amber-400" />
              Client Ratings & Feedback
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Verified testimonials and ratings from past clients and employers
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 px-6 rounded-2xl border border-gray-200 dark:border-gray-700 shrink-0">
            <div className="text-4xl font-extrabold text-gray-900 dark:text-white">
              {ratingValue}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={15} 
                    className={i < Math.round(Number(ratingValue)) ? "fill-amber-400 text-amber-400" : "text-gray-600"} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-bold block mt-0.5">
                {reviewsCount} {reviewsCount === 1 ? 'Client Review' : 'Client Reviews'}
              </span>
            </div>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            Client Testimonials ({talent.reviews?.length || 0})
          </h3>

          {(!talent.reviews || talent.reviews.length === 0) ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-400 font-medium">
                No reviews yet. Be the first to share your experience working with {talent.fullName}!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {talent.reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {rev.reviewerName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                            {rev.reviewerName}
                          </h4>
                          {rev.reviewerRole && (
                            <p className="text-[10px] text-gray-400 font-medium">
                              {rev.reviewerRole}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <span className="text-[10px] text-gray-500 pt-2 block border-t border-gray-100 dark:border-gray-700/40">
                    {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rate & Endorse Form */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={17} className="text-blue-500" />
              Rate & Review This Professional
            </h3>
            {reviewSuccessMessage && (
              <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 size={14} /> Review published!
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Clickable Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Star
                      size={22}
                      className={
                        (hoverRating ? star <= hoverRating : star <= reviewRating)
                          ? "fill-amber-400 text-amber-400 transition-colors"
                          : "text-slate-400 dark:text-slate-600 transition-colors"
                      }
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-amber-500 dark:text-amber-400 ml-2">
                  {hoverRating || reviewRating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Name / Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Samuel Kebede"
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Role / Company <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={reviewRole}
                  onChange={(e) => setReviewRole(e.target.value)}
                  placeholder="e.g. Marketing Director, Addis Tech"
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Review Feedback & Experience <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience working with this professional, quality of delivery, communication, etc..."
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs transition-colors resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck size={14} />
                {submittingReview ? 'Submitting Review...' : 'Submit Rating & Review'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {zoomedProject && (
        <div 
          onClick={() => setZoomedProject(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-[#111827] rounded-3xl overflow-hidden max-w-3xl w-full border border-gray-800 shadow-2xl"
          >
            <button
              onClick={() => setZoomedProject(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={zoomedProject.imageUrl}
                alt={zoomedProject.title}
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
                }}
              />
            </div>

            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  {zoomedProject.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By {talent.fullName} • {talent.category}
                </p>
              </div>

              {zoomedProject.linkUrl && (
                <a
                  href={zoomedProject.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  View Case Study <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Contact Action Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-sky-900/20 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Interested in working with {talent.fullName}?
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Reach out directly to hire for freelance projects, brand design, web applications, or full-time opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {talent.telegramUsername && (
            <button
              onClick={handleContactTelegram}
              className="flex-1 md:flex-initial px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={15} /> Message via Telegram
            </button>
          )}

          {talent.phone && (
            <a
              href={`tel:${talent.phone}`}
              className="px-5 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-900 dark:text-white rounded-2xl font-bold text-xs transition-colors border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5"
            >
              <Phone size={15} /> Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
