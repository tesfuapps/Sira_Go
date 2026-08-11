import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { Check, X, Send, Edit2, Loader2, AlertCircle } from 'lucide-react';
import { JobStatus } from '../types';

export function AdminPanel() {
  const { jobs, jobsLoading, jobsError, updateJobStatus } = useJobs();
  const [filter, setFilter] = useState<'All' | JobStatus>('All');

  const filteredJobs = useMemo(() => {
    if (filter === 'All') return jobs;
    return jobs.filter(j => j.status === filter);
  }, [jobs, filter]);

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage job postings</p>
        </div>
        
        <div className="bg-gray-100 p-1 rounded-full flex text-sm font-medium w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as 'All' | JobStatus)}
              className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${filter === status ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                <th className="font-medium p-4 pl-6">Job Info</th>
                <th className="font-medium p-4">Company</th>
                <th className="font-medium p-4">Status</th>
                <th className="font-medium p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {jobsLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 size={32} className="animate-spin text-sira-blue mx-auto" />
                  </td>
                </tr>
              ) : jobsError ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle size={20} />
                      <span>{jobsError}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                    No {filter !== 'All' ? filter.toLowerCase() : ''} jobs found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]">{job.description}</p>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{job.company}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        job.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                        job.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/employer/edit/${job.id}`}
                          className="p-1.5 w-8 h-8 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                          title="Edit Job"
                        >
                          <Edit2 size={16} />
                        </Link>
                        {job.status === 'Pending' && (
                          <>
                            <button 
                              onClick={async () => {
                                await updateJobStatus(job.id, 'Approved');
                                alert(`Job "${job.title}" Approved! \n\n[Background Service Mock] Scanned user Alerts... Found 2 matches! Sending notification to subscribers via Email & Telegram.`);
                              }}
                              className="p-1.5 w-8 h-8 rounded-full text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center bg-green-50/50 dark:bg-green-900/20 border border-transparent hover:border-green-200 dark:hover:border-green-800"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => updateJobStatus(job.id, 'Rejected')}
                              className="p-1.5 w-8 h-8 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center bg-red-50/50 dark:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {job.status === 'Approved' && (
                          <button 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                            title="Simulate Telegram push"
                            onClick={() => alert(`Job "${job.title}" published to Telegram Channel!`)}
                          >
                            <Send size={14} /> Telegram
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
