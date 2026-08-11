import React from 'react';
import { Building2, Search } from 'lucide-react';

export function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-sira-blue mb-4">How it Works</h1>
        <p className="text-lg text-gray-500 font-medium">Whether you're hiring or searching, Sira Go makes it seamless.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Employer Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 border border-gray-200 dark:border-gray-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sira-orange opacity-5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-sira-orange/10 flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-sira-orange" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">For Employers</h2>
          </div>
          <div className="space-y-8 relative z-10">
            {[
              { step: '1', title: 'Post your job on Web or Telegram bot.', desc: 'Provide details about the role, requirements, and how candidates should apply.' },
              { step: '2', title: 'We review & publish to our channel.', desc: 'Our team quickly reviews your post to ensure quality, then broadcasts it to our huge applicant pool.' },
              { step: '3', title: 'Receive applicants instantly.', desc: 'Candidates will start contacting you directly via your preferred method immediately.' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5">
                <div className="min-w-10 w-10 h-10 rounded-full bg-sira-orange text-black flex items-center justify-center text-sm font-bold shrink-0 shadow-md shadow-sira-orange/30">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-1">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Job Seeker Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 border border-gray-200 dark:border-gray-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sira-blue opacity-5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-sira-blue/10 flex items-center justify-center shrink-0">
              <Search size={24} className="text-sira-blue" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">For Job Seekers</h2>
          </div>
          <div className="space-y-8 relative z-10">
            {[
              { step: '1', title: 'Browse jobs curated on our platform.', desc: 'Find relevant, high-quality opportunities tailored to the Ethiopian tech space.' },
              { step: '2', title: 'Click "Apply" on any listing you like.', desc: 'No complicated application forms or portals tracking you.' },
              { step: '3', title: 'DM HR directly to start your journey.', desc: 'Jump right into a direct conversation with the hiring manager or recruiter.' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5">
                <div className="min-w-10 w-10 h-10 rounded-full bg-sira-blue text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md shadow-sira-blue/30">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-1">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
