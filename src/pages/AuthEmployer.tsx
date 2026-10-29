import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Briefcase, ArrowLeft, Building2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthEmployer() {
  const navigate = useNavigate();
  const { loginManual } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // AGR-019 Onboarding fields
  const [employerType, setEmployerType] = useState<'company' | 'private'>('company');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyLocation, setCompanyLocation] = useState('Addis Ababa');
  const [displayName, setDisplayName] = useState('');
  const [privateActivityDescription, setPrivateActivityDescription] = useState('');
  const [privateLocation, setPrivateLocation] = useState('Addis Ababa');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedInput = email.trim();

    // Manual demo login support for Comp1 / 1234
    if (trimmedInput.toLowerCase() === 'comp1' || trimmedInput.toLowerCase() === 'comp1@sirago.com') {
      if (password === '1234') {
        loginManual('Comp1', 'employer', {
          employerType: 'company',
          companyName: 'TechCorp Ethiopia',
          companyIndustry: 'Technology & Software',
          companyLocation: 'Addis Ababa (Bole)',
          hasTradeLicense: true
        });
        navigate('/employer');
        setLoading(false);
        return;
      } else {
        setError("Incorrect password. Hint: 1234");
        setLoading(false);
        return;
      }
    }

    const employerData = employerType === 'company' ? {
      employerType: 'company' as const,
      companyName: companyName.trim() || trimmedInput,
      companyIndustry: companyIndustry.trim() || 'General Business',
      companyLocation: companyLocation.trim() || 'Addis Ababa',
      displayName: companyName.trim() || trimmedInput,
      hasTradeLicense: true
    } : {
      employerType: 'private' as const,
      displayName: displayName.trim() || trimmedInput,
      companyName: 'Private Employer',
      companyLocation: privateLocation.trim() || 'Addis Ababa',
      privateActivityDescription: privateActivityDescription.trim() || 'Independent Hiring',
      hasTradeLicense: false
    };

    if (!trimmedInput.includes('@')) {
      loginManual(trimmedInput, 'employer', employerData);
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
          ...employerData
        });
      }

      navigate('/employer');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
        loginManual(trimmedInput, 'employer', employerData);
        navigate('/employer');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        loginManual(trimmedInput, 'employer', employerData);
        navigate('/employer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to role selection
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-sira-blue dark:text-blue-400 flex items-center justify-center">
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
          {/* Segmented Selector for Employer Type (during signup or option) */}
          {!isLogin && (
            <div className="mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Select Employer Category
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-gray-700/60 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setEmployerType('company')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    employerType === 'company'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 size={16} />
                  <span>🏢 Registered Company</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEmployerType('private')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    employerType === 'private'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <User size={16} />
                  <span>👤 Private / Individual</span>
                </button>
              </div>
            </div>
          )}

          {/* Conditional Onboarding Fields during Signup */}
          {!isLogin && employerType === 'company' && (
            <div className="space-y-3.5 p-4 bg-blue-50/50 dark:bg-gray-700/30 rounded-2xl border border-blue-100/80 dark:border-gray-700">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Roha Tech Solutions"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Industry / Sector</label>
                  <input
                    type="text"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. IT & Software"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Office Location</label>
                  <input
                    type="text"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Bole, Addis Ababa"
                  />
                </div>
              </div>
            </div>
          )}

          {!isLogin && employerType === 'private' && (
            <div className="space-y-3.5 p-4 bg-orange-50/50 dark:bg-gray-700/30 rounded-2xl border border-orange-100/80 dark:border-gray-700">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Display Name / Your Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Dawit Tadesse"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">What You Do / Hiring Context</label>
                <input
                  type="text"
                  required
                  value={privateActivityDescription}
                  onChange={(e) => setPrivateActivityDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Independent Retail Owner, Freelance Producer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Your Location</label>
                <input
                  type="text"
                  value={privateLocation}
                  onChange={(e) => setPrivateLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Addis Ababa"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Company Username / Email</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm transition-all"
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
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm transition-all"
              placeholder="1234"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sira-blue text-white font-bold rounded-full hover:bg-blue-900 transition-colors mt-2 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In as Employer' : 'Create Employer Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? "Don't have a company account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="font-bold text-sira-blue dark:text-blue-400 hover:underline cursor-pointer"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
