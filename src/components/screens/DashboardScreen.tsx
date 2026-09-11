import React, { useEffect, useMemo } from 'react';
import {
  Scale,
  ClipboardList,
  Award,
  QrCode,
  LogOut,
  MessageSquareWarning,
  ShieldAlert
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { InstrumentsScreen } from './InstrumentsScreen';
import { VerificationRequestsScreen } from './VerificationRequestsScreen';
import { AdminAuthorityScreen } from './AdminAuthorityScreen';
import { PublicQrVerificationScreen } from './PublicQrVerificationScreen';
import { GrievanceRedressalScreen } from './GrievanceRedressalScreen';
import { InspectionWorkspaceScreen } from './InspectionWorkspaceScreen';

export const DashboardScreen: React.FC = () => {
  const {
    userRole,
    currentUser,
    selectedTab,
    setSelectedTab,
    activeScreen,
    instruments,
    requests,
    grievances,
    openGrievanceModal,
    logout
  } = useMetrology();

  if (activeScreen === 'INSPECTION_WORKSPACE') {
    return <InspectionWorkspaceScreen />;
  }

  // Filter tabs strictly based on the authenticated user's statutory role
  const tabs = useMemo(() => {
    switch (userRole) {
      case 'BUSINESS_OWNER':
        return [
          {
            id: 'INSTRUMENTS' as const,
            label: 'My Measuring Instruments',
            shortLabel: 'Instruments',
            icon: <Scale className="w-4 h-4" />,
            count: instruments.length
          },
          {
            id: 'REQUESTS' as const,
            label: 'Verification Requests',
            shortLabel: 'Requests',
            icon: <ClipboardList className="w-4 h-4" />,
            count: requests.filter(r => r.status !== 'CERTIFICATE_GENERATED').length
          },
          {
            id: 'GRIEVANCES' as const,
            label: 'Grievances & Redressal',
            shortLabel: 'Grievance',
            icon: <MessageSquareWarning className="w-4 h-4" />,
            count: grievances.length
          },
          {
            id: 'PUBLIC_VERIFY' as const,
            label: 'Public Seal Lookup',
            shortLabel: 'Verify Seal',
            icon: <QrCode className="w-4 h-4" />
          }
        ];
      case 'INSPECTOR':
        return [
          {
            id: 'REQUESTS' as const,
            label: 'Inspection Workbench Queue',
            shortLabel: 'Work Queue',
            icon: <ClipboardList className="w-4 h-4" />,
            count: requests.filter(r => r.status !== 'CERTIFICATE_GENERATED').length
          },
          {
            id: 'INSTRUMENTS' as const,
            label: 'Jurisdictional Instruments',
            shortLabel: 'Instruments',
            icon: <Scale className="w-4 h-4" />,
            count: instruments.length
          },
          {
            id: 'GRIEVANCES' as const,
            label: 'Grievances & Vigilance Desk',
            shortLabel: 'Grievances',
            icon: <MessageSquareWarning className="w-4 h-4" />,
            count: grievances.length
          },
          {
            id: 'PUBLIC_VERIFY' as const,
            label: 'Verify Seals & QR',
            shortLabel: 'Verify Seal',
            icon: <QrCode className="w-4 h-4" />
          }
        ];
      case 'ADMIN':
        return [
          {
            id: 'ADMIN' as const,
            label: 'Directorate Oversight & AI Radar',
            shortLabel: 'Oversight',
            icon: <Award className="w-4 h-4" />
          },
          {
            id: 'INSTRUMENTS' as const,
            label: 'National Instruments Registry',
            shortLabel: 'Instruments',
            icon: <Scale className="w-4 h-4" />,
            count: instruments.length
          },
          {
            id: 'REQUESTS' as const,
            label: 'Verification Pipeline',
            shortLabel: 'Requests',
            icon: <ClipboardList className="w-4 h-4" />,
            count: requests.filter(r => r.status !== 'CERTIFICATE_GENERATED').length
          },
          {
            id: 'GRIEVANCES' as const,
            label: 'Statutory Grievances Registry',
            shortLabel: 'Grievances',
            icon: <MessageSquareWarning className="w-4 h-4" />,
            count: grievances.filter(g => g.status === 'SUBMITTED' || g.status === 'UNDER_REVIEW').length || grievances.length
          },
          {
            id: 'PUBLIC_VERIFY' as const,
            label: 'Public QR Lookup',
            shortLabel: 'Verify',
            icon: <QrCode className="w-4 h-4" />
          }
        ];
      case 'PUBLIC':
      default:
        return [
          {
            id: 'PUBLIC_VERIFY' as const,
            label: 'Public QR Seal Verification',
            shortLabel: 'QR Verification',
            icon: <QrCode className="w-4 h-4" />
          },
          {
            id: 'GRIEVANCES' as const,
            label: 'Consumer Complaints & Grievances',
            shortLabel: 'Grievances',
            icon: <MessageSquareWarning className="w-4 h-4" />,
            count: grievances.length
          }
        ];
    }
  }, [userRole, instruments.length, requests, grievances]);

  // Ensure current tab is valid for the user's role
  useEffect(() => {
    if (!tabs.some(t => t.id === selectedTab)) {
      setSelectedTab(tabs[0].id);
    }
  }, [tabs, selectedTab, setSelectedTab]);

  const roleTitle =
    userRole === 'BUSINESS_OWNER' ? 'Merchant / Business Owner Interface' :
    userRole === 'INSPECTOR' ? 'Legal Metrology Field Inspector Interface' :
    userRole === 'ADMIN' ? 'Central Directorate Regulatory Authority Interface' :
    'Public Consumer Verification & Grievance Portal';

  return (
    <div className="space-y-6">
      
      {/* Authenticated Session Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900">{currentUser.name}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-extrabold text-cyan-800 uppercase tracking-wider">{roleTitle}</span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap mt-0.5">
              <span>{currentUser.businessOrDepartment}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono font-semibold text-slate-500">{currentUser.licenseNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct File Complaint to Govt button */}
          <button
            onClick={() => openGrievanceModal('INSPECTOR_MISCONDUCT')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 rounded-xl text-xs font-black shadow-xs transition-all active:scale-95"
            title="File complaint about inspector conduct or website technical issues directly to Government"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>File Complaint to Govt</span>
          </button>

          <button
            onClick={logout}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all active:scale-95"
            title="Sign out of current account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Switch</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar (Desktop & Tablet) */}
      <div className="bg-white rounded-3xl p-1.5 border border-slate-300 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const isActive = selectedTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-800 hover:text-black hover:bg-slate-100'
              }`}
            >
              <span className={isActive ? 'text-cyan-400 shrink-0' : 'text-slate-600 shrink-0'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/30 text-cyan-300'
                      : 'bg-slate-200 text-slate-900'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Screen Content */}
      <div className="animate-in fade-in duration-200 pb-20 sm:pb-0">
        {selectedTab === 'INSTRUMENTS' && <InstrumentsScreen />}
        {selectedTab === 'REQUESTS' && <VerificationRequestsScreen />}
        {selectedTab === 'ADMIN' && <AdminAuthorityScreen />}
        {selectedTab === 'PUBLIC_VERIFY' && <PublicQrVerificationScreen />}
        {selectedTab === 'GRIEVANCES' && <GrievanceRedressalScreen />}
      </div>

      {/* Mobile Bottom Navigation Bar (App Bar with safe area) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-300 shadow-xl sm:hidden pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]">
        <div className={`grid px-2 py-2 ${tabs.length === 1 ? 'grid-cols-1' : tabs.length === 2 ? 'grid-cols-2' : tabs.length === 3 ? 'grid-cols-3' : tabs.length === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
          {tabs.map(tab => {
            const isActive = selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                  isActive ? 'text-cyan-950 font-black' : 'text-slate-700 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-100 text-cyan-900' : 'text-slate-600'}`}>
                  {tab.icon}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-full font-bold">{tab.shortLabel}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute top-1 right-2.5 w-4 h-4 bg-cyan-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
