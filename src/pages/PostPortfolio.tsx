import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Send, 
  Phone, 
  Globe, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2,
  Briefcase,
  Layers,
  ExternalLink
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { TalentCategory, TalentProject } from '../types';

export function PostPortfolio() {
  const navigate = useNavigate();
  const { addTalent } = useJobs();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TalentCategory>('Graphic Design');
  const [location, setLocation] = useState('Addis Ababa');
  const [availability, setAvailability] = useState<'Freelance' | 'Full-Time' | 'Both'>('Both');
  const [rateInfo, setRateInfo] = useState('From 3,500 ETB / project');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [externalPortfolioUrl, setExternalPortfolioUrl] = useState('');

  // Portfolio Projects (up to 6)
  const [projects, setProjects] = useState<TalentProject[]>([
    {
      title: '',
      imageUrl: '',
      linkUrl: ''
    }
  ]);

  const handleAddProject = () => {
    if (projects.length >= 6) {
      alert('You can add up to 6 portfolio projects.');
      return;
    }
    setProjects(prev => [...prev, { title: '', imageUrl: '', linkUrl: '' }]);
  };

  const handleRemoveProject = (index: number) => {
    if (projects.length === 1) {
      alert('Please keep at least one project showcase slot.');
      return;
    }
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index: number, field: keyof TalentProject, value: string) => {
    setProjects(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const fillSampleData = () => {
    setFullName('Yared Tadesse');
    setTitle('Senior Brand & Graphic Designer');
    setCategory('Graphic Design');
    setLocation('Addis Ababa');
    setAvailability('Both');
    setRateInfo('From 4,000 ETB / project');
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setBio('Creative art director and branding specialist with 6+ years creating visual identities, packaging, and digital branding for leading Ethiopian consumer businesses and startups.');
    setSkillsInput('Brand Identity, Logo Design, Packaging, Adobe Illustrator, Photoshop, Typography');
    setTelegramUsername('@yared_art');
    setPhone('+251911448899');
    setExternalPortfolioUrl('https://behance.net/yared_t');
    setProjects([
      {
        title: 'Habesha Coffee Packaging System',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        linkUrl: 'https://behance.net'
      },
      {
        title: 'Fintech Mobile Identity & Icons',
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        linkUrl: 'https://dribbble.com'
      },
      {
        title: 'Addis Fashion Week Visual Campaign',
        imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
        linkUrl: 'https://instagram.com'
      }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !title.trim() || !bio.trim()) {
      alert('Please fill out all required basic information fields.');
      return;
    }

    // Filter projects that have at least title or imageUrl
    const validProjects = projects
      .map(p => ({
        title: p.title.trim() || 'Portfolio Work',
        imageUrl: p.imageUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        linkUrl: p.linkUrl?.trim() || undefined
      }))
      .filter(p => p.imageUrl.length > 0);

    if (validProjects.length === 0) {
      alert('Please provide at least 1 portfolio project with an image URL.');
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    setSubmitting(true);

    try {
      await addTalent({
        userId: user?.uid || 'guest-creator',
        status: 'Approved',
        fullName: fullName.trim(),
        title: title.trim(),
        category,
        location: location.trim() || 'Addis Ababa',
        availability,
        rateInfo: rateInfo.trim() || 'Open to Offers',
        bio: bio.trim(),
        skills: skillsArray.length > 0 ? skillsArray : ['Creative Specialist', 'Professional'],
        projects: validProjects,
        avatarUrl: avatarUrl.trim() || undefined,
        telegramUsername: telegramUsername.trim() || undefined,
        phone: phone.trim() || undefined,
        externalPortfolioUrl: externalPortfolioUrl.trim() || undefined,
        isFeatured: true,
        rating: 5.0,
        reviewCount: 0,
        reviews: [],
        badges: ['Verified Pro'],
        skillEndorsements: (skillsArray.length > 0 ? skillsArray : ['Creative Specialist', 'Professional']).reduce((acc, s) => ({ ...acc, [s]: 1 }), {})
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/talent');
      }, 1500);
    } catch (err) {
      console.error('Failed to post portfolio:', err);
      alert('An error occurred while saving your portfolio showcase.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Showcase Published!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base mb-6 max-w-md">
            Your portfolio is now live on Sira Go's Talent Directory. Clients can view your visual gallery and contact you directly.
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold animate-pulse">
            Redirecting to Talent Directory...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/talent')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Directory
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span>Showcase Your Portfolio</span>
            <span className="text-xs px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-md">
              Creator Spotlight
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Put your creative & engineering work in front of hundreds of companies hiring in Ethiopia.
          </p>
        </div>

        <button
          type="button"
          onClick={fillSampleData}
          className="self-start sm:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sira-orange border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles size={14} /> Autofill Sample Creator
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Professional Identity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-blue-600/10 text-blue-500 rounded-xl">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">1. Professional Identity</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tell clients who you are and what you specialize in</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Liya Kebede"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Professional Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Graphic & Brand Designer"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TalentCategory)}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors cursor-pointer"
              >
                <option value="Graphic Design">Graphic Design</option>
                <option value="Print & Packaging">Print & Packaging</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Video & Motion">Video & Motion</option>
                <option value="Software Dev">Software Dev</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Addis Ababa or Remote"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Availability
              </label>
              <select
                value={availability}
                onChange={e => setAvailability(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors cursor-pointer"
              >
                <option value="Freelance">Freelance Only</option>
                <option value="Full-Time">Full-Time Only</option>
                <option value="Both">Freelance & Full-Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Rate / Pricing Info
              </label>
              <input
                type="text"
                value={rateInfo}
                onChange={e => setRateInfo(e.target.value)}
                placeholder="e.g. From 3,500 ETB / project or Open to Offers"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Profile Photo / Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://... (Leave blank for auto-generated avatar)"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Bio / About You <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Highlight your design/dev background, industry experience, tools you master, and why clients love working with you..."
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Core Skills & Tools (Comma-separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="e.g. Brand Identity, Adobe Illustrator, Packaging, Typography, Figma"
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Section 2: Contact & External Profiles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-sira-orange/15 text-sira-orange rounded-xl">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">2. Direct Contact Channels</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enable employers & clients to contact or hire you instantly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Send size={14} className="text-blue-500" /> Telegram Handle
              </label>
              <input
                type="text"
                value={telegramUsername}
                onChange={e => setTelegramUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-500" /> Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe size={14} className="text-purple-500" /> External Portfolio URL
              </label>
              <input
                type="url"
                value={externalPortfolioUrl}
                onChange={e => setExternalPortfolioUrl(e.target.value)}
                placeholder="Behance, Dribbble, GitHub or Web"
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-2xl px-4 py-3 text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Portfolio Visual Projects (Up to 6) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-600/10 text-purple-500 rounded-xl">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">3. Portfolio Visual Projects (Up to 6)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add high-resolution image links to showcase your best pieces</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddProject}
              disabled={projects.length >= 6}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Plus size={14} /> Add Another Project ({projects.length}/6)
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl relative space-y-3 group hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} /> Project #{idx + 1}
                  </span>
                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Remove this project"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Project Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={proj.title}
                      onChange={e => handleProjectChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Brand Identity System"
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Image URL (Direct link) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={proj.imageUrl}
                      onChange={e => handleProjectChange(idx, 'imageUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Live Project Link <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={proj.linkUrl || ''}
                      onChange={e => handleProjectChange(idx, 'linkUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                    />
                  </div>
                </div>

                {/* Quick Thumbnail Preview */}
                {proj.imageUrl && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/10 dark:bg-black/40 border border-slate-300 dark:border-slate-700 shrink-0">
                      <img
                        src={proj.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {proj.title || 'Preview Thumbnail'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/talent')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-sm transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sira-orange hover:opacity-95 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Publishing Showcase...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Publish Portfolio Showcase</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
