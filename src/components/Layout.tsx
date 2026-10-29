import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Send, LogOut, User, Menu, X, Bookmark, Bell, Sun, Moon, Sparkles, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useTheme } from '../context/ThemeContext';
import { RoleSelectionModal } from './RoleSelectionModal';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img
    src="/SiraGo.png"
    alt="Sira Go logo"
    className={`${className} object-contain bg-transparent`}
  />
);

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { savedJobIds } = useJobs();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 backdrop-blur-xl shadow-sm transition-colors">
      <div className="px-4 sm:px-6 md:px-12 h-[76px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <Logo className="w-10 h-10 transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
            <span className="text-blue-600 dark:text-blue-500">Sira</span>
            <span className="text-sira-orange">Go</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Jobs</Link>
          <Link to="/talent" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <span>Talent Portfolios</span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-extrabold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/30">
              New
            </span>
          </Link>
          <Link to="/#categories" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Categories</Link>

          {user && profile?.role !== 'admin' && profile?.role !== 'employer' && (
            <Link to="/saved" className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
              Saved
              {savedJobIds.length > 0 && (
                <span className="px-2 py-0.5 bg-sira-orange text-black rounded-full text-xs font-extrabold shadow-sm">
                  {savedJobIds.length}
                </span>
              )}
            </Link>
          )}

          {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
            <Link to="/employer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
          )}
          
          {user && profile?.role === 'admin' && (
            <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin</Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/post-portfolio" 
            className="text-xs font-extrabold text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-white px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/15 dark:hover:bg-blue-600/25 border border-blue-200 dark:border-blue-500/30 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Sparkles size={14} className="text-sira-orange" />
            <span>Showcase Yourself</span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
            <Link to="/employer/post" className="bg-sira-orange text-black px-5 py-2.5 rounded-xl hover:bg-[#E66E00] transition-all transform hover:-translate-y-0.5 font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 whitespace-nowrap">
              <Briefcase size={16} />
              <span>Post a Job</span>
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-2 font-bold transition-colors text-sm">
                Sign In
              </Link>
              <Link to="/login" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-all transform hover:-translate-y-0.5 font-bold shadow-lg shadow-blue-600/30 whitespace-nowrap text-sm">
                Post a Job
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors" title="Profile">
                <User size={18} />
              </Link>
              <button onClick={signOut} className="text-slate-400 hover:text-red-500 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Buttons (Theme Toggle + Hamburger) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 dark:text-slate-200 font-semibold py-2">Jobs</Link>
          <Link to="/talent" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold py-2">
            <span>Talent Portfolios</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/30">NEW</span>
          </Link>
          <Link to="/post-portfolio" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 text-sira-orange font-semibold py-2">
            <Sparkles size={16} />
            <span>Showcase Yourself (Portfolio)</span>
          </Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 dark:text-slate-200 font-semibold py-2">How it Works</Link>
          <Link to="/why-us" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 dark:text-slate-200 font-semibold py-2">Why Us</Link>
          {user && <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 dark:text-slate-200 font-semibold py-2">Profile</Link>}
          {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
            <Link to="/employer" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 dark:text-slate-200 font-semibold py-2">Dashboard</Link>
          )}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            {!user ? (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-center">
                Sign In / Post a Job
              </Link>
            ) : (
              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full py-3 bg-red-600/20 text-red-500 dark:text-red-400 rounded-xl font-bold text-center">
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
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium py-12 px-6 md:px-12 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl text-slate-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-500">Sira</span>
              <span className="text-sira-orange">Go</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The premier motion-first job marketplace connecting Ethiopian talent with top employers.
          </p>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Jobs</Link></li>
            <li><Link to="/talent" className="hover:text-blue-600 dark:hover:text-white transition-colors">Talent Portfolios</Link></li>
            <li><Link to="/post-portfolio" className="hover:text-blue-600 dark:hover:text-white transition-colors">Showcase Your Portfolio</Link></li>
            <li><Link to="/how-it-works" className="hover:text-blue-600 dark:hover:text-white transition-colors">How it Works</Link></li>
            <li><Link to="/why-us" className="hover:text-blue-600 dark:hover:text-white transition-colors">Why Choose Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Employers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/employer/post" className="hover:text-blue-600 dark:hover:text-white transition-colors">Post a Job</Link></li>
            <li><Link to="/employer" className="hover:text-blue-600 dark:hover:text-white transition-colors">Employer Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1"><Send size={14} /> Telegram Channel</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <p>© 2026 SIRA GO. ALL RIGHTS RESERVED. ETHIOPIA-FIRST HIRING.</p>
        <p>BUILT FOR SPEED & PERFORMANCE IN ETB.</p>
      </div>
    </footer>
  );
}

export function MobileBottomNav() {
  const { user, profile } = useAuth();
  const { savedJobIds } = useJobs();

  const isEmployer = profile?.role === 'employer';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/96 dark:bg-slate-900/96 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-1 safe-b">
      <div className="flex items-center justify-around py-1">
        {/* Jobs */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="text-[22px] leading-none">💼</span>
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>Jobs</span>
            </>
          )}
        </NavLink>

        {/* Talent */}
        <NavLink
          to="/talent"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="text-[22px] leading-none">🌟</span>
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>Talent</span>
            </>
          )}
        </NavLink>

        {/* Centre FAB — context-aware Post button */}
        <NavLink
          to={isEmployer || isAdmin ? '/employer/post' : '/post-portfolio'}
          className="flex flex-col items-center gap-0.5 -mt-5"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-transform border-4 border-white dark:border-slate-900">
            <Plus size={26} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            {isEmployer || isAdmin ? 'Post' : 'Portfolio'}
          </span>
        </NavLink>

        {/* Saved / Dashboard */}
        <NavLink
          to={isEmployer || isAdmin ? '/employer' : '/saved'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors relative ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="text-[22px] leading-none">
                {isEmployer || isAdmin ? '📊' : '🔖'}
              </span>
              {!isEmployer && !isAdmin && savedJobIds.length > 0 && (
                <span className="absolute top-1 right-1.5 w-4 h-4 bg-sira-orange text-black text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {savedJobIds.length > 9 ? '9+' : savedJobIds.length}
                </span>
              )}
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {isEmployer || isAdmin ? 'Dashboard' : 'Saved'}
              </span>
            </>
          )}
        </NavLink>

        {/* Profile / Login */}
        <NavLink
          to={user ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="text-[22px] leading-none">👤</span>
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {user ? 'Profile' : 'Sign In'}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <RoleSelectionModal />
      <Header />
      {/* pb-20 md:pb-0 creates space on mobile for the sticky bottom nav */}
      <main className="flex-1 w-full p-4 sm:p-6 md:p-10 mx-auto max-w-[1440px] pb-24 md:pb-10">
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      {/* Mobile-only sticky bottom navigation bar */}
      <MobileBottomNav />
    </div>
  );
}
