import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2, ArrowLeft, Mail, Send, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { JobAlert, JobCategory } from '../types';
import { AlertModal } from '../components/AlertModal';

export function JobAlerts() {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setAlerts([]);
      return;
    }

    const isDemoMode = !!localStorage.getItem('sira_go_demo_user');
    if (isDemoMode) {
      const stored = localStorage.getItem(`sira_go_demo_alerts_${user.uid}`);
      if (stored) {
        try {
          setAlerts(JSON.parse(stored));
        } catch (e) {
          setAlerts([]);
        }
      } else {
        setAlerts([]);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'alerts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: JobAlert[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        } as JobAlert;
      });
      setAlerts(fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching alerts:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isModalOpen]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this alert? You will no longer receive notifications for it.')) return;
    
    const isDemoMode = !!localStorage.getItem('sira_go_demo_user');
    if (isDemoMode && user) {
      const updated = alerts.filter(a => a.id !== id);
      setAlerts(updated);
      localStorage.setItem(`sira_go_demo_alerts_${user.uid}`, JSON.stringify(updated));
      return;
    }

    try {
      await deleteDoc(doc(db, 'alerts', id));
    } catch (err) {
      console.error('Error deleting alert:', err);
      alert('Failed to delete alert.');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <Bell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sign in to manage alerts</h2>
        <p className="text-gray-500 dark:text-gray-400">You need an account to create and manage job alerts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-sira-blue transition-colors w-fit">
            <ArrowLeft size={18} /> Back to jobs
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sira-orange/10 flex items-center justify-center shrink-0">
            <Bell size={24} className="text-sira-orange" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0B2C5F] dark:text-white">Job Alerts</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Get notified when new jobs match your criteria</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-sira-orange text-black rounded-full font-bold hover:bg-[#E66E00] transition-colors shadow-sm"
        >
          + New Alert
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Bell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">You haven't created any job alerts yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-sira-blue text-white rounded-full font-bold hover:bg-[#082046] transition-colors"
          >
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-sira-blue rounded-full text-xs font-medium border border-blue-100 dark:border-blue-800">
                    {alert.category || 'All Categories'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    alert.notifyVia === 'email'
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      : 'bg-[#0088cc]/10 text-[#0088cc] dark:bg-[#0088cc]/20'
                  }`}>
                    {alert.notifyVia === 'email' ? (
                      <span className="flex items-center gap-1"><Mail size={12} /> Email</span>
                    ) : (
                      <span className="flex items-center gap-1"><Send size={12} /> Telegram</span>
                    )}
                  </span>
                </div>
                <p className="font-bold text-lg text-gray-900 dark:text-white truncate">
                  "{alert.keyword}"
                  {alert.location && <span className="text-gray-500 dark:text-gray-400 font-medium"> in {alert.location}</span>}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  via {alert.notifyVia}: {alert.contact}
                </p>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                title="Delete alert"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
