import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Send, LogOut, User, Menu, X, Bookmark, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useTheme } from '../context/ThemeContext';
import { RoleSelectionModal } from './RoleSelectionModal';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img
    src="/SiraGo.png"
    alt="Sira Go logo"
    className={`${className} object-contain`}
  />
);

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { savedJobIds } = useJobs();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0F19]/85 backdrop-blur-xl border-b border-[#1F2937] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="px-4 sm:px-6 md:px-12 h-[76px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <Logo className="w-10 h-10 transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
            <span className="text-blue-500">Sira</span>
            <span className="text-sira-orange">Go</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
          <Link to="/" className="hover:text-blue-400 transition-colors">Jobs</Link>
          <Link to="/#categories" className="hover:text-blue-400 transition-colors">Categories</Link>
          <Link to="/how-it-works" className="hover:text-blue-400 transition-colors">How it Works</Link>
          <Link to="/why-us" className="hover:text-blue-400 transition-colors">Why Us</Link>

          {user && profile?.role !== 'admin' && profile?.role !== 'employer' && (
            <Link to="/saved" className="relative hover:text-blue-400 transition-colors flex items-center gap-1.5">
              Saved
              {savedJobIds.length > 0 && (
                <span className="px-2 py-0.5 bg-sira-orange text-black rounded-full text-xs font-extrabold shadow-sm">
                  {savedJobIds.length}
                </span>
              )}
            </Link>
          )}

          {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
            <Link to="/employer" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          )}
          
          {user && profile?.role === 'admin' && (
            <Link to="/admin" className="hover:text-blue-400 transition-colors">Admin</Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-800/80 border border-gray-700/80 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          </button>

          {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
            <Link to="/employer/post" className="bg-sira-orange text-black px-5 py-2.5 rounded-xl hover:bg-[#E66E00] transition-all transform hover:-translate-y-0.5 font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 whitespace-nowrap">
              <Briefcase size={16} />
              <span>Post a Job</span>
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 font-bold transition-colors">
                Sign In
              </Link>
              <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-all transform hover:-translate-y-0.5 font-bold shadow-lg shadow-blue-600/30 whitespace-nowrap">
                Post a Job
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-gray-300 hover:text-white p-2 rounded-xl bg-gray-800 border border-gray-700 transition-colors" title="Profile">
                <User size={18} />
              </Link>
              <button onClick={signOut} className="text-gray-400 hover:text-red-400 p-2 rounded-xl bg-gray-800 border border-gray-700 transition-colors cursor-pointer" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 text-gray-300 hover:text-white rounded-xl bg-gray-800 border border-gray-700"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111827] border-b border-[#1F2937] p-6 space-y-4">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 font-semibold py-2">Jobs</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 font-semibold py-2">How it Works</Link>
          <Link to="/why-us" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 font-semibold py-2">Why Us</Link>
          {user && <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 font-semibold py-2">Profile</Link>}
          <div className="pt-4 border-t border-gray-800 flex flex-col gap-3">
            {!user ? (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-center">
                Sign In / Post a Job
              </Link>
            ) : (
              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full py-3 bg-red-600/20 text-red-400 rounded-xl font-bold text-center">
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#0B0F19] text-gray-400 font-medium py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl text-white">
              <span className="text-blue-500">Sira</span>
              <span className="text-sira-orange">Go</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            The premier motion-first job marketplace connecting Ethiopian talent with top employers.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Jobs</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
            <li><Link to="/why-us" className="hover:text-white transition-colors">Why Choose Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Employers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/employer/post" className="hover:text-white transition-colors">Post a Job</Link></li>
            <li><Link to="/employer" className="hover:text-white transition-colors">Employer Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1"><Send size={14} /> Telegram Channel</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>© 2026 SIRA GO. ALL RIGHTS RESERVED. ETHIOPIA-FIRST HIRING.</p>
        <p>BUILT FOR SPEED & PERFORMANCE IN ETB.</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-100">
      <RoleSelectionModal />
      <Header />
      <main className="flex-1 w-full p-4 sm:p-6 md:p-10 mx-auto max-w-[1440px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
