import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  User,
  FlaskConical,
  Award,
  DollarSign,
  Send,
  Building,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { VerificationRequestEntity } from '../../types';
import { InstrumentStatusBadge } from '../common/StatusBadge';
import { VerificationWorkflowTimeline } from '../common/TimelineTracker';

export const VerificationRequestsScreen: React.FC = () => {
  const {
    requests,
    openInspectionWorkspace,
    setSelectedCertificate,
    setShowCertificateModal,
    openGrievanceModal,
    certificates,
    userRole
  } = useMetrology();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'ACTIVE') {
      return r.status !== 'CERTIFICATE_GENERATED' && r.status !== 'FAILED';
    }
    if (activeFilter === 'COMPLETED') {
      return r.status === 'CERTIFICATE_GENERATED' || r.status === 'FAILED';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Statutory Verification Requests
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Formal verification lifecycle, inspector assignments, and calibration schedules
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 shrink-0">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setActiveFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({requests.filter(r => r.status !== 'CERTIFICATE_GENERATED' && r.status !== 'FAILED').length})
          </button>
          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'COMPLETED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({requests.filter(r => r.status === 'CERTIFICATE_GENERATED' || r.status === 'FAILED').length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map(req => {
          const cert = certificates.find(c => c.inspectionId.includes(req.requestId.replace('REQ-', '')) || c.instrumentId === req.instrumentId);

          return (
            <div
              key={req.id}
              className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Top Row: Request ID, Dates, Fee */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-900 text-cyan-300 font-mono font-bold text-xs rounded-lg shadow-xs">
                    {req.requestId}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {req.instrumentName}
                    </h3>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-mono text-slate-600">{req.instrumentId}</span>
                      <span>•</span>
                      <span>{req.businessName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-900">Fee: ${req.inspectionFee.toFixed(2)}</div>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {req.paymentStatus}
                    </span>
                  </div>
                  <InstrumentStatusBadge status={req.status} />
                </div>
              </div>

              {/* Timeline Tracker */}
              <VerificationWorkflowTimeline currentStatus={req.status} />

              {/* Meta details bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-slate-600 block text-[10px] font-bold uppercase">Submitted</span>
                    <span className="font-semibold text-slate-800">{req.submissionDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-slate-600 block text-[10px] font-bold uppercase">Inspection Date</span>
                    <span className="font-semibold text-slate-800">{req.scheduledDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-slate-600 block text-[10px] font-bold uppercase">Assigned Officer</span>
                    <span className="font-semibold text-slate-800">{req.assignedInspectorName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <p className="text-xs text-slate-600 italic">
                  {req.notes}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openGrievanceModal('INSPECTOR_MISCONDUCT', {
                      inspectorNameOrId: req.assignedInspectorName,
                      requestIdOrInstId: req.requestId,
                      establishmentName: req.businessName
                    })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all"
                    title="Report delay, harassment, misconduct or dispute for this verification request"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Report Inspector Issue</span>
                  </button>

                  {cert && (
                    <button
                      onClick={() => {
                        setSelectedCertificate(cert);
                        setShowCertificateModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Award className="w-4 h-4" />
                      View Certificate
                    </button>
                  )}

                  {/* Inspector Workspace Trigger */}
                  {(userRole === 'INSPECTOR' || userRole === 'ADMIN') && req.status !== 'CERTIFICATE_GENERATED' && (
                    <button
                      onClick={() => openInspectionWorkspace(req)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all active:scale-95"
                    >
                      <FlaskConical className="w-4 h-4" />
                      Open Calibration Workspace
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
