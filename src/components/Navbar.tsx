import React, { useState, useEffect } from 'react';
import { Gift, PlusCircle, Database, Sparkles, HelpCircle, FileText } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getAllDrafts } from '../lib/draftHelper';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenSupabaseGuide?: () => void;
  onOpenDrafts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentRoute,
  onOpenSupabaseGuide,
  onOpenDrafts
}) => {
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [draftCount, setDraftCount] = useState<number>(0);

  useEffect(() => {
    setDbConnected(isSupabaseConfigured());
    setDraftCount(getAllDrafts().length);

    // Listen for storage events or updates
    const handleStorageChange = () => {
      setDraftCount(getAllDrafts().length);
    };
    window.addEventListener('storage', handleStorageChange);

    // Also ping server endpoint for live check
    fetch('/api/supabase-status')
      .then((res) => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data && data.configured) {
          setDbConnected(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0510]/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <img
            src="/logo.png"
            alt="SurpriseUngalukku Logo"
            className="w-9 h-9 object-contain rounded-lg group-hover:scale-105 transition-transform drop-shadow-md"
          />
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg tracking-tight text-white group-hover:text-pink-300 transition-colors">
              SurpriseUngalukku
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400">
              Celebration Crafts
            </span>
          </div>
        </div>

        {/* Right side navigation & status badges */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Supabase status badge */}
          <button
            onClick={onOpenSupabaseGuide}
            className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm transition-all ${
              dbConnected
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Click to view Supabase database setup guide & SQL script"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{dbConnected ? 'Supabase Connected' : 'Demo Storage Active'}</span>
            <HelpCircle className="w-3 h-3 text-white/40 ml-0.5" />
          </button>

          {/* My Drafts button */}
          {onOpenDrafts && (
            <button
              onClick={onOpenDrafts}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 hover:border-pink-500/40 text-white/90 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
              title="View saved drafts"
            >
              <FileText className="w-3.5 h-3.5 text-pink-400" />
              <span>Drafts</span>
              {draftCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-bold text-[10px] shadow-sm">
                  {draftCount}
                </span>
              )}
            </button>
          )}

          {currentRoute !== '/create' && (
            <button
              onClick={() => onNavigate('/create')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Surprise</span>
            </button>
          )}

          {currentRoute === '/create' && (
            <button
              onClick={() => onNavigate('/')}
              className="px-4 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm font-medium transition-colors"
            >
              Home
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
