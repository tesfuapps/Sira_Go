import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, Shield } from 'lucide-react';
import { Logo } from '../components/Layout';

export function AuthHub() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Logo className="w-14 h-14" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#0B2C5F] dark:text-white mb-2">Welcome to Sira Go</h1>
        <p className="text-gray-500 dark:text-gray-400">Select how you want to use the platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Link 
          to="/login/seeker"
          className="p-8 border-2 border-gray-100 dark:border-gray-700 rounded-3xl hover:border-sira-orange hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-all flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-sira-orange flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Job Seeker</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Browse thousands of jobs, save favorites, and apply instantly.</p>
        </Link>

        <Link 
          to="/login/employer"
          className="p-8 border-2 border-gray-100 dark:border-gray-700 rounded-3xl hover:border-sira-blue hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-all flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-sira-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Company / Employer</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Post job listings, manage applications, and hire top Ethiopian talent.</p>
        </Link>
      </div>

      <div className="text-center">
        <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-sira-blue dark:text-gray-400 dark:hover:text-white transition-colors">
          <Shield size={16} />
          Admin Portal Login
        </Link>
      </div>
    </div>
  );
}
