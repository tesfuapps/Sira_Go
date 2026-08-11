import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Send, LogOut, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RoleSelectionModal } from './RoleSelectionModal';
import { EmailLoginModal } from './EmailLoginModal';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img
    src="/SiraGo.png"
    alt="Sira Go logo"
    className={`${className} object-contain`}
  />
);

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      {showLoginModal && !user && <EmailLoginModal onClose={() => setShowLoginModal(false)} />}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 md:px-12 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="font-bold text-xl sm:text-2xl tracking-tight">
              <span className="text-sira-blue">Sira</span>
              <span className="text-sira-orange">Go</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
            <Link to="/" className="text-sira-blue dark:text-gray-300 hover:text-sira-blue/80 dark:hover:text-gray-200 transition-colors hidden sm:block">Jobs</Link>
            <Link to="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-sira-blue transition-colors hidden md:block">How it Works</Link>
            <Link to="/why-us" className="text-gray-600 dark:text-gray-300 hover:text-sira-blue transition-colors hidden md:block">Why Us?</Link>

            {user && profile?.role !== 'admin' && profile?.role !== 'employer' && (
              <Link to="/saved" className="text-gray-600 dark:text-gray-300 hover:text-sira-blue transition-colors hidden sm:block">Saved Jobs</Link>
            )}

            {user && profile?.role !== 'admin' && profile?.role !== 'employer' && (
              <Link to="/alerts" className="text-gray-600 dark:text-gray-300 hover:text-sira-blue transition-colors hidden sm:block">Alerts</Link>
            )}

            {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
              <Link to="/employer" className="text-gray-600 dark:text-gray-300 hover:text-sira-blue transition-colors hidden lg:block">Dashboard</Link>
            )}
            
            {user && profile?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-sira-blue transition-colors hidden lg:block">Admin</Link>
            )}

            {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
              <Link to="/employer/post" className="bg-sira-orange text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-[#E66E00] transition-colors font-semibold flex items-center gap-2 shadow-sm whitespace-nowrap">
                <Briefcase size={16} className="hidden xs:block" />
                <span>Post <span className="hidden xs:inline">a Job</span></span>
              </Link>
            )}

            {user && (
              <Link to="/profile" className="text-gray-500 dark:text-gray-300 hover:text-sira-blue transition-colors p-2" title="Profile">
                <User size={20} />
              </Link>
            )}

            <button
              onClick={toggleDarkMode}
              className="text-gray-500 hover:text-sira-blue transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user && (
              <button onClick={signOut} className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer p-2 pl-0" title="Sign out">
                <LogOut size={20} />
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-6 text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-auto gap-4">
      <div className="text-center md:text-left">
        <span className="text-gray-900 font-bold">© 2024 SIRA GO.</span> THE FASTEST HIRING PLATFORM IN ETHIOPIA.
      </div>
      <ul className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
        <li>
          <Link to="/employer/post" className="text-sira-orange font-bold hover:underline flex items-center gap-1">
            <Briefcase size={14} />
            Post a Job
          </Link>
        </li>
        <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy</a></li>
        <li><a href="#" className="hover:text-gray-900 transition-colors">Terms</a></li>
        <li><a href="#" className="hover:text-gray-900 transition-colors flex items-center gap-1"><Send size={14} /> Telegram Channel</a></li>
      </ul>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <RoleSelectionModal />
      <Header />
      <main className="flex-1 w-full p-6 md:p-10 mx-auto max-w-[1440px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
