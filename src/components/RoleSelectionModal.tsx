import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User as UserIcon } from 'lucide-react';

export function RoleSelectionModal() {
  const { user, profile, loading, createUserProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'employer' | 'seeker' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading || !user || profile) return null;

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    setError('');
    try {
      await createUserProfile(selectedRole);
    } catch (err) {
      setError("Failed to create your profile. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-extrabold text-[#0B2C5F] dark:text-white mb-2 text-center">Welcome to Sira Go!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">What brings you here today?</p>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm border border-red-100 dark:border-red-800 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => setSelectedRole('seeker')}
            className={`p-6 border-2 rounded-2xl flex flex-col items-center text-center transition-all ${
              selectedRole === 'seeker' ? 'border-sira-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${selectedRole === 'seeker' ? 'bg-sira-orange text-white' : 'bg-gray-100 text-gray-500'}`}>
              <UserIcon size={28} />
            </div>
            <h3 className="font-bold text-lg mb-1">Find a Job</h3>
            <p className="text-xs text-gray-500">I want to discover and apply for opportunities.</p>
          </button>
          
          <button 
            onClick={() => setSelectedRole('employer')}
            className={`p-6 border-2 rounded-2xl flex flex-col items-center text-center transition-all ${
              selectedRole === 'employer' ? 'border-sira-blue bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${selectedRole === 'employer' ? 'bg-sira-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Briefcase size={28} />
            </div>
            <h3 className="font-bold text-lg mb-1">Hire Talent</h3>
            <p className="text-xs text-gray-500">I want to post jobs and recruit candidates.</p>
          </button>
        </div>

          <button 
            onClick={handleSubmit} 
            disabled={!selectedRole || submitting}
            className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-full font-bold disabled:opacity-50 transition-colors cursor-pointer"
          >
            {submitting ? 'Setting up profile...' : 'Continue'}
          </button>
      </div>
    </div>
  );
}
