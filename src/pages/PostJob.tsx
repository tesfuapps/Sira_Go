import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { JobCategory } from '../types';

export function PostJob() {
  const navigate = useNavigate();
  const { addJob } = useJobs();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    category: 'Other' as JobCategory,
    salary: '',
    deadline: '',
    description: '',
    applyMethodType: 'telegram' as 'telegram' | 'phone' | 'link',
    applyMethodValue: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJob({
      title: formData.title,
      company: formData.company,
      location: formData.location,
      category: formData.category,
      salary: formData.salary || undefined,
      deadline: formData.deadline,
      description: formData.description,
      applyMethod: {
        type: formData.applyMethodType,
        value: formData.applyMethodValue
      }
    });
    navigate('/employer');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-white/60 dark:border-gray-800/80">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
        <p className="text-gray-500 mb-8">Fill out the details below. Most jobs are reviewed in under 2 hours.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Job Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500" placeholder="e.g. Senior Frontend Developer" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                <input required name="company" value={formData.company} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500" placeholder="Your company" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                <input required name="location" value={formData.location} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500" placeholder="e.g. Addis Ababa or Remote" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Salary <span className="font-normal text-gray-400">(Optional)</span></label>
                <input name="salary" value={formData.salary} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500" placeholder="e.g. 50,000 ETB" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
              <input required name="deadline" value={formData.deadline} onChange={handleChange} type="date" className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Job Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500 resize-none" placeholder="Describe the responsibilities, requirements, and benefits..."></textarea>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 dark:bg-gray-800/50 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900">Application Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['telegram', 'phone', 'link'] as const).map(type => (
                  <label key={type} className={`cursor-pointer px-4 py-3 rounded-xl border ${formData.applyMethodType === type ? 'border-sira-blue bg-sira-blue text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'} flex items-center justify-center font-medium transition-colors dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500`}>
                    <input type="radio" name="applyMethodType" value={type} checked={formData.applyMethodType === type} onChange={handleChange} className="sr-only" />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {formData.applyMethodType === 'telegram' && 'Telegram Username'}
                  {formData.applyMethodType === 'phone' && 'Phone Number'}
                  {formData.applyMethodType === 'link' && 'External Link URL'}
                </label>
                <input 
                  required 
                  name="applyMethodValue" 
                  value={formData.applyMethodValue} 
                  onChange={handleChange} 
                  type={formData.applyMethodType === 'link' ? 'url' : 'text'} 
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500" 
                  placeholder={
                    formData.applyMethodType === 'telegram' ? '@username' : 
                    formData.applyMethodType === 'phone' ? '+251...' : 
                    'https://...'
                  } 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="submit" className="w-full py-4 bg-sira-orange text-black rounded-full font-bold text-lg hover:bg-[#E66E00] transition-colors shadow-md dark:hover:bg-[#E66E00]/80">
              Submit Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
