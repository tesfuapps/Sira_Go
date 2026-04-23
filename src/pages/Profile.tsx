import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Phone, Mail, Loader2, Award } from 'lucide-react';

export function Profile() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-[--color-sira-blue] mb-4" />
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName.trim() || null,
        phone: formData.phone.trim() || null,
      });
      // The context will automatically pick up the real-time update in a full app
      // or we can manually trigger a reload or optimistic UI update here.
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header Background */}
        <div className="h-32 bg-gradient-to-r from-[--color-sira-blue] to-[#1a4b9c]"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar & Basic Info */}
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="flex items-end gap-5">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-50 shadow-md flex items-center justify-center p-2 overflow-hidden bg-white">
                <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center text-[--color-sira-blue]">
                   <User size={48} />
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-extrabold text-gray-900">
                  {profile.displayName || 'User'}
                </h1>
                <p className="text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                  <span className="capitalize">{profile.role}</span> Account
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (isEditing) {
                  // Revert changes
                  setFormData({
                    displayName: profile.displayName || '',
                    phone: profile.phone || '',
                  });
                }
                setIsEditing(!isEditing);
              }}
              className={`px-6 py-2.5 rounded-full font-bold transition-all border ${
                isEditing 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent' 
                  : 'bg-white border-gray-200 text-[--color-sira-blue] hover:border-[--color-sira-blue] shadow-sm'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name</label>
                      <input 
                        type="text" 
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[--color-sira-blue] focus:border-transparent transition-all" 
                        placeholder="E.g. Abebe Kebede"
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[--color-sira-blue] focus:border-transparent transition-all" 
                        placeholder="E.g. +251 911 234 567"
                        maxLength={20}
                      />
                    </div>
                    
                    {/* Read Only Fields */}
                    <div className="opacity-70 grayscale">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address (Read-Only)</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        readOnly
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" 
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full py-3.5 bg-[--color-sira-orange] text-black rounded-xl font-bold hover:bg-[#E66E00] transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50/50 rounded-lg text-blue-600 mt-0.5">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900 mt-1">{profile.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50/50 rounded-lg text-blue-600 mt-0.5">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Phone Number</p>
                        <p className="font-medium text-gray-900 mt-1">{profile.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar / Stats widget area */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0B2C5F] to-[#061A3A] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Award size={100} />
                </div>
                <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                  <Award size={20} className="text-[--color-sira-orange]" />
                  Account Status
                </h3>
                <div className="mt-4 space-y-3 relative z-10">
                  <div>
                    <p className="text-sm text-blue-200">Role</p>
                    <p className="font-bold text-lg uppercase tracking-wider">{profile.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Member Since</p>
                    <p className="font-bold">{profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'Recently'}</p>
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
