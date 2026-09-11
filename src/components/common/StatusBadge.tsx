import React from 'react';
import {
  FileText,
  Clock,
  UserCheck,
  Calendar,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  Hourglass
} from 'lucide-react';
import { InstrumentStatus, RiskLevel } from '../../types';

interface StatusBadgeProps {
  status: InstrumentStatus;
  className?: string;
}

export const InstrumentStatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'DRAFT':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-900 border border-slate-300 whitespace-nowrap shrink-0 ${className}`}>
          <FileText className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          Draft
        </span>
      );
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-950 border border-sky-300 whitespace-nowrap shrink-0 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
          Submitted
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-950 border border-indigo-300 whitespace-nowrap shrink-0 ${className}`}>
          <UserCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
          Inspector Assigned
        </span>
      );
    case 'INSPECTION_SCHEDULED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 whitespace-nowrap shrink-0 ${className}`}>
          <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          Inspection Scheduled
        </span>
      );
    case 'UNDER_INSPECTION':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-400 animate-pulse whitespace-nowrap shrink-0 ${className}`}>
          <FlaskConical className="w-3.5 h-3.5 text-amber-800 shrink-0" />
          Under Inspection
        </span>
      );
    case 'PASSED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 whitespace-nowrap shrink-0 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          Passed Verification
        </span>
      );
    case 'FAILED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300 whitespace-nowrap shrink-0 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
          Verification Failed
        </span>
      );
    case 'CERTIFICATE_GENERATED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-400 whitespace-nowrap shrink-0 ${className}`}>
          <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          Certified & Verified
        </span>
      );
    default:
      return null;
  }
};

export const RiskScoreBadge: React.FC<{ riskLevel: RiskLevel; className?: string }> = ({ riskLevel, className = '' }) => {
  switch (riskLevel) {
    case 'LOW':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide bg-emerald-100 text-emerald-950 border border-emerald-300 whitespace-nowrap shrink-0 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
          LOW RISK
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide bg-amber-100 text-amber-950 border border-amber-300 whitespace-nowrap shrink-0 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
          MED RISK
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide bg-rose-100 text-rose-950 border border-rose-300 whitespace-nowrap shrink-0 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
          HIGH RISK
        </span>
      );
  }
};

export const ExpiryStatusBadge: React.FC<{ validUntilDate: string; className?: string }> = ({ validUntilDate, className = '' }) => {
  const isExpired = validUntilDate.toLowerCase().includes('failed') || validUntilDate.startsWith('2024') || validUntilDate.startsWith('2025-06');
  const isExpiringSoon = validUntilDate.startsWith('2026-09') || validUntilDate.startsWith('2026-08') || validUntilDate.startsWith('2026-10');

  if (isExpired) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300 whitespace-nowrap shrink-0 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
        Expired
      </span>
    );
  }

  if (isExpiringSoon) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-950 border border-amber-400 whitespace-nowrap shrink-0 ${className}`}>
        <Hourglass className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        Expiring Soon
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 whitespace-nowrap shrink-0 ${className}`}>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
      Valid & Active
    </span>
  );
};
