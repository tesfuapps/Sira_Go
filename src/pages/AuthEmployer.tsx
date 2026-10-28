import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthEmployer() {
  const navigate = useNavigate();
  const { loginManual } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedInput = email.trim();

    // Manual demo login support for Comp1 / 1234
    if (trimmedInput.toLowerCase() === 'comp1' || trimmedInput.toLowerCase() === 'comp1@sirago.com') {
      if (password === '1234') {
        loginManual('Comp1', 'employer');
        navigate('/employer');
        setLoading(false);
        return;
      } else {
        setError("Incorrect password. Hint: 1234");
        setLoading(false);
        return;
      }
    }

    if (!trimmedInput.includes('@')) {
      loginManual(trimmedInput, 'employer');
      navigate('/employer');
      setLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, trimmedInput, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, trimmedInput, password);
      }

      const user = userCredential.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email || trimmedInput,
          role: 'employer',
          createdAt: serverTimestamp(),
        });
      }

      navigate('/employer');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
        loginManual(trimmedInput, 'employer');
        navigate('/employer');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        loginManual(trimmedInput, 'employer');
        navigate('/employer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to role selection
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-sira-blue flex items-center justify-center">
            <Briefcase size={28} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#0B2C5F] dark:text-white mb-1 text-center">
          {isLogin ? 'Employer Portal Sign In' : 'Create Employer Account'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
          Demo Credentials: <span className="font-bold text-gray-900 dark:text-white">Comp1</span> / <span className="font-bold text-gray-900 dark:text-white">1234</span>
        </p>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Company Username / Email</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sira-blue focus:border-transparent transition-all"
              placeholder="Comp1"
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
              placeholder="1234"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sira-blue text-white font-bold rounded-full hover:bg-blue-900 transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In as Employer' : 'Create Employer Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? "Don't have a company account? " : "Already have an account? "}
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
