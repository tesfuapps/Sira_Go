import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Loader2, Award, Building2, MapPin, Briefcase } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const { user, profile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    employerType: 'company' as 'company' | 'private',
    companyName: '',
    companyIndustry: '',
    companyLocation: '',
    privateActivityDescription: '',
    hasTradeLicense: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        employerType: profile.employerType || (profile.role === 'employer' ? 'company' : 'company'),
        companyName: profile.companyName || '',
        companyIndustry: profile.companyIndustry || '',
        companyLocation: profile.companyLocation || '',
        privateActivityDescription: profile.privateActivityDescription || '',
        hasTradeLicense: profile.hasTradeLicense || false
      });
    }
  }, [user, profile, navigate]);

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-sira-blue mb-4" />
        <p className="text-gray-500 font-medium">Redirecting to login...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: formData.displayName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        ...(profile.role === 'employer' ? {
          employerType: formData.employerType,
          companyName: formData.employerType === 'company' ? (formData.companyName.trim() || undefined) : 'Private Employer',
          companyIndustry: formData.employerType === 'company' ? (formData.companyIndustry.trim() || undefined) : undefined,
          companyLocation: formData.companyLocation.trim() || undefined,
          privateActivityDescription: formData.employerType === 'private' ? (formData.privateActivityDescription.trim() || undefined) : undefined,
          hasTradeLicense: formData.employerType === 'company'
        } : {})
      });
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isEmployer = profile.role === 'employer';

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-200 dark:border-[#1F2937] overflow-hidden">
        {/* Profile Header Background */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-sira-blue via-blue-700 to-[#1a4b9c]"></div>
        
        <div className="px-4 sm:px-8 pb-8">
          {/* Avatar & Header Section with Mobile Responsive Wrap */}
          <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-12 sm:-mt-16 mb-6 gap-4">
            <div className="flex items-center sm:items-end gap-3 sm:gap-5">
              {/* Resized avatar for mobile so it fits cleanly */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-[#111827] shadow-md flex items-center justify-center p-1.5 overflow-hidden bg-white dark:bg-gray-800 shrink-0">
                <div className="w-full h-full rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-sira-blue dark:text-blue-400 font-extrabold text-xl sm:text-2xl">
                  {profile.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white truncate">
                  {profile.displayName || (isEmployer ? (profile.companyName || 'Employer') : 'Job Seeker')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-semibold text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="capitalize">{profile.role}</span> Account
                  {isEmployer && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {profile.employerType === 'private' ? '👤 Private' : '🏢 Company'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Non-overflowing Edit Profile button for mobile */}
            <button
              onClick={() => {
                if (isEditing && profile) {
                  setFormData({
                    displayName: profile.displayName || '',
                    phone: profile.phone || '',
                    employerType: profile.employerType || 'company',
                    companyName: profile.companyName || '',
                    companyIndustry: profile.companyIndustry || '',
                    companyLocation: profile.companyLocation || '',
                    privateActivityDescription: profile.privateActivityDescription || '',
                    hasTradeLicense: profile.hasTradeLicense || false
                  });
                }
                setIsEditing(!isEditing);
              }}
              className={`w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2.5 rounded-full font-bold transition-all border cursor-pointer text-sm text-center shadow-sm ${
                isEditing 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sira-blue dark:text-blue-400 hover:border-sira-blue'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gray-50 dark:bg-[#1F2937]/50 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-5">Personal Information</h3>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Segmented Selector for Employers in Edit Mode */}
                    {isEmployer && (
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Employer Hiring Category
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-gray-800 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, employerType: 'company' })}
                            className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                              formData.employerType === 'company'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                            }`}
                          >
                            🏢 Registered Company
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, employerType: 'private' })}
                            className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                              formData.employerType === 'private'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                            }`}
                          >
                            👤 Private / Individual
                          </button>
                        </div>

                        {formData.employerType === 'company' ? (
                          <div className="mt-4 space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Company Name</label>
                              <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Roha Tech Solutions"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Industry / Sector</label>
                                <input
                                  type="text"
                                  value={formData.companyIndustry}
                                  onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g. Technology"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Office Location</label>
                                <input
                                  type="text"
                                  value={formData.companyLocation}
                                  onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g. Bole, Addis Ababa"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">What You Do / Hiring Context</label>
                              <input
                                type="text"
                                value={formData.privateActivityDescription}
                                onChange={(e) => setFormData({ ...formData, privateActivityDescription: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Independent Retail Owner, Personal Project Hiring"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Location</label>
                              <input
                                type="text"
                                value={formData.companyLocation}
                                onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Addis Ababa"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-zinc-100 mb-1.5">Display Name</label>
                      <input 
                        type="text" 
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all" 
                        placeholder="E.g. Abebe Kebede"
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-zinc-100 mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all" 
                        placeholder="E.g. +251 911 234 567"
                        maxLength={20}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-800 dark:text-zinc-100 mb-1.5">Email Address (Read-Only)</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        readOnly
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 cursor-not-allowed text-sm font-medium" 
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full py-3.5 bg-sira-orange text-black rounded-xl font-bold hover:bg-[#E66E00] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 mt-0.5">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email Address</p>
                        <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 mt-0.5">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Phone Number</p>
                        <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{profile.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Employer Organization / Activity Details Card */}
              {isEmployer && (
                <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-4 text-[#0B2C5F] dark:text-blue-400">
                    {profile.employerType === 'private' ? <Briefcase size={20} /> : <Building2 size={20} />}
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                      {profile.employerType === 'private' ? '👤 Private Employer Details' : '🏢 Organization Details'}
                    </h3>
                  </div>

                  {profile.employerType === 'private' ? (
                    <div className="space-y-3 text-sm">
                      <div className="p-3.5 bg-orange-50/60 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                        <span className="text-xs font-bold uppercase text-orange-700 dark:text-orange-400 block mb-1">
                          Hiring Context / What You Do
                        </span>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {profile.privateActivityDescription || 'Independent Hiring / Personal Project'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin size={16} className="text-sira-orange" />
                        <span>Location: <strong>{profile.companyLocation || 'Addis Ababa'}</strong></span>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Post jobs freely without trade license requirements. Your listings will show as "Private Employer".
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="text-[11px] font-bold text-gray-500 uppercase block">Company Name</span>
                        <p className="font-bold text-gray-900 dark:text-white mt-0.5">{profile.companyName || 'Not specified'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="text-[11px] font-bold text-gray-500 uppercase block">Industry</span>
                        <p className="font-bold text-gray-900 dark:text-white mt-0.5">{profile.companyIndustry || 'General'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="text-[11px] font-bold text-gray-500 uppercase block">Location</span>
                        <p className="font-bold text-gray-900 dark:text-white mt-0.5">{profile.companyLocation || 'Addis Ababa'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Sidebar / Stats widget area */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0B2C5F] to-[#061A3A] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Award size={100} />
                </div>
                <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                  <Award size={20} className="text-sira-orange" />
                  Account Status
                </h3>
                <div className="mt-4 space-y-3 relative z-10">
                  <div>
                    <p className="text-xs text-blue-200 uppercase font-semibold">Account Role</p>
                    <p className="font-extrabold text-base uppercase tracking-wider">{profile.role}</p>
                  </div>
                  {isEmployer && (
                    <div>
                      <p className="text-xs text-blue-200 uppercase font-semibold">Hiring Mode</p>
                      <p className="font-bold text-sm text-amber-300">
                        {profile.employerType === 'private' ? 'Private Individual' : 'Verified Company'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-blue-200 uppercase font-semibold">Member Since</p>
                    <p className="font-medium text-sm">{profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'Active Member'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
