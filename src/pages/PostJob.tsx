import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Sparkles, Building2, User, EyeOff, CheckCircle2 } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobCategory } from '../types';

const QUICK_TEMPLATES: {
  label: string;
  title: string;
  category: JobCategory;
  description: string;
}[] = [
  {
    label: '🎨 Graphic Designer',
    title: 'Senior Graphic & Brand Designer',
    category: 'Creatives',
    description: `We are looking for a creative Graphic & Brand Designer to produce high-impact marketing visuals, print materials, and digital campaign assets.

Responsibilities:
• Design social media banners, posters, and digital campaign collateral.
• Create vector brand identities, packaging dielines, and presentation decks.
• Collaborate with marketing teams to maintain brand consistency.

Requirements:
• 2+ years of professional design experience.
• Proficiency with Adobe Photoshop, Illustrator, and Figma.
• Strong portfolio demonstrating typography and layout design.
• Great communication and rapid turnaround on revisions.`
  },
  {
    label: '📱 Social Media & Video',
    title: 'Social Media & Content Creator',
    category: 'Marketing & Sales',
    description: `We need an energetic Social Media Specialist and Video Creator to manage our online channels, produce viral TikTok/Reels content, and engage our community.

Responsibilities:
• Script, shoot, and edit 4-5 weekly short-form videos for TikTok and Instagram.
• Write captivating captions in Amharic and English.
• Monitor analytics, comments, and direct messages daily.

Requirements:
• Experience with CapCut, Premiere Pro, or mobile video editing tools.
• In-depth understanding of Ethiopian viral social media trends.
• Strong on-camera presence and creative storytelling ability.`
  },
  {
    label: '💻 Software Developer',
    title: 'Full Stack Web Developer',
    category: 'Developers',
    description: `Seeking a skilled Full Stack Developer to build and scale web applications, internal tools, and robust API endpoints.

Responsibilities:
• Build responsive frontend user interfaces using React/Next.js and Tailwind CSS.
• Design and maintain RESTful API backends with Node.js and PostgreSQL/MongoDB.
• Ensure application speed, mobile responsiveness, and security.

Requirements:
• 2+ years experience with React, TypeScript, and modern JavaScript.
• Experience with SQL or NoSQL database management.
• Clean code practices and Git version control experience.`
  },
  {
    label: '📈 Sales & Marketing',
    title: 'B2B Sales & Marketing Executive',
    category: 'Marketing & Sales',
    description: `Join our commercial team to drive client acquisition, manage strategic enterprise accounts, and expand market share.

Responsibilities:
• Prospect, pitch, and onboard corporate and SME clients.
• Conduct client product demonstrations and close commercial contracts.
• Coordinate promotional campaigns and partnership events.

Requirements:
• Proven track record in corporate sales or business development.
• Outstanding negotiation and presentation skills.
• Fluency in Amharic and English; self-motivated with target-driven mindset.`
  },
  {
    label: '📊 Accountant',
    title: 'Senior / Junior Accountant',
    category: 'Finance',
    description: `We are hiring a meticulous Accountant to manage bookkeeping, tax compliance, payroll, and financial reports.

Responsibilities:
• Maintain accurate general ledger records and reconcile monthly bank statements.
• Process monthly payroll and prepare tax declarations (VAT, TOT, Withholding).
• Prepare quarterly profit/loss statements and balance sheets.

Requirements:
• BA degree in Accounting, Finance, or related field.
• Practical experience with Peachtree, QuickBooks, or similar ERP software.
• Up-to-date knowledge of Ethiopian tax laws and ERCA filing procedures.`
  }
];

const SALARY_CHIPS = [
  '10,000 - 15,000 ETB',
  '15,000 - 30,000 ETB',
  '30,000 - 50,000 ETB',
  'Commission Based',
  'Negotiable'
];

export function PostJob() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addJob } = useJobs();
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Hiring Mode
  const defaultMode = profile?.employerType === 'private' ? 'private' : 'company';
  const [postingMode, setPostingMode] = useState<'company' | 'private'>(defaultMode);
  const [isConfidential, setIsConfidential] = useState(false);

  const initialTitle = searchParams.get('title') || '';
  const initialCategory = (searchParams.get('category') as JobCategory) || 'Developers';

  const [formData, setFormData] = useState({
    title: initialTitle,
    company: profile?.companyName || (profile?.employerType === 'private' ? 'Private Employer' : ''),
    location: profile?.companyLocation || 'Addis Ababa',
    category: initialCategory,
    salary: '',
    deadline: '',
    description: '',
    privateActivityDescription: profile?.privateActivityDescription || '',
    applyMethodType: 'telegram' as 'telegram' | 'phone' | 'link',
    applyMethodValue: profile?.phone ? (profile.phone.startsWith('@') ? profile.phone : `@${profile.displayName?.toLowerCase().replace(/\s+/g, '_') || 'contact'}`) : '@hr_contact',
  });

  // Pre-fill company if profile updates or changes
  useEffect(() => {
    if (profile) {
      if (postingMode === 'company' && profile.companyName) {
        setFormData(prev => ({
          ...prev,
          company: prev.company || profile.companyName || ''
        }));
      } else if (postingMode === 'private') {
        setFormData(prev => ({
          ...prev,
          company: 'Private Employer',
          privateActivityDescription: prev.privateActivityDescription || profile.privateActivityDescription || ''
        }));
      }
    }
  }, [profile, postingMode]);

  const handleApplyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      title: tpl.title,
      category: tpl.category,
      description: tpl.description
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in or create an employer account before posting a job.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    const isPrivate = postingMode === 'private';
    const finalCompanyName = isPrivate 
      ? 'Private Employer'
      : (formData.company.trim() || profile?.companyName || 'Verified Employer');

    try {
      await addJob({
        title: formData.title.trim(),
        company: finalCompanyName,
        location: formData.location.trim() || 'Addis Ababa',
        category: formData.category,
        salary: formData.salary.trim() || undefined,
        deadline: formData.deadline || new Date(Date.now() + 86400000 * 20).toISOString(),
        description: formData.description.trim(),
        applyMethod: {
          type: formData.applyMethodType,
          value: formData.applyMethodValue.trim()
        },
        isConfidential: isConfidential,
        isPrivateEmployer: isPrivate,
        privateEmployerContext: isPrivate ? (formData.privateActivityDescription.trim() || profile?.privateActivityDescription || 'Independent Hiring') : undefined
      });
      navigate('/employer');
    } catch (err) {
      console.error("Failed to post job:", err);
      alert("Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold mb-2">
            <Sparkles size={14} className="text-sira-orange" />
            <span>Smart Fast-Track Job Posting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C5F] dark:text-white">Post a New Job</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            Pre-fills your organization info and auto-syndicates to SiraGo's Telegram community upon approval.
          </p>
        </div>

        {/* Top Selector: [ 🏢 Use My Company ] vs [ 👤 Post as Private / Individual ] */}
        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Employer Listing Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setPostingMode('company');
                setFormData(prev => ({ ...prev, company: profile?.companyName || '' }));
              }}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                postingMode === 'company'
                  ? 'border-blue-500 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <span className="font-bold text-sm block">🏢 Use My Company</span>
                <span className="text-xs text-slate-400 block truncate">
                  {profile?.companyName ? `Auto-filled: ${profile.companyName}` : 'Company brand listing'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setPostingMode('private');
                setFormData(prev => ({ ...prev, company: 'Private Employer' }));
              }}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                postingMode === 'private'
                  ? 'border-orange-500 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div>
                <span className="font-bold text-sm block">👤 Post as Private / Individual</span>
                <span className="text-xs text-slate-400 block">No trade license required</span>
              </div>
            </button>
          </div>
        </div>

        {/* 1-Tap Quick-Fill Role Templates */}
        <div className="mb-8">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
            <Sparkles size={14} className="text-sira-orange" />
            <span>1-Tap Quick-Fill Role Templates</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Job Title</label>
              <input 
                required 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all" 
                placeholder="e.g. Senior Frontend Developer" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {postingMode === 'private' ? 'Display Name on Listing' : 'Company Name'}
                </label>
                <input 
                  required 
                  name="company" 
                  value={postingMode === 'private' ? 'Private Employer' : formData.company} 
                  onChange={handleChange} 
                  disabled={postingMode === 'private'}
                  type="text" 
                  className={`w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all ${
                    postingMode === 'private' ? 'bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed font-medium' : 'bg-white dark:bg-slate-900'
                  }`} 
                  placeholder="Your company name" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select 
                  required 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all cursor-pointer"
                >
                  <option value="Developers">Developers</option>
                  <option value="Creatives">Creatives</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                  <option value="Management">Management</option>
                  <option value="Operations">Operations</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* If Private Employer Mode: Context Subtitle input */}
            {postingMode === 'private' && (
              <div className="p-4 bg-orange-50/60 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                <label className="block text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider mb-1">
                  Private Hiring Context / Subtitle
                </label>
                <input
                  type="text"
                  name="privateActivityDescription"
                  value={formData.privateActivityDescription}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-orange-200 dark:border-orange-800 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="e.g. Independent Retail Owner, Personal Creative Project"
                />
                <span className="text-[11px] text-orange-700/80 dark:text-orange-400 mt-1 block">
                  Displayed to candidates as subtitle under "Private Employer".
                </span>
              </div>
            )}

            {/* Confidential Hiring Checkbox */}
            {postingMode === 'company' && (
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <EyeOff size={16} className="text-slate-500" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Post Confidentially (Display "Confidential Employer (Verified)" publicly while keeping real name visible to Admin)
                  </span>
                </div>
              </label>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                <input 
                  required 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all" 
                  placeholder="e.g. Addis Ababa or Remote" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Salary <span className="font-normal text-slate-400">(Optional)</span></label>
                <input 
                  name="salary" 
                  value={formData.salary} 
                  onChange={handleChange} 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all" 
                  placeholder="e.g. 30,000 - 50,000 ETB" 
                />
                {/* Quick-tap ETB chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SALARY_CHIPS.map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, salary: chip }))}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Application Deadline</label>
              <input 
                required 
                name="deadline" 
                value={formData.deadline} 
                onChange={handleChange} 
                type="date" 
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Job Description</label>
              <textarea 
                required 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={6} 
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all resize-y" 
                placeholder="Describe responsibilities, requirements, and benefits..." 
              />
            </div>

            <div className="p-5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Application Method</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(['telegram', 'phone', 'link'] as const).map(type => (
                  <label 
                    key={type} 
                    className={`cursor-pointer px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border text-center font-bold transition-all text-xs sm:text-sm ${
                      formData.applyMethodType === type 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm' 
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <input type="radio" name="applyMethodType" value={type} checked={formData.applyMethodType === type} onChange={handleChange} className="sr-only" />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {formData.applyMethodType === 'telegram' && 'Telegram Username (e.g. @company_hr)'}
                  {formData.applyMethodType === 'phone' && 'Phone Number (+251...)'}
                  {formData.applyMethodType === 'link' && 'Application Link URL (https://...)'}
                </label>
                <input 
                  required 
                  name="applyMethodValue" 
                  value={formData.applyMethodValue} 
                  onChange={handleChange} 
                  type={formData.applyMethodType === 'link' ? 'url' : 'text'} 
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all" 
                  placeholder={
                    formData.applyMethodType === 'telegram' ? '@username' : 
                    formData.applyMethodType === 'phone' ? '+251...' : 
                    'https://...'
                  } 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full py-4 bg-sira-orange text-black rounded-2xl font-extrabold text-base hover:bg-[#E66E00] transition-all shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={20} className="animate-spin" />}
              {submitting ? 'Publishing Listing...' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
