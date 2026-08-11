import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function EmailLoginModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose(); // Close modal upon successful authentication
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use. Try logging in.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || 'Failed to authenticate');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative border border-white/80 dark:border-gray-700/80">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
          title="Close"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-extrabold text-[#0B2C5F] dark:text-white mb-1 text-center">
          {isLogin ? 'Welcome Back!' : 'Create an Account'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
          {isLogin ? 'Sign in to access your jobs.' : 'Sign up to start applying or hiring.'}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white rounded-full font-bold disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="font-bold text-sira-blue hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
