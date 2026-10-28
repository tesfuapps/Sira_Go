import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { 
  Check, 
  X, 
  Send, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Bot, 
  Settings, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { Job, JobStatus } from '../types';
import { TelegramSettingsModal } from '../components/TelegramSettingsModal';
import { 
  getTelegramConfig, 
  broadcastJobToTelegram, 
  sendTelegramAlertNotifications,
  TelegramConfig 
} from '../lib/telegram';

export function AdminPanel() {
  const { jobs, jobsLoading, jobsError, updateJobStatus, markJobBroadcasted } = useJobs();
  const [filter, setFilter] = useState<'All' | JobStatus>('All');
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [broadcastingJobId, setBroadcastingJobId] = useState<string | null>(null);
  const [botJobs, setBotJobs] = useState<Job[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    link?: string;
  } | null>(null);

  useEffect(() => {
    setTelegramConfig(getTelegramConfig());
    // Load any pending jobs submitted through Telegram Bot
    fetch('/bot_store.json')
      .then(r => r.json())
      .then(store => {
        if (store.pendingJobs && Array.isArray(store.pendingJobs)) {
          setBotJobs(store.pendingJobs);
        }
      })
      .catch(() => {});
  }, [isTelegramModalOpen]);

  const allJobs = useMemo(() => {
    const combined = [...jobs];
    for (const bj of botJobs) {
      if (!combined.some(j => j.id === bj.id)) {
        combined.unshift(bj);
      }
    }
    return combined;
  }, [jobs, botJobs]);

  const filteredJobs = useMemo(() => {
    if (filter === 'All') return allJobs;
    return allJobs.filter(j => j.status === filter);
  }, [allJobs, filter]);

  const handleApprove = async (job: Job) => {
    try {
      await updateJobStatus(job.id, 'Approved');

      const config = getTelegramConfig();
      if (config.autoBroadcastOnApproval) {
        setBroadcastingJobId(job.id);
        const res = await broadcastJobToTelegram(job, config);
        setBroadcastingJobId(null);

        if (res.success) {
          await markJobBroadcasted(job.id, res.messageId);

          // Direct DM notifications to matching alert subscribers
          const alertsSent = await sendTelegramAlertNotifications(job);
          const alertMsg = alertsSent > 0 ? ` (Sent Telegram DMs to ${alertsSent} alert subscriber${alertsSent > 1 ? 's' : ''})` : '';

          setNotification({
            type: 'success',
            message: `Job "${job.title}" Approved and Auto-Broadcasted to ${config.channelId || '@sira_go'}!${alertMsg}`,
            link: res.publishedUrl
          });
        } else {
          setNotification({
            type: 'error',
            message: `Job Approved, but Telegram broadcast failed: ${res.message}`
          });
        }
      } else {
        setNotification({
          type: 'info',
          message: `Job "${job.title}" Approved! (Auto-broadcast is currently turned off in Telegram Settings).`
        });
      }
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: `Failed to approve job: ${e.message || 'Unknown error'}`
      });
    }
  };

  const handleManualBroadcast = async (job: Job) => {
    setBroadcastingJobId(job.id);
    const config = getTelegramConfig();
    try {
      const res = await broadcastJobToTelegram(job, config);
      if (res.success) {
        await markJobBroadcasted(job.id, res.messageId);
        setNotification({
          type: 'success',
          message: `Job "${job.title}" broadcasted to ${config.channelId || '@sira_go'}!`,
          link: res.publishedUrl
        });
      } else {
        setNotification({
          type: 'error',
          message: `Broadcast failed: ${res.message}`
        });
      }
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: `Broadcast error: ${e.message || 'Network request failed'}`
      });
    } finally {
      setBroadcastingJobId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header with Filters */}
      <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-[#1F2937] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review, approve, and auto-broadcast job postings</p>
        </div>
        
        <div className="bg-gray-100 dark:bg-[#1F2937] p-1 rounded-full flex text-sm font-medium w-full md:w-auto overflow-x-auto hide-scrollbar">
          {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as 'All' | JobStatus)}
              className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                filter === status 
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white font-bold' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Telegram Channel Auto-Broadcast Control Bar */}
      <div className="bg-gradient-to-r from-blue-900/20 via-sky-900/10 to-transparent p-5 rounded-3xl border border-blue-500/20 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Send size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Telegram Channel Auto-Broadcast
              </h3>
              {telegramConfig.autoBroadcastOnApproval ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Active on Approval
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Manual Only
                </span>
              )}
              {(!telegramConfig.botToken || telegramConfig.simulationMode) && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Sparkles size={11} /> Demo Sim
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Target Channel: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{telegramConfig.channelId || '@sira_go'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsTelegramModalOpen(true)}
          className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Settings size={14} className="text-blue-500" />
          Channel Settings & Preview
        </button>
      </div>

      {/* Dismissable Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300 ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : notification.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              : 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {notification.type === 'success' && <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />}
            {notification.type === 'error' && <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />}
            {notification.type === 'info' && <Bot size={18} className="text-blue-600 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold">{notification.message}</p>
              {notification.link && (
                <a
                  href={notification.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs underline font-bold mt-1 text-green-700 dark:text-green-400 hover:opacity-80"
                >
                  View message on Telegram <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-[#1F2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-[#1F2937] text-gray-500 dark:text-gray-300 text-sm">
                <th className="font-medium p-4 pl-6">Job Info</th>
                <th className="font-medium p-4">Company</th>
                <th className="font-medium p-4">Status & Broadcast</th>
                <th className="font-medium p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1F2937]">
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
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-white">{job.title}</p>
                        {(job as any).submittedVia === 'telegram_bot' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold inline-flex items-center gap-1 shrink-0" title={`Submitted via @sirago_jobs_bot by ${(job as any).submitterName || 'Employer'}`}>
                            📱 Telegram Bot
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[260px]">{job.description}</p>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">
                      {job.company}
                      <span className="block text-xs text-gray-400">{job.location}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                          job.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                          job.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        }`}>
                          {job.status}
                        </span>

                        {job.telegramBroadcastedAt ? (
                          <span 
                            title={`Broadcasted: ${new Date(job.telegramBroadcastedAt).toLocaleString()}`}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium cursor-help"
                          >
                            <CheckCircle2 size={12} className="text-blue-500" />
                            Broadcasted
                          </span>
                        ) : job.status === 'Approved' ? (
                          <span className="text-[11px] text-gray-400">
                            Not broadcasted
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/employer/edit/${job.id}`}
                          className="p-1.5 w-8 h-8 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                          title="Edit Job"
                        >
                          <Edit2 size={15} />
                        </Link>

                        {job.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(job)}
                              disabled={broadcastingJobId === job.id}
                              className="px-2.5 py-1.5 rounded-full text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-1 bg-green-50/70 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs font-bold cursor-pointer"
                              title="Approve and Auto-Broadcast to Telegram Channel"
                            >
                              {broadcastingJobId === job.id ? (
                                <Loader2 size={14} className="animate-spin text-green-600" />
                              ) : (
                                <Check size={15} />
                              )}
                              Approve
                            </button>
                            <button 
                              onClick={() => updateJobStatus(job.id, 'Rejected')}
                              className="p-1.5 w-8 h-8 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center bg-red-50/50 dark:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 cursor-pointer"
                              title="Reject"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}

                        {job.status === 'Approved' && (
                          <button 
                            disabled={broadcastingJobId === job.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                              job.telegramBroadcastedAt
                                ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 border border-blue-200 dark:border-blue-800'
                                : 'text-white bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                            }`}
                            title={job.telegramBroadcastedAt ? "Re-broadcast to Telegram Channel" : "Broadcast to Telegram Channel"}
                            onClick={() => handleManualBroadcast(job)}
                          >
                            {broadcastingJobId === job.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Send size={13} />
                            )}
                            {job.telegramBroadcastedAt ? 'Re-broadcast' : 'Telegram'}
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

      {/* Telegram Configuration & Preview Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        jobs={jobs}
        onBroadcastSuccess={(jobId, messageId) => {
          markJobBroadcasted(jobId, messageId);
        }}
      />
    </div>
  );
}
