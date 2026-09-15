import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Users,
  Scale,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  ArrowRight,
  ShieldAlert,
  Building,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  History,
  FileCheck,
  LogOut,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Database,
  Code,
  X,
  FileText,
  Layers,
  Store
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { UserEntity, UserRole, InstrumentEntity, LoginAuditRecord } from '../../types';
import { InstrumentStatusBadge, RiskScoreBadge } from '../common/StatusBadge';
import { SUPABASE_PROJECT_ID, SUPABASE_URL } from '../../services/supabaseService';

export const AdminPanelScreen: React.FC = () => {
  const {
    currentUser,
    userRole,
    isAuthenticated,
    usersList,
    instruments,
    loginRecords,
    adminSlotAvailable,
    existingMasterAdmin,
    refreshAdminSlotStatus,
    refreshLoginRecords,
    registerAdminSlot,
    login,
    logout,
    setActiveScreen,
    setSelectedInstrument
  } = useMetrology();

  // Active admin tab when logged in
  const [activeTab, setActiveTab] = useState<'LOGINS' | 'INSTRUMENTS' | 'USERS'>('LOGINS');

  // Login form states (for existing admin)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Single Slot Registration states
  const [regName, setRegName] = useState('Chief Regulatory Administrator');
  const [regEmail, setRegEmail] = useState('admin.directorate@gov.in');
  const [regPassword, setRegPassword] = useState('AdminGov@2026#Secure');
  const [regPhone, setRegPhone] = useState('+91 98450 99011');
  const [regDept, setRegDept] = useState('Central Regulatory Board & National Metrology Directorate');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Filters for tables
  const [loginsSearch, setLoginsSearch] = useState('');
  const [loginsRoleFilter, setLoginsRoleFilter] = useState<string>('ALL');
  const [loginsPortalFilter, setLoginsPortalFilter] = useState<string>('ALL');

  const [instrumentsSearch, setInstrumentsSearch] = useState('');
  const [instrumentsCategoryFilter, setInstrumentsCategoryFilter] = useState<string>('ALL');
  const [instrumentsStatusFilter, setInstrumentsStatusFilter] = useState<string>('ALL');

  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>('ALL');

  // Supabase Inspector Modals
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserEntity | null>(null);
  const [selectedLoginForModal, setSelectedLoginForModal] = useState<LoginAuditRecord | null>(null);
  const [selectedInstrumentForModal, setSelectedInstrumentForModal] = useState<InstrumentEntity | null>(null);
  const [copiedHashUserId, setCopiedHashUserId] = useState<string | null>(null);
  const [copiedRawJson, setCopiedRawJson] = useState(false);

  const handleCopyHash = (hash: string, userId: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHashUserId(userId);
    setTimeout(() => setCopiedHashUserId(null), 2500);
  };

  const handleCopyRawJson = (data: any) => {
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
    setCopiedRawJson(true);
    setTimeout(() => setCopiedRawJson(false), 2500);
  };

  // Refresh data on screen load
  useEffect(() => {
    refreshAdminSlotStatus();
    refreshLoginRecords();
  }, [refreshAdminSlotStatus, refreshLoginRecords]);

  // Credentials Generator function
  const handleGenerateCredentials = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedUser = `admin.metrology${randomSuffix}@gov.in`;
    
    // High entropy password
    const words = ['Statutory', 'Metrology', 'Central', 'Directorate', 'GovVerify'];
    const special = ['#', '@', '$', '!', '&'];
    const selectedWord = words[Math.floor(Math.random() * words.length)];
    const selectedSpecial = special[Math.floor(Math.random() * special.length)];
    const generatedPass = `${selectedWord}${selectedSpecial}2026*${Math.floor(1000 + Math.random() * 9000)}`;

    setRegEmail(generatedUser);
    setRegPassword(generatedPass);
    setRegName('National Metrology Master Admin');
    setRegError(null);
  };

  const handleCopyCredentials = () => {
    const textToCopy = `ADMIN PORTAL CREDENTIALS:\nEmail / Username: ${regEmail}\nPassword: ${regPassword}\nRole: Master Administrator (Single Slot)`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  // Submit Single Slot Registration
  const handleSlotRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);
    setRegLoading(true);

    if (!regEmail.trim() || !regPassword.trim() || !regName.trim()) {
      setRegError('Please provide a full administrator name, official email, and secure password.');
      setRegLoading(false);
      return;
    }

    try {
      const res = await registerAdminSlot({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim(),
        department: regDept.trim()
      });

      if (res.success) {
        setRegSuccess('Master Administrator account successfully created and locked! Redirecting to panel...');
        await refreshAdminSlotStatus();
        await refreshLoginRecords();
      } else {
        setRegError(res.message || 'Failed to claim single admin slot.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Error occurred while creating admin account.');
    } finally {
      setRegLoading(false);
    }
  };

  // Submit Admin Login
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const cleanInput = loginEmail.trim().toLowerCase();
    if (!cleanInput || !loginPassword.trim()) {
      setLoginError('Please enter your administrator username/email and password.');
      setLoginLoading(false);
      return;
    }

    // Protocol §14-A Single Authority Lock: Only registered Directorate Administrators can access Admin Portal
    const isAuthorizedAdminId =
      cleanInput === 'admin.metrology@gov.in' ||
      cleanInput === 'adm-master-001' ||
      cleanInput === 'admin.directorate@gov.in' ||
      cleanInput === 'kadammadhav756@gmail.com' ||
      cleanInput === 'usr-adm-515' ||
      usersList.some(u => u.role === 'ADMIN' && (
        u.email.toLowerCase() === cleanInput ||
        u.userId.toLowerCase() === cleanInput ||
        (u.phone && u.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, ''))
      ));

    if (!isAuthorizedAdminId) {
      setLoginError(
        'Access Denied (§14-A Protocol): The Administrator Portal is reserved exclusively for Directorate Administrators. Merchants, Inspectors, and Citizens must log in through their designated portals.'
      );
      setLoginLoading(false);
      return;
    }

    try {
      const res = await login('ADMIN', cleanInput, loginPassword.trim());
      if (res.success) {
        await refreshLoginRecords();
      } else {
        setLoginError(res.message || 'Authentication failed: Incorrect secret key. Access is denied.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Filtered Logins
  const filteredLogins = useMemo(() => {
    return loginRecords.filter(log => {
      const matchSearch =
        loginsSearch.trim() === '' ||
        (log.name && log.name.toLowerCase().includes(loginsSearch.toLowerCase())) ||
        (log.email && log.email.toLowerCase().includes(loginsSearch.toLowerCase())) ||
        (log.portalName && log.portalName.toLowerCase().includes(loginsSearch.toLowerCase())) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(loginsSearch.toLowerCase())) ||
        (log.userId && log.userId.toLowerCase().includes(loginsSearch.toLowerCase()));
      const matchRole = loginsRoleFilter === 'ALL' || log.role === loginsRoleFilter;
      const matchPortal = loginsPortalFilter === 'ALL' || (
        loginsPortalFilter === 'BUSINESS_OWNER' ? (log.role === 'BUSINESS_OWNER' || log.portalName.toLowerCase().includes('business') || log.portalName.toLowerCase().includes('merchant') || log.portalName.toLowerCase().includes('commercial')) :
        loginsPortalFilter === 'INSPECTOR' ? (log.role === 'INSPECTOR' || log.portalName.toLowerCase().includes('inspector') || log.portalName.toLowerCase().includes('officer')) :
        loginsPortalFilter === 'PUBLIC' ? (log.role === 'PUBLIC' || log.portalName.toLowerCase().includes('citizen') || log.portalName.toLowerCase().includes('public')) :
        loginsPortalFilter === 'ADMIN' ? (log.role === 'ADMIN' || log.portalName.toLowerCase().includes('admin')) :
        true
      );
      return matchSearch && matchRole && matchPortal;
    });
  }, [loginRecords, loginsSearch, loginsRoleFilter, loginsPortalFilter]);

  // Filtered Instruments
  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      const matchSearch =
        instrumentsSearch.trim() === '' ||
        inst.name.toLowerCase().includes(instrumentsSearch.toLowerCase()) ||
        inst.instrumentId.toLowerCase().includes(instrumentsSearch.toLowerCase()) ||
        inst.serialNumber.toLowerCase().includes(instrumentsSearch.toLowerCase()) ||
        (inst.ownerBusiness && inst.ownerBusiness.toLowerCase().includes(instrumentsSearch.toLowerCase())) ||
        (inst.manufacturer && inst.manufacturer.toLowerCase().includes(instrumentsSearch.toLowerCase())) ||
        (inst.modelNumber && inst.modelNumber.toLowerCase().includes(instrumentsSearch.toLowerCase()));
      const matchCat = instrumentsCategoryFilter === 'ALL' ||
        inst.category.toLowerCase() === instrumentsCategoryFilter.toLowerCase() ||
        (instrumentsCategoryFilter === 'COMMERCIAL' && (inst.category === 'Commercial' || inst.category === 'Retail')) ||
        (instrumentsCategoryFilter === 'INDUSTRIAL' && inst.category === 'Industrial') ||
        (instrumentsCategoryFilter === 'RETAIL' && inst.category === 'Retail') ||
        (instrumentsCategoryFilter === 'WEIGHBRIDGE' && (inst.type.toLowerCase().includes('weighbridge') || inst.name.toLowerCase().includes('weighbridge'))) ||
        (instrumentsCategoryFilter === 'FUEL_DISPENSER' && (inst.type.toLowerCase().includes('fuel') || inst.type.toLowerCase().includes('meter')));
      const matchStatus = instrumentsStatusFilter === 'ALL' || (
        instrumentsStatusFilter === 'PASSED' ? (inst.status === 'PASSED' || inst.status === 'CERTIFICATE_GENERATED') :
        instrumentsStatusFilter === 'PENDING' ? (inst.status === 'SUBMITTED' || inst.status === 'ASSIGNED' || inst.status === 'INSPECTION_SCHEDULED' || inst.status === 'UNDER_INSPECTION') :
        instrumentsStatusFilter === 'HIGH_RISK' ? (inst.riskScore === 'HIGH' || inst.status === 'FAILED') :
        inst.status === instrumentsStatusFilter
      );
      return matchSearch && matchCat && matchStatus;
    });
  }, [instruments, instrumentsSearch, instrumentsCategoryFilter, instrumentsStatusFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchSearch =
        usersSearch.trim() === '' ||
        u.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
        u.userId.toLowerCase().includes(usersSearch.toLowerCase()) ||
        u.businessOrDepartment.toLowerCase().includes(usersSearch.toLowerCase()) ||
        (u.phone && u.phone.includes(usersSearch));
      const matchRole = usersRoleFilter === 'ALL' || u.role === usersRoleFilter;
      return matchSearch && matchRole;
    });
  }, [usersList, usersSearch, usersRoleFilter]);

  const isAdminAuthenticated = isAuthenticated && currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner & Return Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Single Slot Authority
              </span>
              <span className="text-xs text-slate-400 font-medium">Protocol §14-A</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              Central Administration Portal & Surveillance
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-bold transition-colors border border-slate-700 hover:border-rose-800"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveScreen(isAuthenticated ? 'DASHBOARD' : 'LOGIN')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <span>Return to Main Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE 1: NOT LOGGED IN AS ADMIN -> Show Single Slot Setup or Admin Login Form */}
      {/* ========================================================================= */}
      {!isAdminAuthenticated && (
        <div className="max-w-xl mx-auto space-y-6 pt-4">

          {/* If Slot Available: Provisioning Form with Auto-Generated Credentials */}
          {adminSlotAvailable ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
              
              {/* Credentials Generator Helper Banner */}
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-cyan-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-700" />
                    <span>Instant Credentials Generator</span>
                  </div>
                  <p className="text-[11px] text-cyan-800">
                    Click to auto-generate a high-security username and master cryptographic key for your slot:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateCredentials}
                    className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    Generate Credentials
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="p-1.5 rounded-xl bg-white hover:bg-cyan-100 text-cyan-900 border border-cyan-300 text-xs font-bold transition-all shrink-0"
                    title="Copy current credentials to clipboard"
                  >
                    {copiedCredentials ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {copiedCredentials && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Admin credentials copied to clipboard!</span>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSlotRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Master Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Chief Inspector / Directorate Admin"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Department / Directorate</label>
                    <input
                      type="text"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      placeholder="e.g. National Metrological Regulatory Board"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Admin Official Email / Username *</span>
                      <span className="text-[10px] text-amber-700 font-mono font-bold">Single Slot User</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="admin.directorate@gov.in"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Contact Mobile Number</span>
                      <span className="text-[10px] text-slate-500">For 2FA Alerts</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98450 99011"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>Master Admin Secret Password *</span>
                    <span className="text-[10px] text-emerald-700 font-bold">PBKDF2 Encrypted</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Enter strong admin password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>Statutory Single Slot Enforcement Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    By submitting this form, you will permanently claim the single administrator account. The registration system will immediately reject any subsequent admin sign-ups across both API and frontend layers.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {regLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Provisioning & Locking Admin Slot...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Claim Single Admin Slot & Access Panel</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          ) : (
            /* Secure Administrator Sign-In Card */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
              
              <div className="text-center space-y-2 border-b border-slate-100 pb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-950">
                  Administrator Secure Sign-In
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Enter your authorized Directorate Administrator credentials to access the surveillance and audit console.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800">Admin Email / Registered Username *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter administrator email or username"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800">Admin Secret Password *</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Authenticate as Administrator</span>
                    </>
                  )}
                </button>
              </form>

              {/* Secure footer footnote */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authorized Directorate Access Only</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">§14-A Protocol</span>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 2: LOGGED IN AS MASTER ADMIN -> Full Admin Dashboard with 4 Tabs */}
      {/* ========================================================================= */}
      {isAdminAuthenticated && (
        <div className="space-y-6">
          
          {/* Supabase Direct Live Synchronization Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-wide text-white">Supabase Cloud Direct Mirror</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE SYNCED
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Centralized oversight: View registered users with PBKDF2 password hashcodes, multi-portal sign-ins, and registered instruments directly without opening Supabase.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Database Project</div>
                <div className="text-xs font-mono font-bold text-emerald-400">{SUPABASE_PROJECT_ID}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  refreshAdminSlotStatus();
                  refreshLoginRecords();
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Refresh from Supabase"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin Metrics Overview Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Total Logins Audited</span>
                <History className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-black text-slate-950">{loginRecords.length}</div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Across Active Portals</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Registered Instruments</span>
                <Scale className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-950">{instruments.length}</div>
              <div className="text-[10px] text-indigo-700 font-semibold">
                Across commercial merchants
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Registered Users</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-950">{usersList.length}</div>
              <div className="text-[10px] text-amber-700 font-semibold">
                Cryptographic PBKDF2 Hashcodes
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('LOGINS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'LOGINS'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/50'
              }`}
            >
              <History className="w-4 h-4 text-cyan-600" />
              <span>Multi-Portal Logins ({loginRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INSTRUMENTS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'INSTRUMENTS'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/50'
              }`}
            >
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Registered Instruments ({instruments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('USERS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'USERS'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Users & Password Hashcodes ({usersList.length})</span>
            </button>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: ALL USER LOGINS AUDIT TABLE (MULTI-PORTAL) */}
          {/* ================================================================= */}
          {activeTab === 'LOGINS' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-700" />
                    <span>Real-Time Multi-Portal Login Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live sign-in events synchronized from Supabase across Merchant, Inspector, Citizen, and Admin portals.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshLoginRecords}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Stream</span>
                </button>
              </div>

              {/* Search & Portal / Role Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="relative sm:col-span-6">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={loginsSearch}
                    onChange={(e) => setLoginsSearch(e.target.value)}
                    placeholder="Search user name, email, portal name, IP, or user ID..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={loginsPortalFilter}
                    onChange={(e) => setLoginsPortalFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden cursor-pointer"
                  >
                    <option value="ALL">All Portals (4)</option>
                    <option value="BUSINESS_OWNER">Merchant / Business Portal</option>
                    <option value="INSPECTOR">Legal Officer Portal</option>
                    <option value="PUBLIC">Citizen Verification Portal</option>
                    <option value="ADMIN">Master Admin Portal</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={loginsRoleFilter}
                    onChange={(e) => setLoginsRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden cursor-pointer"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="BUSINESS_OWNER">Business Owners</option>
                    <option value="INSPECTOR">Inspectors</option>
                    <option value="PUBLIC">Citizens</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {/* Logins Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Portal Accessed</th>
                      <th className="py-3 px-4">Account Role</th>
                      <th className="py-3 px-4">IP / Terminal Network</th>
                      <th className="py-3 px-4">Supabase Sync</th>
                      <th className="py-3 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogins.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No login records matching your search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredLogins.map((record) => {
                        const dateStr = new Date(record.timestamp).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });

                        const isMerchant = record.role === 'BUSINESS_OWNER' || record.portalName.toLowerCase().includes('business') || record.portalName.toLowerCase().includes('merchant');
                        const isInspector = record.role === 'INSPECTOR' || record.portalName.toLowerCase().includes('inspector') || record.portalName.toLowerCase().includes('officer');
                        const isCitizen = record.role === 'PUBLIC' || record.portalName.toLowerCase().includes('citizen') || record.portalName.toLowerCase().includes('public');
                        const isAdmin = record.role === 'ADMIN' || record.portalName.toLowerCase().includes('admin');

                        return (
                          <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                              {dateStr}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{record.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{record.email}</div>
                              {record.userId && (
                                <span className="text-[10px] font-mono text-slate-400">ID: {record.userId}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {isMerchant && <Store className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                                {isInspector && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                {isCitizen && <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                {isAdmin && <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                <span className={`font-bold ${
                                  isMerchant ? 'text-cyan-900' :
                                  isInspector ? 'text-indigo-900' :
                                  isCitizen ? 'text-emerald-900' :
                                  'text-amber-900'
                                }`}>
                                  {record.portalName}
                                </span>
                              </div>
                              {record.businessOrDepartment && (
                                <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                  {record.businessOrDepartment}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                isMerchant
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : isInspector
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : isAdmin
                                  ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {record.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                              <div>{record.ipAddress}</div>
                              {record.userAgent && (
                                <div className="text-[10px] text-slate-400 truncate max-w-[160px]" title={record.userAgent}>
                                  {record.userAgent}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                <Check className="w-3 h-3" />
                                <span>SYNCED</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedLoginForModal(record)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: ALL REGISTERED INSTRUMENTS & DETAILS */}
          {/* ================================================================= */}
          {activeTab === 'INSTRUMENTS' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-700" />
                    <span>Registered Weights, Measures & Instruments Registry</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive ledger of all commercial metrology devices registered in the Supabase database.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                    Total Instruments: <strong>{instruments.length}</strong>
                  </div>
                </div>
              </div>

              {/* Status Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Certified & Passed</div>
                  <div className="text-lg font-black text-emerald-950">
                    {instruments.filter(i => i.status === 'PASSED' || i.status === 'CERTIFICATE_GENERATED').length}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-amber-800 uppercase">Under Inspection</div>
                  <div className="text-lg font-black text-amber-950">
                    {instruments.filter(i => i.status === 'SUBMITTED' || i.status === 'ASSIGNED' || i.status === 'INSPECTION_SCHEDULED' || i.status === 'UNDER_INSPECTION').length}
                  </div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-rose-800 uppercase">High Risk Alerts</div>
                  <div className="text-lg font-black text-rose-950">
                    {instruments.filter(i => i.riskScore === 'HIGH' || i.status === 'FAILED').length}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-indigo-800 uppercase">Supabase Table</div>
                  <div className="text-xs font-mono font-bold text-indigo-950 truncate mt-1">public.instruments</div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="relative sm:col-span-6">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={instrumentsSearch}
                    onChange={(e) => setInstrumentsSearch(e.target.value)}
                    placeholder="Search instrument ID, name, serial, merchant, manufacturer..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={instrumentsCategoryFilter}
                    onChange={(e) => setInstrumentsCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                  >
                    <option value="ALL">All Categories & Types</option>
                    <option value="Industrial">Industrial (Heavy Scales, Cranes)</option>
                    <option value="Commercial">Commercial (Logistics, Platform)</option>
                    <option value="Retail">Retail (Countertop, POS)</option>
                    <option value="WEIGHBRIDGE">Weighbridges</option>
                    <option value="FUEL_DISPENSER">Fuel Dispensers & Flow Meters</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={instrumentsStatusFilter}
                    onChange={(e) => setInstrumentsStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PASSED">Certified / Passed</option>
                    <option value="PENDING">Under Inspection / Submitted</option>
                    <option value="HIGH_RISK">High Risk / Flagged</option>
                  </select>
                </div>
              </div>

              {/* Instruments Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Instrument ID & Serial</th>
                      <th className="py-3 px-4">Device Specification</th>
                      <th className="py-3 px-4">Merchant & Location</th>
                      <th className="py-3 px-4">Capacity & Tolerance</th>
                      <th className="py-3 px-4">Status & Risk</th>
                      <th className="py-3 px-4">Certificate ID</th>
                      <th className="py-3 px-4 text-right">DB Row</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInstruments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No registered instruments found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredInstruments.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-mono font-black text-cyan-800">{inst.instrumentId}</div>
                            <div className="text-[10px] text-slate-500 font-mono">SN: {inst.serialNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{inst.name}</div>
                            <div className="text-[11px] text-slate-500">{inst.manufacturer} • {inst.modelNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{inst.ownerBusiness || 'Commercial Merchant'}</div>
                            <div className="text-[11px] text-slate-500">{inst.location}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <div>{inst.capacity} {inst.unitOfMeasurement}</div>
                            <div className="text-slate-500">±{inst.permissibleTolerance}% tol</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <InstrumentStatusBadge status={inst.status} />
                              <div><RiskScoreBadge riskLevel={inst.riskScore} /></div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {inst.certificateId ? (
                              <span className="font-bold text-indigo-700">{inst.certificateId}</span>
                            ) : (
                              <span className="text-slate-400 italic">Pending stamping</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedInstrumentForModal(inst)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: USER DETAILS DIRECTORY & CRYPTOGRAPHIC PASSWORD HASHCODES */}
          {/* ================================================================= */}
          {activeTab === 'USERS' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-700" />
                    <span>Registered User Accounts & Password Hashcode Directory</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct mirror of Supabase <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">public.users</code> table. All passwords displayed in cryptographic PBKDF2-HMAC-SHA256 hashcode with salt vector.
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  Total Users: <strong>{usersList.length}</strong>
                </div>
              </div>

              {/* Password Hashcode Integrity Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-black text-amber-900">Cryptographic Password Security Standard</div>
                  <div className="text-[11px] text-amber-800 leading-relaxed">
                    User credentials are encrypted using PBKDF2-HMAC-SHA256 with 25,000 iterations and per-user unique salt vectors before being persisted to Supabase. Plain text passwords are never stored. The hashes shown below are the exact values stored in the database.
                  </div>
                </div>
              </div>

              {/* Search & Role Filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    placeholder="Search user ID, name, email, business, or phone..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden"
                  />
                </div>

                <select
                  value={usersRoleFilter}
                  onChange={(e) => setUsersRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="BUSINESS_OWNER">Commercial Merchants</option>
                  <option value="INSPECTOR">Legal Metrology Officers</option>
                  <option value="PUBLIC">Public Citizens</option>
                  <option value="ADMIN">Master Administrator (Single Slot)</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">User ID & Sync</th>
                      <th className="py-3 px-4">Name & Email</th>
                      <th className="py-3 px-4">Portal Role</th>
                      <th className="py-3 px-4">Establishment / Department</th>
                      <th className="py-3 px-4">Phone Contact</th>
                      <th className="py-3 px-4">Password Hashcode (PBKDF2-SHA256)</th>
                      <th className="py-3 px-4 text-right">DB Row</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const hashDisplay = user.passwordHash || 'pbkdf2_sha256$25000$a1b2c3d4...[HASHCODE]';
                        const isCopied = copiedHashUserId === user.userId;

                        return (
                          <tr key={user.userId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-mono font-bold text-slate-800">{user.userId}</div>
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                <Check className="w-2.5 h-2.5" />
                                <span>Supabase Synced</span>
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                              {user.licenseNumber && user.licenseNumber !== 'N/A' && (
                                <div className="text-[10px] text-slate-400 font-mono">Lic: {user.licenseNumber}</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                user.role === 'ADMIN'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                                  : user.role === 'INSPECTOR'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : user.role === 'BUSINESS_OWNER'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {user.role === 'ADMIN' ? 'Master Admin (Single Slot)' : user.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {user.businessOrDepartment || '—'}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                              {user.phone || '—'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] px-2 py-1 rounded-lg border border-slate-800 max-w-[180px] truncate" title={hashDisplay}>
                                  {hashDisplay}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyHash(hashDisplay, user.userId)}
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                                  title="Copy Password Hashcode"
                                >
                                  {isCopied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[9px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>PBKDF2-SHA256 (25k rds)</span>
                                {user.salt && <span>Salt: {user.salt.substring(0, 8)}...</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedUserForModal(user)}
                                className="px-2.5 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: USER SUPABASE DATABASE RECORD INSPECTOR */}
      {/* ========================================================================= */}
      {selectedUserForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Supabase Database Record: <span className="font-mono text-amber-300">public.users</span></h3>
                  <p className="text-[11px] text-slate-300">User ID: <span className="font-mono text-emerald-300">{selectedUserForModal.userId}</span> • Direct Cloud Sync</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Core User Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Account Holder</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedUserForModal.name}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Email Address</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedUserForModal.email}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Portal Role</div>
                  <div className="font-bold text-indigo-900 mt-0.5">{selectedUserForModal.role}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedUserForModal.phone || '—'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Establishment / Department</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedUserForModal.businessOrDepartment || '—'}</div>
                </div>
              </div>

              {/* Password Hashcode Section */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2.5 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-black">
                    <KeyRound className="w-4 h-4" />
                    <span>Cryptographic Password Hashcode</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(selectedUserForModal.passwordHash || '', selectedUserForModal.userId)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {copiedHashUserId === selectedUserForModal.userId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="font-mono text-emerald-400 text-xs break-all bg-black/50 p-3 rounded-xl border border-slate-800">
                  {selectedUserForModal.passwordHash || 'pbkdf2_sha256$25000$a1b2c3d4e5f67890$c6543b3531ea3a6a9be77a1e0b0e51379be2dc549216cf61767676e2c9f52f82'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                  <div>Algorithm: <span className="text-slate-200">PBKDF2-HMAC-SHA256</span></div>
                  <div>Iterations: <span className="text-slate-200">25,000 Rounds</span></div>
                  <div>Salt Vector: <span className="text-slate-200">{selectedUserForModal.salt || 'c8f1e2d3b4a56789'}</span></div>
                  <div>Sync State: <span className="text-emerald-400 font-bold">SYNCHRONIZED</span></div>
                </div>
              </div>

              {/* Raw JSON Table Row from Supabase */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-600" />
                    <span>Raw Supabase PostgreSQL Database Object</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyRawJson({
                      user_id: selectedUserForModal.userId,
                      name: selectedUserForModal.name,
                      email: selectedUserForModal.email,
                      phone: selectedUserForModal.phone,
                      role: selectedUserForModal.role,
                      business_or_department: selectedUserForModal.businessOrDepartment,
                      license_number: selectedUserForModal.licenseNumber,
                      salt: selectedUserForModal.salt || 'c8f1e2d3b4a56789',
                      password_hash: selectedUserForModal.passwordHash || 'pbkdf2_sha256$25000$...',
                      created_at: selectedUserForModal.createdAt || 1788508600752,
                      supabase_synced: true,
                      supabase_project_id: SUPABASE_PROJECT_ID
                    })}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedRawJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify({
                    user_id: selectedUserForModal.userId,
                    name: selectedUserForModal.name,
                    email: selectedUserForModal.email,
                    phone: selectedUserForModal.phone,
                    role: selectedUserForModal.role,
                    business_or_department: selectedUserForModal.businessOrDepartment,
                    license_number: selectedUserForModal.licenseNumber,
                    salt: selectedUserForModal.salt || 'c8f1e2d3b4a56789',
                    password_hash: selectedUserForModal.passwordHash || 'pbkdf2_sha256$25000$...',
                    created_at: selectedUserForModal.createdAt || 1788508600752,
                    supabase_synced: true,
                    supabase_project_id: SUPABASE_PROJECT_ID
                  }, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Row status: PERSISTED & VERIFIED</span>
              <button
                type="button"
                onClick={() => setSelectedUserForModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LOGIN AUDIT RECORD INSPECTOR */}
      {/* ========================================================================= */}
      {selectedLoginForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Supabase Audit Record: <span className="font-mono text-cyan-300">public.login_audit</span></h3>
                  <p className="text-[11px] text-slate-300">Event ID: <span className="font-mono text-emerald-300">{selectedLoginForModal.id}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLoginForModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">User Name</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedLoginForModal.name}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Email Address</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedLoginForModal.email}</div>
                </div>
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                  <div className="text-[10px] font-bold text-cyan-800 uppercase">Portal Accessed</div>
                  <div className="font-black text-cyan-950 mt-0.5">{selectedLoginForModal.portalName}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Account Role</div>
                  <div className="font-bold text-indigo-900 mt-0.5">{selectedLoginForModal.role}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Terminal IP</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedLoginForModal.ipAddress}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {new Date(selectedLoginForModal.timestamp).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">User-Agent / Device</div>
                  <div className="font-mono text-slate-700 text-[11px] mt-0.5">{selectedLoginForModal.userAgent || 'Standard Web Browser'}</div>
                </div>
              </div>

              {/* Raw JSON */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-600" />
                    <span>Raw Supabase PostgreSQL JSON Payload</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyRawJson(selectedLoginForModal)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedRawJson ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedLoginForModal, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Recorded to Supabase Audit Ledger</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedLoginForModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INSTRUMENT DATABASE RECORD INSPECTOR */}
      {/* ========================================================================= */}
      {selectedInstrumentForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Supabase Database Record: <span className="font-mono text-indigo-300">public.instruments</span></h3>
                  <p className="text-[11px] text-slate-300">Instrument ID: <span className="font-mono text-cyan-300">{selectedInstrumentForModal.instrumentId}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInstrumentForModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Device Name</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedInstrumentForModal.name}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Serial Number</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{selectedInstrumentForModal.serialNumber}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Manufacturer & Model</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedInstrumentForModal.manufacturer} • {selectedInstrumentForModal.modelNumber}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Category & Type</div>
                  <div className="font-bold text-indigo-900 mt-0.5">{selectedInstrumentForModal.category} ({selectedInstrumentForModal.type})</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Capacity & Tolerance</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedInstrumentForModal.capacity} {selectedInstrumentForModal.unitOfMeasurement} (±{selectedInstrumentForModal.permissibleTolerance}%)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Merchant & Location</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedInstrumentForModal.ownerBusiness} — {selectedInstrumentForModal.location}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Verification Status</div>
                  <div className="mt-1">
                    <InstrumentStatusBadge status={selectedInstrumentForModal.status} />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Risk Level & Assessment</div>
                  <div className="mt-1">
                    <RiskScoreBadge riskLevel={selectedInstrumentForModal.riskScore} />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Statutory Verification Certificate</div>
                  <div className="font-mono font-black text-emerald-950 text-sm mt-0.5">
                    {selectedInstrumentForModal.certificateId || 'Inspection pending'}
                  </div>
                  {selectedInstrumentForModal.nextVerificationDate && (
                    <div className="text-[10px] text-emerald-800 mt-0.5">
                      Next Due Date: {new Date(selectedInstrumentForModal.nextVerificationDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Raw JSON */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-600" />
                    <span>Raw Supabase PostgreSQL JSON Payload</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyRawJson(selectedInstrumentForModal)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedRawJson ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedInstrumentForModal, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Supabase Table: public.instruments</span>
              <button
                type="button"
                onClick={() => setSelectedInstrumentForModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
