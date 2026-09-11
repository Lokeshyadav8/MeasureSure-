import React, { useState } from 'react';
import {
  ShieldCheck,
  Scale,
  Award,
  Users,
  LogIn,
  LogOut,
  ChevronDown,
  ShieldAlert,
  MessageSquareWarning
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { UserRole } from '../../types';

export const HeaderBar: React.FC = () => {
  const {
    userRole,
    currentUser,
    isAuthenticated,
    logout,
    setActiveScreen,
    setSelectedTab,
    openGrievanceModal
  } = useMetrology();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'BUSINESS_OWNER':
        return { label: 'Business Owner', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: <Scale className="w-3 h-3 text-cyan-700" /> };
      case 'INSPECTOR':
        return { label: 'Legal Inspector', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <ShieldCheck className="w-3 h-3 text-indigo-700" /> };
      case 'ADMIN':
        return { label: 'Directorate Admin', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Award className="w-3 h-3 text-amber-700" /> };
      case 'PUBLIC':
        return { label: 'Public Consumer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <Users className="w-3 h-3 text-emerald-700" /> };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs pt-[max(env(safe-area-inset-top,0px),0.5rem)]">
      {/* Statutory Top Micro-Banner */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1 text-[10px] font-bold flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
          <span className="text-cyan-300 font-extrabold uppercase tracking-wider shrink-0">DoCA Legal Metrology • Govt of India</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-emerald-400 font-mono font-bold">ISO/IEC 17025</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          
          {/* Brand & Landing Link */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveScreen(isAuthenticated ? 'DASHBOARD' : 'LANDING')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 shadow-sm border border-slate-800 shrink-0">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-wider text-cyan-800 uppercase whitespace-nowrap">
                    GovVerify System
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-[10px] font-bold text-emerald-800 hidden sm:inline whitespace-nowrap">Statutory Registry</span>
                </div>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-950 tracking-tight whitespace-nowrap">
                  Legal Metrology Verification
                </h1>
              </div>
            </button>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                onClick={() => openGrievanceModal('INSPECTOR_MISCONDUCT')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold active:scale-95"
                title="File complaint about inspector or website issue"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-[11px]">Complaint</span>
              </button>

              {!isAuthenticated ? (
                <button
                  onClick={() => setActiveScreen('LOGIN')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-black shadow-xs active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign In</span>
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Right Bar */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
            
            {/* Direct File Complaint / Contact Govt Button */}
            <button
              onClick={() => openGrievanceModal('INSPECTOR_MISCONDUCT')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
              title="File statutory complaint against an inspector or report website issue"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>File Complaint to Govt</span>
            </button>

            {/* Authenticated User Status OR Sign In Button */}
            {!isAuthenticated ? (
              <button
                onClick={() => setActiveScreen('LOGIN')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4 text-cyan-200" />
                <span>Sign In via Login Portal</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                
                {/* User Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all text-left shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-cyan-300 font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                      {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs font-black text-slate-950 truncate max-w-[140px] flex items-center gap-1.5">
                        <span>{currentUser.name}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold uppercase border flex items-center gap-1 ${roleInfo.color}`}>
                          {roleInfo.icon}
                          <span>{roleInfo.label}</span>
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 z-50 animate-in fade-in duration-150 space-y-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{currentUser.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">{currentUser.email}</div>
                        <div className="text-[10px] text-slate-500 truncate">{currentUser.businessOrDepartment}</div>
                        <div className="text-[10px] font-mono text-cyan-800 pt-1 font-bold">
                          ID: {currentUser.licenseNumber}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            openGrievanceModal('INSPECTOR_MISCONDUCT');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl flex items-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Report Inspector Conduct</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            openGrievanceModal('WEBSITE_TECHNICAL_ISSUE');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl flex items-center gap-2"
                        >
                          <MessageSquareWarning className="w-3.5 h-3.5 text-amber-600" />
                          <span>Report Website / Bug</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveScreen('DASHBOARD');
                            setSelectedTab('GRIEVANCES');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-50 rounded-xl flex items-center gap-2"
                        >
                          <Scale className="w-3.5 h-3.5 text-cyan-600" />
                          <span>View Grievances Registry</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-xs font-black text-rose-600 hover:text-white hover:bg-rose-600 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 hover:border-rose-600 transition-all shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out of Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Sign Out Button */}
                <button
                  onClick={logout}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
