import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  ShieldAlert,
  Laptop,
  Scale,
  DollarSign,
  Info,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  ChevronRight,
  Copy,
  Check,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  MessageSquareWarning,
  AlertCircle
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { GrievanceCategory, GrievanceReportEntity } from '../../types';

interface StatutoryGrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: GrievanceCategory;
  targetContext?: {
    inspectorNameOrId?: string;
    requestIdOrInstId?: string;
    establishmentName?: string;
  };
}

export const StatutoryGrievanceModal: React.FC<StatutoryGrievanceModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'INSPECTOR_MISCONDUCT',
  targetContext
}) => {
  const { currentUser, userRole, submitGrievanceReport, usersList } = useMetrology();

  const [category, setCategory] = useState<GrievanceCategory>(defaultCategory);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [location, setLocation] = useState('');
  const [instrumentTypeOrId, setInstrumentTypeOrId] = useState('');
  const [inspectorNameOrId, setInspectorNameOrId] = useState('');
  const [requestIdOrInstId, setRequestIdOrInstId] = useState('');
  const [websiteIssueType, setWebsiteIssueType] = useState('Payment debited but Challan missing');
  const [issueDescription, setIssueDescription] = useState('');
  const [severity, setSeverity] = useState<'ROUTINE' | 'URGENT' | 'CRITICAL'>('URGENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedGrievance, setSubmittedGrievance] = useState<GrievanceReportEntity | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Auto-fill details based on logged in user or context
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setReporterName(currentUser.name || '');
        setReporterContact(currentUser.phone !== 'N/A' ? currentUser.phone : '+91 98450 12345');
        setReporterEmail(currentUser.email || '');
        setEstablishmentName(currentUser.businessOrDepartment || '');
      }
      if (targetContext) {
        if (targetContext.inspectorNameOrId) setInspectorNameOrId(targetContext.inspectorNameOrId);
        if (targetContext.requestIdOrInstId) setRequestIdOrInstId(targetContext.requestIdOrInstId);
        if (targetContext.establishmentName) setEstablishmentName(targetContext.establishmentName);
      }
      if (defaultCategory) {
        setCategory(defaultCategory);
      }
      setSubmittedGrievance(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser, defaultCategory, targetContext]);

  if (!isOpen) return null;

  const inspectorsList = usersList.filter(u => u.role === 'INSPECTOR' || u.role === 'ADMIN');

  const categories: {
    id: GrievanceCategory;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
  }[] = [
    {
      id: 'INSPECTOR_MISCONDUCT',
      title: 'Complaint Against Inspector / Officer',
      subtitle: 'Harassment, inspection delay, bribery demand, rude conduct or procedural violation',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'border-rose-300 hover:border-rose-500 bg-rose-50/50 text-rose-900',
      badge: 'Vigilance Cell'
    },
    {
      id: 'INSPECTION_DELAY',
      title: 'Verification Delay & SLA Breach',
      subtitle: 'Statutory verification request pending past the statutory deadline',
      icon: <Clock className="w-5 h-5" />,
      color: 'border-amber-300 hover:border-amber-500 bg-amber-50/50 text-amber-900',
      badge: 'Priority Redressal'
    },
    {
      id: 'WEBSITE_TECHNICAL_ISSUE',
      title: 'Website & Technical Portal Issue',
      subtitle: 'Payment deduction failure, missing e-Challan, login/OTP issue, certificate PDF error',
      icon: <Laptop className="w-5 h-5" />,
      color: 'border-blue-300 hover:border-blue-500 bg-blue-50/50 text-blue-900',
      badge: 'NIC Tech Desk'
    },
    {
      id: 'SHORT_DELIVERY_MALPRACTICE',
      title: 'Trade Malpractice / Short Delivery',
      subtitle: 'Petrol pump dispensing less fuel, inaccurate merchant weights, tampered scales',
      icon: <Scale className="w-5 h-5" />,
      color: 'border-purple-300 hover:border-purple-500 bg-purple-50/50 text-purple-900',
      badge: 'Consumer Protection'
    },
    {
      id: 'PAYMENT_BILLING_ISSUE',
      title: 'Statutory Fee / Billing Dispute',
      subtitle: 'Overcharging above statutory OIML Schedule rates or double payment deduction',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 text-emerald-900',
      badge: 'Treasury Section'
    },
    {
      id: 'OTHER',
      title: 'General Grievance / Escalation to Directorate',
      subtitle: 'Statutory query, regulatory clarification or direct escalation to Controller',
      icon: <Info className="w-5 h-5" />,
      color: 'border-slate-300 hover:border-slate-500 bg-slate-50/50 text-slate-900',
      badge: 'Directorate Desk'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !reporterContact.trim() || !issueDescription.trim()) {
      return;
    }

    setIsSubmitting(true);

    const grvId = `DOCA-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newGrv: GrievanceReportEntity = {
      id: 'grv-' + Date.now(),
      reportId: grvId,
      timestamp: Date.now(),
      reporterName: reporterName.trim(),
      reporterContact: reporterContact.trim(),
      reporterEmail: reporterEmail.trim() || undefined,
      reporterRole: userRole || 'CITIZEN',
      establishmentName: establishmentName.trim() || (category === 'WEBSITE_TECHNICAL_ISSUE' ? 'GovVerify Online Portal' : 'Operating Business Unit'),
      instrumentTypeOrId: instrumentTypeOrId.trim() || (category === 'WEBSITE_TECHNICAL_ISSUE' ? 'Web Application System' : 'Measuring Device / Inspection Process'),
      location: location.trim() || 'Jurisdictional Metrology Zone',
      category: category,
      inspectorNameOrId: inspectorNameOrId.trim() || undefined,
      requestIdOrInstId: requestIdOrInstId.trim() || undefined,
      websiteIssueType: category === 'WEBSITE_TECHNICAL_ISSUE' ? websiteIssueType : undefined,
      issueDescription: issueDescription.trim(),
      severity: severity,
      status: 'SUBMITTED'
    };

    submitGrievanceReport(newGrv);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedGrievance(newGrv);
    }, 600);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Government Header Banner */}
        <div className="bg-slate-900 text-white px-5 sm:px-7 py-4 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                    GOVERNMENT OF INDIA • DoCA
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span className="text-[10px] font-bold text-slate-300">Public Grievance Portal</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Statutory Grievance & Citizen Redressal Portal
                </h2>
                <p className="text-[11px] text-slate-400">
                  Legal Metrology Act, 2009 & Citizen Redressal Charter • Direct Vigilance Cell
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          
          {submittedGrievance ? (
            /* Submission Acknowledgment Slip */
            <div className="space-y-6 py-2 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Grievance Successfully Registered</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your statutory complaint has been officially logged in the Central Legal Metrology Registry and forwarded to the designated Vigilance Officer and Directorate.
                </p>
              </div>

              {/* Official Acknowledgment Receipt Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Grievance Registration Number (GRN)
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-lg font-black text-rose-700">
                        {submittedGrievance.reportId}
                      </span>
                      <button
                        onClick={() => handleCopyId(submittedGrievance.reportId)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-[10px] font-bold shadow-xs active:scale-95"
                      >
                        {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Status: SUBMITTED
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      Severity: {submittedGrievance.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">Complainant:</span>
                    <span className="font-bold text-slate-900">{submittedGrievance.reporterName}</span>
                    <span className="text-slate-500 block text-[11px]">{submittedGrievance.reporterContact}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">Complaint Category:</span>
                    <span className="font-bold text-slate-900">{submittedGrievance.category.replace(/_/g, ' ')}</span>
                  </div>
                  {submittedGrievance.inspectorNameOrId && (
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Officer / Inspector Named:</span>
                      <span className="font-bold text-rose-900">{submittedGrievance.inspectorNameOrId}</span>
                    </div>
                  )}
                  {submittedGrievance.requestIdOrInstId && (
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Reference Request / Instrument ID:</span>
                      <span className="font-mono font-bold text-slate-900">{submittedGrievance.requestIdOrInstId}</span>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-[10px] font-bold">Recorded Details:</span>
                    <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 text-xs mt-1 leading-relaxed">
                      {submittedGrievance.issueDescription}
                    </p>
                  </div>
                </div>

                {/* Citizen Charter SLA Guarantee */}
                <div className="bg-cyan-50/80 rounded-xl p-3.5 border border-cyan-200 flex items-start gap-3 text-cyan-950 text-xs">
                  <Clock className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-black text-cyan-900 block">
                      Citizen Charter Resolution SLA: 48 Working Hours
                    </span>
                    <p className="text-[11px] text-cyan-800 leading-snug">
                      Your complaint has been assigned to the Zonal Legal Metrology Controller & Vigilance Officer. You can track this complaint anytime in the Public Grievance Portal using your GRN.
                    </p>
                  </div>
                </div>

                {/* Emergency Contact & Helpdesk */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>National Helpline: <strong className="text-slate-800">1915 (Toll Free)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vigilance Email: <strong className="text-slate-800">vigilance-doca@gov.in</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedGrievance(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
                >
                  Done & Return to Portal
                </button>
              </div>
            </div>
          ) : (
            /* Grievance Submission Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Category Selection */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
                  1. Select Nature of Grievance / Complaint Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {categories.map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-slate-950 bg-slate-950 text-white shadow-md ring-2 ring-cyan-400/30'
                            : `${cat.color} hover:shadow-xs`
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={isSelected ? 'text-cyan-400' : 'text-slate-700'}>
                              {cat.icon}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-cyan-200' : 'bg-white text-slate-700 border border-slate-200'
                            }`}>
                              {cat.badge}
                            </span>
                          </div>
                          <div className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {cat.title}
                          </div>
                          <div className={`text-[10px] leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                            {cat.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Complainant Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-800" />
                    2. Complainant Details (Business Owner / Citizen)
                  </span>
                  {currentUser && (
                    <span className="text-[10px] font-bold text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded-full">
                      Logged in as {currentUser.name} ({currentUser.role})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lokesh Yadav"
                      value={reporterName}
                      onChange={e => setReporterName(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 12345"
                      value={reporterContact}
                      onChange={e => setReporterContact(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={reporterEmail}
                      onChange={e => setReporterEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Business / Shop / Establishment Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Logistics & Freight Hub"
                      value={establishmentName}
                      onChange={e => setEstablishmentName(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Location / District / Premise Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inland Port Terminal, Zone 1, Hyderabad"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Dynamic Category-Specific Fields */}
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  3. Specific Incident & Grievance Information
                </span>

                {/* If Complaint Against Inspector */}
                {(category === 'INSPECTOR_MISCONDUCT' || category === 'INSPECTION_DELAY') && (
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 text-xs font-extrabold">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Legal Metrology Officer / Inspector Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Select Inspector / Officer (if known)
                        </label>
                        <select
                          value={inspectorNameOrId}
                          onChange={e => setInspectorNameOrId(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                        >
                          <option value="">-- Select Registered Inspector or Other --</option>
                          {inspectorsList.map(ins => (
                            <option key={ins.userId} value={`${ins.name} (${ins.licenseNumber})`}>
                              {ins.name} - {ins.businessOrDepartment} ({ins.licenseNumber})
                            </option>
                          ))}
                          <option value="Unidentified Field Officer">Unidentified Field Officer</option>
                          <option value="Zonal Verification Inspection Team">Zonal Verification Inspection Team</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Inspection Request / Instrument ID (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. REQ-2026-104 or INST-WB-8801"
                          value={requestIdOrInstId}
                          onChange={e => setRequestIdOrInstId(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If Website / Technical Issue */}
                {category === 'WEBSITE_TECHNICAL_ISSUE' && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 text-xs font-extrabold">
                      <Laptop className="w-4 h-4 text-blue-600" />
                      <span>Technical & Website Glitch Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Website Issue Type
                        </label>
                        <select
                          value={websiteIssueType}
                          onChange={e => setWebsiteIssueType(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        >
                          <option value="Payment debited but Challan missing">Payment debited but Challan receipt missing</option>
                          <option value="Certificate PDF download or signature verification error">Certificate PDF download / Digital signature error</option>
                          <option value="AI Camera OCR spec sheet scan failure">AI Camera OCR spec sheet scan failure</option>
                          <option value="Account Login, Password or OTP timeout">Account Login / Session timeout error</option>
                          <option value="QR Code scanner camera access error">QR Code Hologram scanner camera access issue</option>
                          <option value="Other Technical Bug">Other Technical Bug / Server Error</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Transaction Ref / GRN / Request ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UTR-994821034 or REQ-2026-089"
                          value={requestIdOrInstId}
                          onChange={e => setRequestIdOrInstId(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If Short Delivery / Malpractice */}
                {category === 'SHORT_DELIVERY_MALPRACTICE' && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                    <div className="flex items-center gap-2 text-purple-900 text-xs font-extrabold">
                      <Scale className="w-4 h-4 text-purple-600" />
                      <span>Measuring Equipment & Malpractice Type</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Type of Measuring Device / Machine
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Petrol pump fuel nozzle #4, Electronic Grocery Scale"
                          value={instrumentTypeOrId}
                          onChange={e => setInstrumentTypeOrId(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Seal / Hologram Number (if visible)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. SEAL-2026-NLM-99182"
                          value={requestIdOrInstId}
                          onChange={e => setRequestIdOrInstId(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Textarea */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Detailed Grievance Facts & Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    placeholder={
                      category === 'INSPECTOR_MISCONDUCT'
                        ? 'Describe what happened (e.g., date of visit, inspector conduct, refusal to issue certificate, unofficial demand, or inspection delay)...'
                        : category === 'WEBSITE_TECHNICAL_ISSUE'
                        ? 'Describe what error appeared on screen, payment amount, bank reference / UTR number, or what button failed to work...'
                        : 'Provide complete details of the incident, measurement shortfall, and evidence...'
                    }
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Statements submitted under the Legal Metrology Act are treated with strict confidentiality by the Directorate Vigilance Officer.
                  </p>
                </div>

                {/* Priority / Severity */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">Urgency / Severity Level</span>
                    <span className="text-[11px] text-slate-500">Determines official escalation workflow</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSeverity('ROUTINE')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        severity === 'ROUTINE'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Routine (72h SLA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeverity('URGENT')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        severity === 'URGENT'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      Urgent (24h SLA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeverity('CRITICAL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      Critical (Vigilance)
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Statutory whistleblowing protected under Section 30 of LM Act</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to Government...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Grievance to Govt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
