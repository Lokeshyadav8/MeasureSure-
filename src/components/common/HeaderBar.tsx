import React from 'react';
import {
  Scale,
  ShieldAlert,
  LogOut,
  ArrowUp,
  Database
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { useScrollNavigation } from '../../hooks/useScrollNavigation';

export const HeaderBar: React.FC = () => {
  const {
    isAuthenticated,
    logout,
    setActiveScreen,
    openGrievanceModal,
    supabaseStatus
  } = useMetrology();

  const { isScrolled } = useScrollNavigation(20);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all duration-300 pt-[max(env(safe-area-inset-top,0px),0.25rem)]"
    >
      <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'py-1.5 sm:py-2' : 'py-2.5 sm:py-3.5'}`}>
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand & Landing Link - Animates into Small Button while scrolling */}
          <button
            onClick={() => {
              if (isScrolled) {
                scrollToTop();
              } else {
                setActiveScreen(isAuthenticated ? 'DASHBOARD' : 'LOGIN');
              }
            }}
            className={`flex items-center text-left transition-all duration-200 cursor-pointer shrink-0 ${
              isScrolled
                ? 'gap-2 px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-400 hover:bg-slate-800 border border-slate-800 shadow-xs active:scale-95'
                : 'gap-2 sm:gap-2.5 hover:opacity-90'
            }`}
            title={isScrolled ? "Click to scroll to top" : "Legal Metrology Verification"}
          >
            <div
              className={`rounded-lg flex items-center justify-center text-cyan-400 shrink-0 transition-all duration-200 ${
                isScrolled ? 'w-6 h-6 bg-slate-800' : 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 shadow-sm border border-slate-800'
              }`}
            >
              <Scale className={isScrolled ? "w-3.5 h-3.5 text-cyan-300" : "w-4 h-4 text-cyan-300"} />
            </div>
            <div>
              {isScrolled ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span className="text-xs font-black text-white tracking-tight whitespace-nowrap">
                    Legal Metrology
                  </span>
                  <span className="text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-400/30 hidden sm:inline">
                    GovVerify
                  </span>
                </div>
              ) : (
                <div className="animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black tracking-wider text-cyan-800 uppercase whitespace-nowrap">
                      GovVerify System
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-[10px] font-bold text-emerald-800 hidden sm:inline whitespace-nowrap">Statutory Registry</span>
                  </div>
                  <h1 className="text-xs sm:text-base font-black text-slate-950 tracking-tight whitespace-nowrap">
                    Legal Metrology Verification
                  </h1>
                </div>
              )}
            </div>
          </button>

          {/* Right Action Buttons (Exactly ONE Complaint button, exactly ONE Sign Out button) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Supabase Cloud Database Status Indicator */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-bold border border-slate-800 shadow-xs ${
                isScrolled ? 'text-[10px] py-0.5 px-2' : ''
              }`}
              title={`Connected to Supabase Project: ${supabaseStatus.projectId} (${supabaseStatus.latencyMs}ms)`}
            >
              <Database className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-mono">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Single Complaint Button */}
            <button
              onClick={() => openGrievanceModal('INSPECTOR_MISCONDUCT')}
              className={`inline-flex items-center bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 rounded-xl font-black shadow-xs transition-all active:scale-95 cursor-pointer ${
                isScrolled ? 'gap-1 px-2.5 py-1 text-xs rounded-lg' : 'gap-1.5 px-3 py-1.5 sm:py-2 text-xs rounded-xl'
              }`}
              title="File statutory complaint against an inspector or report website issue"
            >
              <ShieldAlert className={isScrolled ? "w-3 h-3 text-rose-600 shrink-0" : "w-3.5 h-3.5 text-rose-600 shrink-0"} />
              <span className="hidden sm:inline">{isScrolled ? 'Complaint' : 'File Complaint to Govt'}</span>
              <span className="sm:hidden">Complaint</span>
            </button>

            {/* Exactly ONE Sign Out Button */}
            {isAuthenticated && (
              <button
                onClick={logout}
                className={`inline-flex items-center bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold transition-all active:scale-95 cursor-pointer ${
                  isScrolled ? 'gap-1 px-2.5 py-1 text-xs rounded-lg' : 'gap-1.5 px-3 py-1.5 sm:py-2 text-xs rounded-xl'
                }`}
                title="Sign Out of Session"
              >
                <LogOut className={isScrolled ? "w-3 h-3 text-slate-500" : "w-3.5 h-3.5 text-slate-500"} />
                <span>Sign Out</span>
              </button>
            )}
          </div>

        </div>
        </div>
      </header>
  );
};
