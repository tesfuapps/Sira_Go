import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Sliders, 
  ExternalLink,
  MessageSquare,
  Smartphone,
  Bell,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { 
  getTelegramConfig, 
  saveTelegramConfig, 
  TelegramConfig, 
  testTelegramConnection, 
  formatTelegramJobPost, 
  broadcastJobToTelegram,
  normalizeTelegramChannel,
  syncTelegramBotCommands,
  BroadcastResult 
} from '../lib/telegram';
import { Job } from '../types';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onBroadcastSuccess?: (jobId: string, messageId?: number) => void;
}

export function TelegramSettingsModal({ isOpen, onClose, jobs, onBroadcastSuccess }: TelegramSettingsModalProps) {
  const [config, setConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<BroadcastResult | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'interactive'>('settings');
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [broadcastingPreview, setBroadcastingPreview] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncingCommands, setSyncingCommands] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getTelegramConfig());
      setTestResult(null);
      setBroadcastResult(null);
      setSavedSuccess(false);
      setSyncResult(null);
      if (jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobs[0].id);
      }
    }
  }, [isOpen, jobs, selectedJobId]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = {
      ...config,
      channelId: normalizeTelegramChannel(config.channelId)
    };
    setConfig(updated);
    saveTelegramConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testTelegramConnection(config.botToken, config.channelId);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Connection test failed.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncBot = async () => {
    setSyncingCommands(true);
    setSyncResult(null);
    try {
      const res = await syncTelegramBotCommands(config.botToken);
      setSyncResult(res);
    } catch (e: any) {
      setSyncResult({
        success: false,
        message: e.message || 'Command synchronization failed.'
      });
    } finally {
      setSyncingCommands(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const previewData = selectedJob ? formatTelegramJobPost(selectedJob) : null;

  const handleBroadcastCurrentPreview = async () => {
    if (!selectedJob) return;
    setBroadcastingPreview(true);
    setBroadcastResult(null);
    try {
      const res = await broadcastJobToTelegram(selectedJob, config);
      setBroadcastResult(res);
      if (res.success && onBroadcastSuccess) {
        onBroadcastSuccess(selectedJob.id, res.messageId);
      }
    } catch (e: any) {
      setBroadcastResult({
        success: false,
        message: e.message || 'Broadcast failed'
      });
    } finally {
      setBroadcastingPreview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-[#1F2937] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Telegram Integration Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
                  Channel & Bot
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Channel broadcasts, interactive bot wizard, and Telegram Mini App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 dark:border-[#1F2937] px-6 bg-gray-50/50 dark:bg-gray-800/30 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Sliders size={16} /> Broadcast Config
          </button>
          <button
            onClick={() => setActiveTab('interactive')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'interactive'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <MessageSquare size={16} /> Interactive Bot & Mini App
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Bot size={16} /> Channel Preview
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Auto Broadcast Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#1E293B]/60 border border-gray-100 dark:border-[#1F2937]">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    Auto-Broadcast on Approval
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    When enabled, approving a pending job immediately broadcasts it to the channel.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoBroadcastOnApproval}
                    onChange={(e) => setConfig({ ...config, autoBroadcastOnApproval: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Simulation Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-500" />
                    Demo / Simulation Mode
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Simulates broadcasts locally in demo mode without requiring an active Telegram Bot token.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!config.simulationMode}
                    onChange={(e) => setConfig({ ...config, simulationMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Bot Token Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Telegram Bot Token
                  </label>
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Get Token from @BotFather <ExternalLink size={12} />
                  </a>
                </div>
                <input
                  type="password"
                  value={config.botToken}
                  onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Channel ID / Username */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Telegram Channel ID or Username
                </label>
                <input
                  type="text"
                  value={config.channelId}
                  onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                  placeholder="@sira_go or -1001234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  ⚠️ <b>Important:</b> Add your bot to this channel as an <b>Administrator</b> with permission to post messages.
                </p>
              </div>

              {/* Test Connection Button & Status */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection || !config.botToken}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-blue-500" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Test Bot Connection to Channel
                    </>
                  )}
                </button>

                {testResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {testResult.success ? (
                      <Check size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'interactive' && (
            <div className="space-y-5">
              {/* Bot Identity Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      @sirago_jobs_bot
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Interactive conversational assistant for seekers and employers
                    </p>
                  </div>
                </div>
                <a
                  href="https://t.me/sirago_jobs_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  Open in Telegram <ExternalLink size={12} />
                </a>
              </div>

              {/* Bot Capabilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
                    <MessageSquare size={14} /> /post Wizard
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Employers can submit vacancies step-by-step in chat. Listings arrive as <b>Pending</b> in your Admin Panel!
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-xs mb-1">
                    <Search size={14} /> /jobs & /search
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Seekers browse approved jobs with pagination, filter categories, and apply with 1 tap.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
                    <Bell size={14} /> /alerts DM Engine
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Subscribers pick categories (e.g. Developers, Finance) to receive automated DM alerts for new openings.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
                    <Smartphone size={14} /> Telegram Mini App
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Permanent "🌐 Open Sira Go" button right inside Telegram for seamless mobile web app access.
                  </p>
                </div>
              </div>

              {/* Sync Commands Action */}
              <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                      Synchronize Commands & Mini App Menu
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Pushes bot command menu (/start, /jobs, /post, /alerts) and the Mini App button to Telegram.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncBot}
                    disabled={syncingCommands || !config.botToken}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {syncingCommands ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={13} /> Sync with Telegram
                      </>
                    )}
                  </button>
                </div>

                {syncResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                      syncResult.success
                        ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {syncResult.success ? (
                      <CheckCircle2 size={15} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={15} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span>{syncResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Job Selector for Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Preview Job Posting
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} at {j.company} ({j.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Realistic Telegram Post Mockup */}
              <div className="bg-[#0e1621] p-4 sm:p-5 rounded-3xl border border-gray-700/60 text-white shadow-inner font-sans">
                {/* Header in Telegram Bubble */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">
                    SG
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      Sira Go Job Board
                    </p>
                    <p className="text-[10px] text-blue-400">
                      {normalizeTelegramChannel(config.channelId || '@sira_go')} • Channel
                    </p>
                  </div>
                </div>

                {/* Message Body */}
                {previewData && (
                  <div className="space-y-3">
                    <div
                      className="text-xs leading-relaxed text-gray-200 whitespace-pre-wrap font-sans"
                      dangerouslySetInnerHTML={{ __html: previewData.text }}
                    />

                    {/* Inline Keyboard Simulation */}
                    <div className="pt-2 space-y-1.5">
                      {previewData.replyMarkup.inline_keyboard.map((row: any[], rIdx: number) => (
                        <div key={rIdx} className="grid grid-flow-col gap-2">
                          {row.map((btn: any, bIdx: number) => (
                            <a
                              key={bIdx}
                              href={btn.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-center py-2 px-3 bg-[#1e2c3a] hover:bg-[#283849] active:bg-[#18232e] text-blue-400 text-xs font-medium rounded-xl border border-blue-500/20 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span>{btn.text}</span>
                              <ExternalLink size={11} className="opacity-70" />
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Broadcast Preview Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBroadcastCurrentPreview}
                  disabled={broadcastingPreview || !selectedJob}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {broadcastingPreview ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Broadcast This Job to Channel Now
                    </>
                  )}
                </button>

                {broadcastResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                      broadcastResult.success
                        ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {broadcastResult.success ? (
                      <Check size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{broadcastResult.message}</p>
                      {broadcastResult.publishedUrl && (
                        <a
                          href={broadcastResult.publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline mt-1 inline-block font-medium hover:text-green-600"
                        >
                          View broadcast on Telegram →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-[#1F2937] flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {savedSuccess && (
              <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                <Check size={14} /> Settings Saved!
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-sira-blue hover:bg-[#082046] text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
