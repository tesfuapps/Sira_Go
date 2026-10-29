import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Sparkles, Filter, X, Award } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { TalentCard } from '../components/TalentCard';
import { TalentCategory } from '../types';

const TALENT_CATEGORIES: ('All' | TalentCategory)[] = [
  'All',
  'Graphic Design',
  'Print & Packaging',
  'UI/UX Design',
  'Video & Motion',
  'Software Dev',
  'Digital Marketing'
];

export function TalentDirectory() {
  const { talents } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | TalentCategory>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<'All' | 'Freelance' | 'Full-Time' | 'Both'>('All');
  const [onlyTopRated, setOnlyTopRated] = useState(false);

  const filteredTalents = useMemo(() => {
    return (talents || []).filter((talent) => {
      // Must be approved
      if (talent.status && talent.status !== 'Approved') return false;

      // Category filter
      if (selectedCategory !== 'All' && talent.category !== selectedCategory) {
        return false;
      }

      // Top Rated filter
      if (onlyTopRated && (!talent.badges?.includes('Top Rated') && (talent.rating || 0) < 4.8)) {
        return false;
      }

      // Availability filter
      if (selectedAvailability !== 'All') {
        if (selectedAvailability === 'Both') {
          if (talent.availability !== 'Both') return false;
        } else if (talent.availability !== 'Both' && talent.availability !== selectedAvailability) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = talent.fullName.toLowerCase().includes(query);
        const matchTitle = talent.title.toLowerCase().includes(query);
        const matchBio = talent.bio?.toLowerCase().includes(query);
        const matchLocation = talent.location.toLowerCase().includes(query);
        const matchSkills = (talent.skills || []).some(s => s.toLowerCase().includes(query));
        const matchProjects = (talent.projects || []).some(p => p.title.toLowerCase().includes(query));

        if (!matchName && !matchTitle && !matchBio && !matchLocation && !matchSkills && !matchProjects) {
          return false;
        }
      }

      return true;
    });
  }, [talents, searchQuery, selectedCategory, selectedAvailability, onlyTopRated]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAvailability('All');
    setOnlyTopRated(false);
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedAvailability !== 'All' || onlyTopRated;

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Showcase Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0B2C5F] via-[#111827] to-[#1E293B] p-8 md:p-12 text-white border border-blue-500/20 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-4">
            <Sparkles size={13} className="text-blue-400" /> Ethiopian Talent & Portfolio Directory
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Exceptional <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
              Creative & Technical Talent
            </span>
          </h1>
          <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl">
            Browse verified portfolios of Graphic Designers, Brand & Packaging Specialists, UI/UX Engineers, and Video Artists ready for freelance commissions and full-time hiring across Ethiopia.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/post-portfolio"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Showcase Your Portfolio
            </Link>
            <a
              href="#talent-grid"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold text-sm backdrop-blur-sm transition-colors border border-white/10"
            >
              Explore {talents.length} Creators
            </a>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div id="talent-grid" className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-[#1F2937] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill (e.g. Illustrator, React), specialty, or title..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlyTopRated(!onlyTopRated)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                onlyTopRated 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-500/40'
              }`}
            >
              <Award size={14} className={onlyTopRated ? "text-amber-400 fill-amber-400/20" : "text-amber-500"} />
              <span>Top Rated</span>
            </button>

            {/* Availability Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap flex items-center gap-1">
                <Filter size={13} /> Availability:
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value as any)}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-semibold cursor-pointer transition-colors"
              >
                <option value="All">All Types</option>
                <option value="Freelance">Freelance Only</option>
                <option value="Full-Time">Full-Time Only</option>
                <option value="Both">Both (Flexible)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 hide-scrollbar">
          {TALENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results summary and clear filters */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <span>
            Showing <strong className="text-gray-900 dark:text-white">{filteredTalents.length}</strong> {filteredTalents.length === 1 ? 'professional' : 'professionals'}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </span>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Talent Cards Grid */}
      {filteredTalents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTalents.map((talent) => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-[#1F2937] p-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Search size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No matching talent found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            We couldn't find any professionals matching your search criteria. Try adjusting your filters or search keywords.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Bottom CTA Banner */}
      <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-sky-900/20 p-8 rounded-3xl border border-blue-500/25 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Are you a Designer, Developer, or Creative in Ethiopia?
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Create your free public portfolio showcase on Sira Go. Put your work in front of hundreds of hiring employers and clients looking to hire talent directly via Telegram and phone.
          </p>
        </div>
        <Link
          to="/post-portfolio"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md transition-all whitespace-nowrap flex items-center gap-2"
        >
          <Plus size={16} /> Showcase Yourself
        </Link>
      </div>
    </div>
  );
}
