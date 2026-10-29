import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Banknote, 
  Briefcase, 
  Star, 
  CheckCircle2, 
  Award, 
  Zap 
} from 'lucide-react';
import { TalentPortfolio } from '../types';

interface TalentCardProps {
  talent: TalentPortfolio;
}

export function TalentCard({ talent }: TalentCardProps) {
  const previewProjects = (talent.projects || []).slice(0, 3);
  const topSkills = (talent.skills || []).slice(0, 3);
  const remainingSkillsCount = Math.max(0, (talent.skills?.length || 0) - 3);
  const ratingValue = (talent.rating ?? 5.0).toFixed(1);
  const reviewsCount = talent.reviewCount ?? talent.reviews?.length ?? 0;

  return (
    <div className="group bg-white dark:bg-[#111827] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-[#1F2937] shadow-sm hover:shadow-md dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* 3-Thumbnail Preview Strip at the Top (h-24) */}
        <div className="relative h-24 bg-gray-100 dark:bg-gray-800/80 overflow-hidden">
          {previewProjects.length > 0 ? (
            <div className={`grid h-full gap-0.5 ${
              previewProjects.length === 1 ? 'grid-cols-1' :
              previewProjects.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {previewProjects.map((project, idx) => (
                <div key={idx} className="relative h-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600/10 via-sky-600/10 to-indigo-600/10 flex items-center justify-center text-[11px] text-gray-400">
              Portfolio
            </div>
          )}

          {/* Featured Spot Corner Badge */}
          {(talent.isFeatured || talent.badges?.includes('Featured Spot')) && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
              <Sparkles size={10} className="fill-white" /> Featured
            </div>
          )}
        </div>

        {/* Creator Info Body (p-3.5) */}
        <div className="p-3.5 pt-0">
          <div className="flex items-end justify-between -mt-5 mb-2">
            <div className="relative">
              {talent.avatarUrl ? (
                <img
                  src={talent.avatarUrl}
                  alt={talent.fullName}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-[#111827] shadow-sm bg-white dark:bg-gray-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl border-2 border-white dark:border-[#111827] shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm">
                  {talent.fullName.charAt(0)}
                </div>
              )}
            </div>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {talent.availability}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between gap-1.5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {talent.fullName}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span>{ratingValue}</span>
                <span className="text-gray-400 font-medium text-[9px]">
                  ({reviewsCount})
                </span>
              </div>
            </div>

            {/* Title */}
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
              {talent.title}
            </p>

            {/* Trust Badges */}
            {talent.badges && talent.badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                {talent.badges.includes('Verified Pro') && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
                {talent.badges.includes('Top Rated') && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Award size={10} /> Top Rated
                  </span>
                )}
                {talent.badges.includes('Fast Responder') && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Zap size={10} /> Fast
                  </span>
                )}
              </div>
            )}

            {/* Location & Rate Info */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2">
              <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
                <MapPin size={11} className="text-gray-400 shrink-0" />
                <span className="truncate">{talent.location}</span>
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-200 shrink-0 text-emerald-600 dark:text-emerald-400">
                {talent.rateInfo}
              </span>
            </div>

            {/* Skills Pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {topSkills.map((skill, idx) => {
                const count = talent.skillEndorsements?.[skill];
                return (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 inline-flex items-center gap-1"
                  >
                    <span>{skill}</span>
                    {count !== undefined && count > 0 && (
                      <span className="text-blue-500 font-bold text-[9px]">
                        • {count}
                      </span>
                    )}
                  </span>
                );
              })}
              {remainingSkillsCount > 0 && (
                <span className="text-[10px] text-gray-400 px-1 py-0.5 self-center">
                  +{remainingSkillsCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-2.5 px-3.5 border-t border-gray-100 dark:border-[#1F2937]/60 flex items-center justify-between">
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Briefcase size={11} /> {(talent.projects || []).length} Works
        </span>
        <Link
          to={`/talent/${talent.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Portfolio <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
