import React, { useEffect, useMemo } from 'react';
import {
  Scale,
  ClipboardList,
  Award,
  QrCode,
  MessageSquareWarning
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { useScrollNavigation } from '../../hooks/useScrollNavigation';
import { InstrumentsScreen } from './InstrumentsScreen';
import { VerificationRequestsScreen } from './VerificationRequestsScreen';
import { AdminAuthorityScreen } from './AdminAuthorityScreen';
import { PublicQrVerificationScreen } from './PublicQrVerificationScreen';
import { GrievanceRedressalScreen } from './GrievanceRedressalScreen';
import { InspectionWorkspaceScreen } from './InspectionWorkspaceScreen';

export const DashboardScreen: React.FC = () => {
  const {
    userRole,
    selectedTab,
    setSelectedTab,
    activeScreen,
    instruments,
    requests,
    grievances
  } = useMetrology();

  const { isScrolled } = useScrollNavigation(20);

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

  return (
    <div className="space-y-6">
      {/* Main Tab Screen Content */}
      <div className="animate-in fade-in duration-200 pb-24 sm:pb-28">
        {selectedTab === 'INSTRUMENTS' && <InstrumentsScreen />}
        {selectedTab === 'REQUESTS' && <VerificationRequestsScreen />}
        {selectedTab === 'ADMIN' && <AdminAuthorityScreen />}
        {selectedTab === 'PUBLIC_VERIFY' && <PublicQrVerificationScreen />}
        {selectedTab === 'GRIEVANCES' && <GrievanceRedressalScreen />}
      </div>

      {/* Unified Bottom Navigation Bar (Persistent at bottom of page with small buttons on scroll) */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl transition-all duration-300 ${
          isScrolled
            ? 'py-1 pb-[max(env(safe-area-inset-bottom,0px),0.25rem)]'
            : 'py-2 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]'
        }`}
      >
        <div className="max-w-2xl mx-auto px-2 sm:px-4">
          <div className={`grid ${tabs.length === 1 ? 'grid-cols-1' : tabs.length === 2 ? 'grid-cols-2' : tabs.length === 3 ? 'grid-cols-3' : tabs.length === 4 ? 'grid-cols-4' : 'grid-cols-5'} gap-1`}>
            {tabs.map(tab => {
              const isActive = selectedTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex flex-col items-center justify-center transition-all relative cursor-pointer active:scale-95 ${
                    isScrolled ? 'py-0.5 px-0.5 rounded-lg' : 'py-1.5 px-1 rounded-xl'
                  } ${
                    isActive ? 'text-cyan-950 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  <div className={`rounded-lg transition-all ${
                    isScrolled ? 'p-1' : 'p-1.5'
                  } ${isActive ? 'bg-cyan-100 text-cyan-900' : 'text-slate-600'}`}>
                    {React.cloneElement(tab.icon as React.ReactElement, {
                      className: isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
                    })}
                  </div>
                  <span className={`tracking-tight truncate max-w-full font-bold transition-all ${
                    isScrolled ? 'text-[9px] mt-0' : 'text-[11px] mt-0.5'
                  }`}>{tab.shortLabel}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`absolute bg-cyan-600 text-white rounded-full font-black flex items-center justify-center shadow-xs transition-all ${
                      isScrolled ? 'top-0.5 right-2 w-3.5 h-3.5 text-[8px]' : 'top-1 right-2.5 w-4 h-4 text-[9px]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
