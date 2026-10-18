import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Shield,
  UserCheck,
  Menu,
  X,
  Eye
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { AuthModal } from './AuthModal';
import { useAccessibility } from '../context/AccessibilityContext';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isDarkMode,
    toggleDarkMode,
    isAuthorityMode,
    setIsAuthorityMode,
    currentUser,
    notifications
  } = useCivic();

  const { setIsAccessibilityModalOpen, announcePolite } = useAccessibility();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'explore', label: 'Explore Hazards' },
    { id: 'map', label: 'Live Map' },
    { id: 'priority', label: 'Civic Priority' },
    { id: 'analytics', label: 'City Analytics' }
  ];

  if (isAuthorityMode) {
    navLinks.push({ id: 'admin', label: 'Dispatch Console' });
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#060913]/70 backdrop-blur-xl border-b border-white/[0.08] shadow-sm shadow-black/25 transition-colors">
        {/* Skip to Main Content Link for Keyboard & Screen-Reader Users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:ring-2 focus:ring-white focus:outline-none"
        >
          Skip to main content
        </a>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark per Top Bar Contract */}
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2 text-left group focus-visible:outline-hidden cursor-pointer"
            aria-label="CivicSense Home Overview"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center justify-center text-white font-bold text-sm shadow-xs transition-all group-hover:scale-105 group-hover:border-sky-500/40 group-hover:bg-sky-500/10">
              CS
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              CivicSense
            </span>
          </button>

          {/* Zone 2: Clean text navigation links with subtle glass hover */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm font-medium text-slate-300">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id as any)}
                  className={`transition-all whitespace-nowrap px-3 py-1.5 rounded-lg cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold bg-white/[0.08] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions and tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search shortcut */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
              title="Search hazards (Cmd+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px] font-mono text-slate-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
                ⌘K
              </span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-slate-300 hover:text-white rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all cursor-pointer shadow-xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#060913]" />
              )}
            </button>

            {/* Accessibility Settings */}
            <button
              onClick={() => {
                setIsAccessibilityModalOpen(true);
                announcePolite('Accessibility preferences opened.');
              }}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-sky-400"
              title="Accessibility Preferences (High Contrast, Large Text, Audio Alerts)"
              aria-label="Open accessibility preferences"
            >
              <Eye className="w-4 h-4 text-sky-400" aria-hidden="true" />
            </button>

            {/* Dark / Light Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-sky-400"
              title="Toggle theme"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" aria-hidden="true" /> : <Moon className="w-4 h-4 text-slate-300" aria-hidden="true" />}
            </button>

            {/* Authority Mode Toggle */}
            <button
              onClick={() => setIsAuthorityMode(!isAuthorityMode)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isAuthorityMode
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xs'
                  : 'bg-white/[0.04] border border-white/[0.06] text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.12]'
              }`}
              title="Toggle municipal authority view"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="whitespace-nowrap">
                {isAuthorityMode ? 'Authority Mode' : 'Citizen Mode'}
              </span>
            </button>

            {/* Report Hazard Primary CTA */}
            <button
              onClick={() => setCurrentView('report')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition-all shadow-sm hover:shadow-sky-500/15 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Hazard</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* User Profile trigger */}
            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-2 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all cursor-pointer"
              title="User profile"
            >
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-sky-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
                {currentUser.name.charAt(0)}
              </div>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] rounded-lg cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu with matching dark navy glass */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] px-4 py-3 bg-[#060913]/90 backdrop-blur-xl space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === link.id
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 mt-2 border-t border-white/[0.08] flex items-center justify-between">
              <button
                onClick={() => {
                  setIsAuthorityMode(!isAuthorityMode);
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <Shield className="w-3.5 h-3.5" />
                {isAuthorityMode ? 'Switch to Citizen' : 'Switch to Authority'}
              </button>
              <button
                onClick={() => {
                  setIsAuthOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                Account
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals & Drawers */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
