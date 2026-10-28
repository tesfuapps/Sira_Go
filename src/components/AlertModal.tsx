import React, { useState } from 'react';
import { X, Bell, Mail, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { JobAlert, JobCategory } from '../types';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKeyword?: string;
  initialCategory?: JobCategory | 'All';
}

export function AlertModal({ isOpen, onClose, initialKeyword = '', initialCategory = 'All' }: AlertModalProps) {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState('');
  const [notifyVia, setNotifyVia] = useState<'email' | 'telegram'>('email');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState<JobCategory | 'All'>(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!keyword.trim() || !contact.trim()) {
      alert("Please fill in the required fields (Keyword and Contact matching your choice).");
      return;
    }

    setIsSubmitting(true);
    try {
      const isDemoMode = !!localStorage.getItem('sira_go_demo_user');
      if (isDemoMode) {
        const stored = localStorage.getItem(`sira_go_demo_alerts_${user.uid}`);
        const currentAlerts = stored ? JSON.parse(stored) : [];
        const newAlert: JobAlert = {
          id: 'alert-' + Date.now(),
          userId: user.uid,
          keyword: keyword.trim(),
          notifyVia,
          contact: contact.trim(),
          location: location.trim() || undefined,
          category: category !== 'All' ? category : undefined,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`sira_go_demo_alerts_${user.uid}`, JSON.stringify([newAlert, ...currentAlerts]));
        alert('Alert created successfully! You will be notified when jobs match these criteria.');
        onClose();
        setIsSubmitting(false);
        return;
      }

      const alertData: Omit<JobAlert, 'id' | 'createdAt'> & { createdAt: any } = {
        userId: user.uid,
        keyword: keyword.trim(),
        notifyVia,
        contact: contact.trim(),
        createdAt: serverTimestamp()
      };
      
      if (location.trim()) {
        alertData.location = location.trim();
      }

      if (category !== 'All') {
        alertData.category = category;
      }

      await addDoc(collection(db, 'alerts'), alertData);
      
      alert('Alert created successfully! You will be notified when jobs match these criteria.');
      onClose();
    } catch (err) {
      console.error('Error creating alert:', err);
      alert('Failed to create alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100 dark:border-[#1F2937]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-sira-blue dark:text-blue-400">
              <Bell size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Job Alert</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col items-center w-full">
          {!user ? (
            <div className="text-center py-4 text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white mb-2">Sign in to save alerts</p>
              <p className="text-sm">You need a Sira account to subscribe to job notifications.</p>
            </div>
          ) : (
            <>
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Keywords / Job Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937]/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sira-blue text-gray-900 dark:text-white transition-all"
                  placeholder="e.g. React Developer, Marketing Manager"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as JobCategory | 'All')}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937]/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sira-blue text-gray-900 dark:text-white transition-all"
                >
                  <option value="All" className="dark:bg-[#111827]">All Categories</option>
                  <option value="Developers" className="dark:bg-[#111827]">Developers</option>
                  <option value="Creatives" className="dark:bg-[#111827]">Creatives</option>
                  <option value="Finance" className="dark:bg-[#111827]">Finance</option>
                  <option value="Marketing & Sales" className="dark:bg-[#111827]">Marketing & Sales</option>
                  <option value="Management" className="dark:bg-[#111827]">Management</option>
                  <option value="Operations" className="dark:bg-[#111827]">Operations</option>
                  <option value="Other" className="dark:bg-[#111827]">Other</option>
                </select>
              </div>

              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notify me via</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNotifyVia('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-xl font-medium transition-colors cursor-pointer ${
                      notifyVia === 'email' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-[#1F2937]/30 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Mail size={16} /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifyVia('telegram')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-xl font-medium transition-colors cursor-pointer ${
                      notifyVia === 'telegram' ? 'bg-[#0088cc]/15 border-[#0088cc]/40 text-[#0088cc] dark:text-[#38bdf8]' : 'bg-white dark:bg-[#1F2937]/30 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Send size={16} /> Telegram
                  </button>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {notifyVia === 'email' ? 'Email Address' : 'Telegram Handle / Number'} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937]/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sira-blue text-gray-900 dark:text-white transition-all"
                  placeholder={notifyVia === 'email' ? 'name@example.com' : '@username or +251...'}
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location (Optional)</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937]/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sira-blue text-gray-900 dark:text-white transition-all"
                  placeholder="e.g. Addis Ababa, Remote"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-sira-blue text-white rounded-xl font-bold mt-4 shadow-sm hover:bg-[#09224A] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Create Alert'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
