import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Laptop,
  Scale,
  DollarSign,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Building,
  User,
  PlusCircle,
  ExternalLink,
  MessageSquareWarning,
  HelpCircle,
  ShieldCheck,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { GrievanceCategory, GrievanceReportEntity } from '../../types';

interface GrievanceRedressalScreenProps {
  onOpenGrievanceModal?: (category?: GrievanceCategory) => void;
}

export const GrievanceRedressalScreen: React.FC<GrievanceRedressalScreenProps> = ({
  onOpenGrievanceModal
}) => {
  const {
    grievances,
    currentUser,
    userRole,
    resolveGrievance,
    openGrievanceModal
  } = useMetrology();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceReportEntity | null>(null);

  const handleOpenModal = (cat?: GrievanceCategory) => {
    if (openGrievanceModal) {
      openGrievanceModal(cat);
    } else if (onOpenGrievanceModal) {
      onOpenGrievanceModal(cat);
    }
  };

  const filteredGrievances = grievances.filter(grv => {
    const matchesSearch =
      grv.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grv.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grv.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grv.inspectorNameOrId && grv.inspectorNameOrId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      grv.issueDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'ALL' ||
      grv.category === selectedCategoryFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' ||
      grv.status === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (cat?: GrievanceCategory) => {
    switch (cat) {
      case 'INSPECTOR_MISCONDUCT':
      case 'BRIBERY_CORRUPTION':
        return {
          label: 'Inspector Misconduct',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          color: 'bg-rose-100 text-rose-900 border-rose-200'
        };
      case 'INSPECTION_DELAY':
        return {
          label: 'Inspection Delay',
          icon: <Clock className="w-3.5 h-3.5" />,
          color: 'bg-amber-100 text-amber-900 border-amber-200'
        };
      case 'WEBSITE_TECHNICAL_ISSUE':
        return {
          label: 'Website Issue',
          icon: <Laptop className="w-3.5 h-3.5" />,
          color: 'bg-blue-100 text-blue-900 border-blue-200'
        };
      case 'SHORT_DELIVERY_MALPRACTICE':
      case 'TAMPERED_SEAL':
        return {
          label: 'Trade Malpractice',
          icon: <Scale className="w-3.5 h-3.5" />,
          color: 'bg-purple-100 text-purple-900 border-purple-200'
        };
      case 'PAYMENT_BILLING_ISSUE':
        return {
          label: 'Billing / Fee Issue',
          icon: <DollarSign className="w-3.5 h-3.5" />,
          color: 'bg-emerald-100 text-emerald-900 border-emerald-200'
        };
      default:
        return {
          label: 'General Grievance',
          icon: <MessageSquareWarning className="w-3.5 h-3.5" />,
          color: 'bg-slate-100 text-slate-900 border-slate-200'
        };
    }
  };

  const getStatusBadge = (status: GrievanceReportEntity['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          label: 'Submitted (Pending Review)',
          color: 'bg-amber-100 text-amber-900 border-amber-200'
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review by Vigilance',
          color: 'bg-blue-100 text-blue-900 border-blue-200'
        };
      case 'INSPECTOR_DISPATCHED':
        return {
          label: 'Inquiry Dispatched',
          color: 'bg-purple-100 text-purple-900 border-purple-200'
        };
      case 'RESOLVED':
        return {
          label: 'Resolved & Closed',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-200'
        };
      case 'REJECTED':
        return {
          label: 'Inadmissible / Rejected',
          color: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Directorate Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
              Department of Consumer Affairs • Legal Metrology
            </span>
            <span className="text-[10px] font-bold text-slate-300">
              Citizen Redressal & Anti-Corruption Cell
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Government Complaint & Grievance Redressal
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Direct statutory channel for Business Owners, Merchants, and Citizens to report inspector misconduct, inspection delays, billing discrepancies, or portal technical errors under the Legal Metrology Act, 2009.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleOpenModal('INSPECTOR_MISCONDUCT')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/40 transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report Inspector</span>
          </button>

          <button
            onClick={() => handleOpenModal('WEBSITE_TECHNICAL_ISSUE')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
          >
            <Laptop className="w-4 h-4" />
            <span>Report Website Issue</span>
          </button>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <button
          onClick={() => handleOpenModal('INSPECTOR_MISCONDUCT')}
          className="p-4 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-900 group-hover:text-rose-600 transition-colors">
            Complaint Against Inspector
          </h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Report harassment, unauthorized fee demands, rude behavior, or refusal to stamp.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-rose-700">
            <span>Lodge Official Complaint</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => handleOpenModal('INSPECTION_DELAY')}
          className="p-4 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition-colors">
            Inspection Delay Escalation
          </h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Expedite verification requests pending beyond the statutory SLA limit.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-amber-800">
            <span>Escalate to Controller</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => handleOpenModal('WEBSITE_TECHNICAL_ISSUE')}
          className="p-4 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Laptop className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
            Website & Portal Issue
          </h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Report payment deduction failures, missing Challans, or certificate download bugs.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-blue-700">
            <span>Contact Tech Helpdesk</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs text-left">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-white">
            Direct Government Helpline
          </h4>
          <div className="text-[11px] text-slate-300 mt-1 space-y-1">
            <p>National Toll-Free: <strong className="text-cyan-300 font-mono">1915</strong></p>
            <p>Vigilance Desk: <strong className="text-cyan-300 font-mono">011-2338-9900</strong></p>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            Available 9:30 AM – 6:00 PM (Mon-Sat)
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search grievances by GRN ID, Business Name, Inspector Name, or Description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Categories ({grievances.length})</option>
            <option value="INSPECTOR_MISCONDUCT">Inspector Misconduct</option>
            <option value="INSPECTION_DELAY">Inspection Delay</option>
            <option value="WEBSITE_TECHNICAL_ISSUE">Website / Tech Issues</option>
            <option value="SHORT_DELIVERY_MALPRACTICE">Trade Malpractice</option>
            <option value="PAYMENT_BILLING_ISSUE">Billing & Fees</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="INSPECTOR_DISPATCHED">Inquiry Dispatched</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>File New Complaint</span>
          </button>
        </div>
      </div>

      {/* Grievances List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-800" />
            Registered Grievances & Redressal Records ({filteredGrievances.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Citizen Charter SLA: 48 Working Hours Resolution
          </span>
        </div>

        {filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Grievances Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No complaint matches the selected filters. You can file a new statutory complaint directly using the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredGrievances.map(grv => {
              const catBadge = getCategoryBadge(grv.category);
              const statusBadge = getStatusBadge(grv.status);

              return (
                <div
                  key={grv.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {grv.reportId}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${catBadge.color}`}>
                          {catBadge.icon}
                          <span>{catBadge.label}</span>
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          grv.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : grv.severity === 'URGENT'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {grv.severity}
                        </span>
                      </div>

                      <div className="text-xs font-black text-slate-900 mt-1.5 flex items-center gap-2">
                        <span>{grv.establishmentName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-normal">{grv.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Inspector / Instrument reference if available */}
                  {(grv.inspectorNameOrId || grv.requestIdOrInstId || grv.websiteIssueType) && (
                    <div className="flex items-center gap-3 flex-wrap text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      {grv.inspectorNameOrId && (
                        <div className="flex items-center gap-1 text-rose-900 font-bold">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Inspector Named: {grv.inspectorNameOrId}</span>
                        </div>
                      )}
                      {grv.requestIdOrInstId && (
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <span className="text-slate-500">Ref ID:</span>
                          <span className="font-mono">{grv.requestIdOrInstId}</span>
                        </div>
                      )}
                      {grv.websiteIssueType && (
                        <div className="flex items-center gap-1 text-blue-900 font-semibold">
                          <Laptop className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Issue: {grv.websiteIssueType}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Issue Description */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {grv.issueDescription}
                  </div>

                  {/* Official Action Taken or Resolution Remarks */}
                  {grv.actionTaken && (
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-black text-[11px] uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Government Action Taken / Resolution Remarks:</span>
                      </div>
                      <p className="text-emerald-950 font-medium leading-relaxed pl-5">
                        {grv.actionTaken}
                      </p>
                      {grv.resolutionOfficer && (
                        <div className="text-[10px] text-emerald-800 font-bold pl-5 pt-0.5">
                          Signed: {grv.resolutionOfficer} (Controller of Legal Metrology)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complainant footer & Administrative controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span>Filed by: <strong className="text-slate-800">{grv.reporterName}</strong> ({grv.reporterContact})</span>
                      <span className="text-slate-300">•</span>
                      <span>{new Date(grv.timestamp).toLocaleDateString()}</span>
                    </div>

                    {userRole === 'ADMIN' && (
                      <div className="flex items-center gap-1.5">
                        {grv.status === 'SUBMITTED' && (
                          <button
                            onClick={() => resolveGrievance(grv.id, 'UNDER_REVIEW')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black"
                          >
                            Mark Under Review
                          </button>
                        )}
                        {grv.status === 'UNDER_REVIEW' && (
                          <button
                            onClick={() => resolveGrievance(grv.id, 'INSPECTOR_DISPATCHED')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black"
                          >
                            Dispatch Vigilance Team
                          </button>
                        )}
                        {grv.status !== 'RESOLVED' && (
                          <button
                            onClick={() => resolveGrievance(grv.id, 'RESOLVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black"
                          >
                            Resolve & Close
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
