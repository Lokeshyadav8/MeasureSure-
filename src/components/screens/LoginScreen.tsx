import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  Award,
  Users,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building,
  UserCheck,
  Fingerprint,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { UserRole } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, registerUser, setActiveScreen, userRole } = useMetrology();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>(userRole || 'BUSINESS_OWNER');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form States
  const [emailOrId, setEmailOrId] = useState('david.chen@apexlogistics.com');
  const [password, setPassword] = useState('GovVerify@2026');
  const [officerBadge, setOfficerBadge] = useState('LM-BUS-9821');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('BUSINESS_OWNER');
  const [regBusiness, setRegBusiness] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLicense, setRegLicense] = useState('');

  // Preset accounts for 1-Click Quick Demo Sign-in
  const demoAccounts: {
    role: UserRole;
    title: string;
    name: string;
    dept: string;
    email: string;
    badge: string;
    badgeLabel: string;
    icon: React.ReactNode;
    color: string;
    borderHover: string;
    bgAccent: string;
    textColor: string;
    badgeColor: string;
    description: string;
  }[] = [
    {
      role: 'BUSINESS_OWNER',
      title: 'Business & Merchant',
      name: 'Lokesh Yadav',
      dept: 'Apex Logistics & Freight Hub',
      email: 'lokesh@apexlogistics.com',
      badge: 'LM-BUS-9821',
      badgeLabel: 'Merchant License',
      icon: <Scale className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-600',
      borderHover: 'hover:border-cyan-400',
      bgAccent: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      description: 'Register scales & weighbridges, request statutory calibration, auto-scan specs via AI OCR, download digital certificates.'
    },
    {
      role: 'INSPECTOR',
      title: 'Legal Metrology Officer',
      name: 'Officer Ramakrishna',
      dept: 'Legal Metrology Directorate - Zone 1',
      email: 'Rama.krishna@metrology.gov',
      badge: 'LMO-CERT-4410',
      badgeLabel: 'Inspector Cadre ID',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'from-indigo-500 to-blue-700',
      borderHover: 'hover:border-indigo-400',
      bgAccent: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Verify field instruments, conduct multi-point standard weight tests, run Gemini AI anomaly detection, apply tamper seals.'
    },
    {
      role: 'ADMIN',
      title: 'Directorate Central Admin',
      name: 'Chief Inspector Pavan',
      dept: 'National Metrological Regulatory Board',
      email: 'pavan@govmetrology.state.gov',
      badge: 'EXEC-MET-001',
      badgeLabel: 'Directorate Badge',
      icon: <Award className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-600',
      borderHover: 'hover:border-amber-400',
      bgAccent: 'bg-amber-50',
      textColor: 'text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Statutory oversight, national AI risk radar, compliance audit logs, cadre inspector management, certificate revocation.'
    },
    {
      role: 'PUBLIC',
      title: 'Citizen Consumer Portal',
      name: 'Rajesh Sharma (Citizen)',
      dept: 'Public Verification & Grievance Portal',
      email: 'consumer@publicportal.gov',
      badge: 'CITIZEN-VERIFIER',
      badgeLabel: 'Public Access',
      icon: <Users className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-600',
      borderHover: 'hover:border-emerald-400',
      bgAccent: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Instant QR seal scanner, verify commercial scale calibration certificates, file short-measurement malpractice grievances.'
    }
  ];

  // Handle switching role tabs on the login form
  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setErrorMessage('');
    const demo = demoAccounts.find(d => d.role === role);
    if (demo) {
      setEmailOrId(demo.email);
      setOfficerBadge(demo.badge);
      setPassword('GovVerify@2026');
    }
  };

  useEffect(() => {
    if (userRole) {
      handleRoleTabChange(userRole);
    }
  }, [userRole]);

  // 1-Click Quick Demo Login
  const handleQuickLogin = async (account: typeof demoAccounts[0]) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await login(account.role, account.email, 'GovVerify@2026', account.name, account.dept);
    } catch (err) {
      setErrorMessage('Failed to authenticate demo profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit standard login form
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      setErrorMessage('Please provide an email address, Officer ID, or License Number.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const demo = demoAccounts.find(d => d.role === activeRoleTab);
      await login(
        activeRoleTab,
        emailOrId,
        password,
        demo?.name || 'Authorized User',
        demo?.dept || 'Legal Metrology Portal'
      );
    } catch (err) {
      setErrorMessage('Invalid authentication credentials. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit registration form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Please fill in your full name and official email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      await registerUser({
        name: regName,
        email: regEmail,
        role: regRole,
        businessOrDepartment: regBusiness || (regRole === 'BUSINESS_OWNER' ? 'Registered Merchant Corp' : 'Legal Metrology Directorate'),
        phone: regPhone || '+1 (555) 000-0000',
        licenseNumber: regLicense || `LM-${regRole.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
      });
    } catch (err) {
      setErrorMessage('Failed to complete statutory registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeRoleData = demoAccounts.find(d => d.role === activeRoleTab) || demoAccounts[0];

  return (
    <div className="min-h-[calc(100vh-120px)] py-6 sm:py-10 px-3 sm:px-6 flex flex-col justify-center items-center">
      
      {/* Top Directorate Identity Banner */}
      <div className="w-full max-w-5xl text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black shadow-md border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-cyan-300 uppercase tracking-wider">GovVerify Identity & Access Portal</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-normal">Department of Consumer Affairs</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Legal Metrology Verification Gateway
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
          Official statutory access for Commercial Businesses, Legal Metrology Officers, Central Directorate Administrators, and Public Consumers.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Main: Role-Tailored Interactive Login Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Top Role Selector Tabs */}
          <div className="p-3 bg-slate-100/90 border-b border-slate-200">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 px-2 pb-2">
              Select Your Statutory Operational Role:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {demoAccounts.map(account => {
                const isActive = activeRoleTab === account.role;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleRoleTabChange(account.role)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all text-left ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-md'
                        : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80'
                    }`}
                  >
                    <span className={isActive ? 'text-cyan-400 shrink-0' : 'text-slate-500 shrink-0'}>
                      {account.icon}
                    </span>
                    <span className="truncate">{account.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Active Role Header Banner */}
            <div className={`p-4 rounded-2xl ${activeRoleData.bgAccent} border border-slate-200/70 flex items-start gap-3.5`}>
              <div className={`p-2.5 rounded-xl bg-white shadow-xs ${activeRoleData.textColor} shrink-0`}>
                {activeRoleData.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                    {activeRoleData.title} Authentication
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${activeRoleData.badgeColor}`}>
                    {activeRoleTab}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeRoleData.description}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Auth Mode Toggle (Login vs Register) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className={`text-xs font-black pb-1 transition-colors relative ${
                    authMode === 'LOGIN'
                      ? 'text-slate-950 border-b-2 border-cyan-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Statutory Sign In
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setRegRole(activeRoleTab);
                  }}
                  className={`text-xs font-black pb-1 transition-colors relative ${
                    authMode === 'REGISTER'
                      ? 'text-slate-950 border-b-2 border-cyan-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Register New Digital Account
                </button>
              </div>

              {activeRoleTab === 'PUBLIC' && (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  No Password Required
                </span>
              )}
            </div>

            {/* Mode 1: LOGIN FORM */}
            {authMode === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Dynamic Field 1: Email / Officer ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>
                      {activeRoleTab === 'INSPECTOR'
                        ? 'Inspector Govt Email or Officer ID'
                        : activeRoleTab === 'ADMIN'
                        ? 'Central Directorate Administrative Email'
                        : activeRoleTab === 'PUBLIC'
                        ? 'Citizen Email or Contact Phone (Optional)'
                        : 'Business / Merchant Registered Email'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Official Credential</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={emailOrId}
                      onChange={(e) => setEmailOrId(e.target.value)}
                      placeholder={
                        activeRoleTab === 'INSPECTOR'
                          ? 'sarah.jenkins@metrology.gov'
                          : activeRoleTab === 'ADMIN'
                          ? 'marcus.vance@govmetrology.state.gov'
                          : activeRoleTab === 'PUBLIC'
                          ? 'consumer@publicportal.gov'
                          : 'merchant@company.com'
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Dynamic Field 2: License Number / Officer Badge */}
                {activeRoleTab !== 'PUBLIC' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>{activeRoleData.badgeLabel}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Statutory ID</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={officerBadge}
                        onChange={(e) => setOfficerBadge(e.target.value)}
                        placeholder="e.g. LM-BUS-9821"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic Field 3: Password / Security Key */}
                {activeRoleTab !== 'PUBLIC' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800">
                        {activeRoleTab === 'ADMIN' ? 'Directorate 2FA Security Key' : 'Portal Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setPassword('GovVerify@2026')}
                        className="text-[10px] font-bold text-cyan-800 hover:text-cyan-900"
                      >
                        Autofill Demo Password
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Public Role Instant Access Note */
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 font-medium space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Direct Citizen Transparency Access
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Public consumers do not need statutory credentials to verify instrument seals, scan QR codes, or submit short-measurement malpractice grievances.
                    </p>
                  </div>
                )}

                {/* Remember Me & Statutory Disclaimer */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-md text-cyan-600 focus:ring-cyan-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-700">Remember session</span>
                  </label>
                  <span className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    256-bit TLS Encrypted
                  </span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-black text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    activeRoleTab === 'BUSINESS_OWNER'
                      ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20'
                      : activeRoleTab === 'INSPECTOR'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                      : activeRoleTab === 'ADMIN'
                      ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  {isLoading ? (
                    <span>Authenticating Credentials...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>
                        {activeRoleTab === 'PUBLIC'
                          ? 'Enter Public Consumer Portal'
                          : `Authenticate as ${activeRoleData.title}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            ) : (
              /* Mode 2: REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Full Name / Officer Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. john@business.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Role Category</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    >
                      <option value="BUSINESS_OWNER">Business / Merchant Owner</option>
                      <option value="INSPECTOR">Legal Metrology Inspector</option>
                      <option value="ADMIN">Central Regulatory Admin</option>
                      <option value="PUBLIC">Public Citizen</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Business / Department Name</label>
                    <input
                      type="text"
                      value={regBusiness}
                      onChange={(e) => setRegBusiness(e.target.value)}
                      placeholder="e.g. Metro Fuel Logistics Ltd."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Contact Phone</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">License / Cadre Number</label>
                    <input
                      type="text"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      placeholder="e.g. LM-BUS-5520"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-cyan-400" />
                  <span>Register & Launch Workspace</span>
                </button>
              </form>
            )}

          </div>

          {/* Statutory Footer Note */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[10px] text-slate-600 font-semibold flex items-center justify-between">
            <span>Legal Metrology Act, 2009 & OIML R-76</span>
            <span>SIH26035 Metrological Cadre</span>
          </div>

        </div>

        {/* Right Side: 1-Click Fast Switch Demo Accounts & Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                1-Click Instant Demo Profiles
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience all statutory user workflows immediately with pre-configured verified credentials:
            </p>
          </div>

          {/* Quick Demo Cards List */}
          <div className="space-y-3">
            {demoAccounts.map(account => {
              const isSelectedRole = activeRoleTab === account.role;

              return (
                <div
                  key={account.role}
                  onClick={() => handleQuickLogin(account)}
                  className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between gap-3 ${
                    isSelectedRole
                      ? 'border-slate-950 ring-2 ring-slate-950/10'
                      : 'border-slate-200/90 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${account.bgAccent} ${account.textColor} flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform`}>
                        {account.icon}
                      </div>
                      <div className="text-left leading-tight">
                        <div className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                          <span>{account.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${account.badgeColor}`}>
                            {account.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold truncate max-w-[200px] mt-0.5">
                          {account.dept}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1.5 bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700 rounded-xl text-[11px] font-black transition-all shrink-0 flex items-center gap-1"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                    <span className="truncate">{account.email}</span>
                    <span className="font-bold text-slate-700 shrink-0">{account.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-600 shrink-0" />
              Role Permissions Summary:
            </div>
            <ul className="text-[11px] space-y-1 text-slate-600 list-disc list-inside">
              <li><strong className="text-slate-900">Business:</strong> Device Registry, AI OCR Plate Scan, Certificate Downloads</li>
              <li><strong className="text-slate-900">Inspector:</strong> Test Load Tolerances, AI Anomaly Diagnosis, Seal Issuance</li>
              <li><strong className="text-slate-900">Admin:</strong> National AI Risk Radar, Immutable Audit Trail, Cadre Controls</li>
              <li><strong className="text-slate-900">Public:</strong> Holographic QR Verification, Consumer Malpractice Complaints</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
