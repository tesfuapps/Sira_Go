import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Send, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleSelectionModal } from './RoleSelectionModal';
import { EmailLoginModal } from './EmailLoginModal';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Speech Arc (Deep Blue) */}
    <path d="M 36 34 C 18 34, 18 66, 36 66 Z" fill="#0B2C5F" />
    
    {/* Chat Tail (Deep Blue) */}
    <path d="M 36 65 L 36 86 L 56 65 Z" fill="#0B2C5F" />
    
    {/* Bottom Briefcase (Deep Blue) */}
    <path d="M 32 54 L 88 54 L 88 66 C 88 74, 82 80, 74 80 L 46 80 C 38 80, 32 74, 32 66 Z" fill="#0B2C5F" />
    
    {/* Briefcase Handle (Orange) */}
    <path d="M 46 34 V 24 C 46 16, 74 16, 74 24 V 34" stroke="#FF7A00" strokeWidth="8" strokeLinecap="round" fill="none" />
    
    {/* Top Briefcase (Orange) */}
    <path d="M 32 42 C 32 36, 36 34, 42 34 L 78 34 C 84 34, 88 36, 88 42 L 88 51 L 32 51 Z" fill="#FF7A00" />
    
    {/* Clasp */}
    <rect x="52" y="46" width="16" height="12" rx="4" fill="#FF7A00" stroke="white" strokeWidth="3" />
  </svg>
);

export function Header() {
  const { user, profile, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      {showLoginModal && !user && <EmailLoginModal onClose={() => setShowLoginModal(false)} />}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 md:px-12 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="font-bold text-xl sm:text-2xl tracking-tight">
              <span className="text-[--color-sira-blue]">Sira</span>
              <span className="text-[--color-sira-orange]">Hub</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
            <Link to="/" className="text-[--color-sira-blue] hover:text-[--color-sira-blue]/80 transition-colors hidden sm:block">Jobs</Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-[--color-sira-blue] transition-colors hidden md:block">How it Works</Link>
            <Link to="/why-us" className="text-gray-600 hover:text-[--color-sira-blue] transition-colors hidden md:block">Why Us?</Link>

            {user && profile?.role !== 'admin' && profile?.role !== 'employer' && (
              <Link to="/saved" className="text-gray-600 hover:text-[--color-sira-blue] transition-colors hidden sm:block">Saved Jobs</Link>
            )}

            {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
              <Link to="/employer" className="text-gray-600 hover:text-[--color-sira-blue] transition-colors hidden lg:block">Dashboard</Link>
            )}
            
            {user && profile?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-[--color-sira-blue] transition-colors hidden lg:block">Admin</Link>
            )}

            {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
              <Link to="/employer/post" className="bg-[--color-sira-orange] text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-[#E66E00] transition-colors font-semibold flex items-center gap-2 shadow-sm whitespace-nowrap">
                <Briefcase size={16} className="hidden xs:block" />
                <span>Post <span className="hidden xs:inline">a Job</span></span>
              </Link>
            )}

            {user && (
              <button onClick={signOut} className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer p-2" title="Sign out">
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
    <footer className="border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-6 text-xs text-gray-500 font-medium tracking-wide mt-auto gap-4">
      <div className="text-center md:text-left">
        <span className="text-gray-900 font-bold">© 2024 SIRAHUB.</span> THE FASTEST HIRING PLATFORM IN ETHIOPIA.
      </div>
      <ul className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
        <li>
          <Link to="/employer/post" className="text-[--color-sira-orange] font-bold hover:underline flex items-center gap-1">
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
    <div className="min-h-screen flex flex-col bg-white">
      <RoleSelectionModal />
      <Header />
      <main className="flex-1 w-full p-6 md:p-10 mx-auto max-w-[1440px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
