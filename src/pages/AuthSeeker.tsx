import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthSeeker() {
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

    // Manual demo login support for User01 / 12345 or any non-email username
    if (trimmedInput.toLowerCase() === 'user01' || trimmedInput.toLowerCase() === 'user01@sirago.com') {
      if (password === '12345') {
        loginManual('User01', 'seeker');
        navigate('/');
        setLoading(false);
        return;
      } else {
        setError("Incorrect password. Hint: 12345");
        setLoading(false);
        return;
      }
    }

    // If user entered a username without '@', auto-login as seeker for demo convenience
    if (!trimmedInput.includes('@')) {
      loginManual(trimmedInput, 'seeker');
      navigate('/');
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
          role: 'seeker',
          createdAt: serverTimestamp(),
        });
      }

      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
        // Fallback to manual login for demo convenience
        loginManual(trimmedInput, 'seeker');
        navigate('/');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        // Fallback on any firebase error
        loginManual(trimmedInput, 'seeker');
        navigate('/');
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

      <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200/80 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-sira-orange flex items-center justify-center">
            <User size={28} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#0B2C5F] dark:text-white mb-1 text-center">
          {isLogin ? 'Job Seeker Sign In' : 'Create Seeker Account'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
          Demo Credentials: <span className="font-bold text-gray-900 dark:text-white">User01</span> / <span className="font-bold text-gray-900 dark:text-white">12345</span>
        </p>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Username / Email</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sira-orange focus:border-transparent transition-all"
              placeholder="User01"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sira-orange focus:border-transparent transition-all"
              placeholder="12345"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sira-orange text-black font-bold rounded-full hover:bg-[#E66E00] transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In as Seeker' : 'Create Seeker Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="font-bold text-sira-orange hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
