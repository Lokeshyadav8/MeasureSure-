import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  ShieldCheck,
  Award,
  Users,
  Lock,
  Mail,
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
  AlertCircle,
  RefreshCw,
  Phone,
  KeyRound,
  Check,
  Database,
  X
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { UserRole } from '../../types';

// Helper to generate realistic 6-character captcha
const generateCaptcha = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const LoginScreen: React.FC = () => {
  const {
    login,
    registerUser,
    registerUserWithPassword,
    setActiveScreen,
    userRole,
    supabaseStatus,
    refreshSupabaseStatus,
    usersList
  } = useMetrology();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>(userRole || 'BUSINESS_OWNER');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form States (Mandatory username & password entry)
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [officerBadge, setOfficerBadge] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [userEnteredCaptcha, setUserEnteredCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUnregisteredError, setIsUnregisteredError] = useState(false);

  // Password Reset / Help Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Register Form States (Encrypted User Storage)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('BUSINESS_OWNER');
  const [regBusiness, setRegBusiness] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Preset accounts for Official Statutory Portals
  const statutoryAccounts: {
    role: UserRole;
    portalName: string;
    accountCategory: string;
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
      portalName: 'Business & Merchant Portal',
      accountCategory: 'Business Account',
      title: 'Commercial Business Owner',
      name: 'Lokeshyadav',
      dept: 'Startups / Commercial Establishment',
      email: 'lokeshthangedipally02@gmail.com',
      badge: '999999999',
      badgeLabel: 'Merchant License / GSTIN',
      icon: <Scale className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-600',
      borderHover: 'hover:border-cyan-400',
      bgAccent: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      description: 'Register scales & weighbridges, request statutory calibration, auto-scan specs via AI OCR, settle fees via BharatKosh & download certificates.'
    },
    {
      role: 'INSPECTOR',
      portalName: 'Legal Metrology Officer Portal',
      accountCategory: 'Legal Account',
      title: 'Legal Metrology Inspector',
      name: 'Officer Shreyareddy',
      dept: 'Metro fuel logistics / Directorate Zone',
      email: 'narappashreyareddy@gmail.com',
      badge: 'lm-bus-5502',
      badgeLabel: 'Inspector Cadre ID',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'from-indigo-500 to-blue-700',
      borderHover: 'hover:border-indigo-400',
      bgAccent: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Verify field instruments, conduct multi-point standard weight tests, run Gemini AI anomaly detection, and apply tamper-evident wire seals.'
    },
    {
      role: 'PUBLIC',
      portalName: 'Citizen & Consumer Portal',
      accountCategory: 'Citizens Account',
      title: 'Citizen Consumer Verifier',
      name: 'Lokesh',
      dept: 'Public Consumer Transparency Council',
      email: 'lokii.personall@gmail.com',
      badge: '777777777',
      badgeLabel: 'Public Access',
      icon: <Users className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-600',
      borderHover: 'hover:border-emerald-400',
      bgAccent: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Instant holographic QR seal scanner, verify commercial scale calibration certificates, file short-measurement malpractice complaints.'
    }
  ];

  // Handle switching role tabs on the login form
  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setErrorMessage('');
    setSuccessMessage('');
    setIsUnregisteredError(false);
    setEmailOrId('');
    setOfficerBadge('');
    setPassword('');
    setUserEnteredCaptcha('');
    setCaptchaCode(generateCaptcha());
  };

  useEffect(() => {
    if (userRole) {
      setActiveRoleTab(userRole);
    }
  }, [userRole]);

  // Submit standard login form with strict registration check
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      setErrorMessage('Please enter your registered Email address, Phone number, or Officer ID.');
      setIsUnregisteredError(false);
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your account password.');
      setIsUnregisteredError(false);
      return;
    }

    if (!userEnteredCaptcha.trim()) {
      setErrorMessage('Please enter the security captcha code.');
      setIsUnregisteredError(false);
      return;
    }

    if (userEnteredCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Invalid security captcha code. Please enter the characters shown in the security box.');
      setIsUnregisteredError(false);
      setCaptchaCode(generateCaptcha());
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setIsUnregisteredError(false);

    try {
      const result = await login(
        activeRoleTab,
        emailOrId.trim(),
        password.trim()
      );

      if (!result.success) {
        setIsUnregisteredError(result.isNotRegistered ?? true);
        setErrorMessage(result.message || 'Account not registered or details incorrect. Please check your credentials or register an account.');
      } else {
        setIsUnregisteredError(false);
        setErrorMessage('');
        setSuccessMessage(result.message || 'Login approved! Welcome to Legal Metrology Portal.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please verify your credentials.');
      setIsUnregisteredError(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit registration form (Stores in Supabase Database with PBKDF2 salted hashcode)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Please fill in your full name and official registered email address.');
      setIsUnregisteredError(false);
      return;
    }
    if (!regPhone.trim()) {
      setErrorMessage('Please provide your contact phone number for statutory SMS alerts and two-factor authentication.');
      setIsUnregisteredError(false);
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long to meet statutory security standards.');
      setIsUnregisteredError(false);
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-enter your password.');
      setIsUnregisteredError(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setIsUnregisteredError(false);
    try {
      const res = await registerUserWithPassword({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        role: regRole,
        businessOrDepartment: regBusiness.trim() || (
          regRole === 'BUSINESS_OWNER' ? 'Commercial Establishment' :
          regRole === 'INSPECTOR' ? 'Legal Metrology Directorate - Field Cadre' :
          'Public Consumer Verification Portal'
        ),
        licenseNumber: regLicense.trim() || `LM-${regRole.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
      });

      if (res.success) {
        setSuccessMessage(`Account for ${regName} registered and approved successfully! Access granted.`);
      } else {
        setErrorMessage(res.message || 'Failed to complete registration in database.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete statutory registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeRoleData = statutoryAccounts.find(d => d.role === activeRoleTab) || statutoryAccounts[0];

  return (
    <div className="min-h-[calc(100vh-120px)] py-6 sm:py-10 px-3 sm:px-6 flex flex-col justify-center items-center">
      
      {/* Top Directorate Identity Banner */}
      <div className="w-full max-w-5xl text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black shadow-md border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-cyan-300 uppercase tracking-wider">Government of India • Ministry of Consumer Affairs</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-normal">Directorate of Legal Metrology</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
          National Legal Metrology Single Sign-On (SSO)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
          Official digital portal for <strong>Commercial Businesses</strong>, <strong>Legal Metrology Officers</strong>, and <strong>Indian Citizens</strong> under Legal Metrology Act, 2009.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Main: Role-Tailored Interactive Login Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Top Role Selector Tabs */}
          <div className="p-3 bg-slate-100/90 border-b border-slate-200">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 px-2 pb-2 flex items-center justify-between">
              <span>Select Authorized Portal Category:</span>
              <span className="text-[10px] text-slate-500 font-semibold">3 Designated User Portals</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {statutoryAccounts.map(account => {
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
                    <span className="truncate">
                      {account.accountCategory}
                    </span>
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
                    {activeRoleData.accountCategory}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${activeRoleData.badgeColor}`}>
                    {activeRoleTab === 'BUSINESS_OWNER' ? 'BUSINESS' : activeRoleTab === 'INSPECTOR' ? 'LEGAL OFFICER' : activeRoleTab === 'ADMIN' ? 'DIRECTORATE' : 'CITIZENS'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeRoleData.description}
                </p>
              </div>
            </div>

            {/* Error Message & Unregistered Account Callout */}
            {isUnregisteredError ? (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-3 animate-in fade-in duration-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                      Account Not Registered or Details Incorrect
                    </h4>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      {errorMessage || `The account credentials entered are incorrect or not registered in this portal. Under Statutory Metrology Rules, please check your details or register an account.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setRegRole(activeRoleTab);
                    setRegEmail(emailOrId);
                    setIsUnregisteredError(false);
                    setErrorMessage('');
                  }}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register {activeRoleData.accountCategory} First via "Register New Merchant / Cadre" →</span>
                </button>
              </div>
            ) : errorMessage ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Mode Toggle (Login vs Register) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setIsUnregisteredError(false);
                  }}
                  className={`text-xs font-black pb-1 transition-colors relative cursor-pointer ${
                    authMode === 'LOGIN'
                      ? 'text-slate-950 border-b-2 border-cyan-600'
                      : 'text-slate-500 hover:text-slate-800'
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
                    setIsUnregisteredError(false);
                  }}
                  className={`text-xs font-black pb-1 transition-colors relative cursor-pointer ${
                    authMode === 'REGISTER'
                      ? 'text-slate-950 border-b-2 border-cyan-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register New Merchant / Cadre
                </button>
              </div>

              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Statutory Encrypted Portal</span>
              </div>
            </div>

            {/* Mode 1: LOGIN FORM */}
            {authMode === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Dynamic Field 1: Email / Officer ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>
                      {activeRoleTab === 'INSPECTOR'
                        ? 'Legal Account Email, Officer ID, or Phone'
                        : activeRoleTab === 'ADMIN'
                        ? 'Directorate Central Administrative Email or Phone'
                        : activeRoleTab === 'PUBLIC'
                        ? 'Citizens Account Email or Registered Phone'
                        : 'Business Account Registered Email or Phone'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">NIC Portal Credential</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={emailOrId}
                      onChange={(e) => {
                        setEmailOrId(e.target.value);
                        if (isUnregisteredError) setIsUnregisteredError(false);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Enter registered email or contact number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Dynamic Field 2: License Number / Officer Badge */}
                {activeRoleTab !== 'PUBLIC' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>{activeRoleData.badgeLabel}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Statutory Identifier</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={officerBadge}
                        onChange={(e) => setOfficerBadge(e.target.value)}
                        placeholder="Enter badge ID or license number"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic Field 3: Password / Security Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800">
                      {activeRoleTab === 'ADMIN' ? 'Directorate 2FA Security Key' : activeRoleTab === 'PUBLIC' ? 'Citizen Account Password / PIN' : 'Portal Password / Digital PIN'}
                    </label>
                    <span className="text-[10px] text-slate-500 font-semibold">Encrypted PBKDF2</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Enter your account password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Government Security Captcha Verification */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>Security Captcha Code</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Bot & Spam Prevention</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Security Captcha Display */}
                    <div
                      className="px-4 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-cyan-300 font-mono text-base font-black tracking-widest rounded-xl border border-slate-700 shadow-inner select-none flex items-center"
                    >
                      <span className="line-through decoration-cyan-500/40">{captchaCode}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCaptchaCode(generateCaptcha())}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                      title="Generate New Security Captcha"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={userEnteredCaptcha}
                      onChange={(e) => setUserEnteredCaptcha(e.target.value)}
                      placeholder="Enter captcha"
                      maxLength={6}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all uppercase placeholder:font-sans placeholder:font-medium"
                    />
                  </div>
                </div>

                {/* Remember Me & Statutory Disclaimer */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-md text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Stay logged in on this terminal</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 hover:underline cursor-pointer"
                  >
                    Forgot Password / PIN?
                  </button>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-black text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
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
                    <span>Verifying Statutory Credentials...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Statutory Sign In • {activeRoleData.accountCategory}</span>
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
                    <label className="text-xs font-black text-slate-800">Authorized Person Name *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Official Registered Email *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Select Account Category *</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden cursor-pointer"
                    >
                      <option value="BUSINESS_OWNER">Business Account (Commercial Merchant / Establishment)</option>
                      <option value="INSPECTOR">Legal Account (Legal Metrology Inspector Cadre)</option>
                      <option value="PUBLIC">Citizens Account (Citizen & Consumer Advocate)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Enterprise / Department Name</label>
                    <input
                      type="text"
                      value={regBusiness}
                      onChange={(e) => setRegBusiness(e.target.value)}
                      placeholder="Enter enterprise or establishment name"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Contact Phone Number *</span>
                      <span className="text-[10px] text-cyan-600 font-bold">SMS / 2FA</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. +91 98450 12345"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800">Statutory License / GSTIN / Badge</label>
                    <input
                      type="text"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      placeholder="e.g. LM-BUS-9821 / 29AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Secure Password & Confirm Password with Cryptographic Hashcode Safeguard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Account Password *</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Min 6 chars</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Confirm Password *</span>
                      {regConfirmPassword && (
                        <span className={`text-[10px] font-bold ${regPassword === regConfirmPassword ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {regPassword === regConfirmPassword ? '✓ Matches' : '✗ Mismatch'}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Breach Encryption Notice */}
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-[11px] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-cyan-300 font-bold">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero-Plaintext Credential Encryption</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 font-mono">
                      PBKDF2-SHA256
                    </span>
                  </div>
                  <p className="text-slate-400 leading-snug text-[10.5px]">
                    All credentials are encrypted with <strong>25,000 PBKDF2 iterations</strong> and unique <strong>128-bit cryptographic salts</strong>. Plaintext passwords are never stored, protecting user accounts against unauthorized access or breaches.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Encrypting & Registering Account...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Complete Statutory Registration</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Statutory Footer Note */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[10px] text-slate-600 font-semibold flex items-center justify-between">
            <span>Legal Metrology Act, 2009 & General Rules 2011</span>
            <span>National Metrology Network • Govt. of India</span>
          </div>

        </div>

        {/* Right Side: Security Policies & Statutory Information (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Official Credential Access Policy
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under Section 15 of the Legal Metrology Act, 2009, direct unauthenticated access is strictly prohibited. All commercial business owners, calibration officers, and regulatory authorities must authenticate with their registered username/email and statutory password.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex items-start gap-2">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Passwords are verified securely with statutory role verification and audit logging on national registry servers.
              </span>
            </div>
          </div>

          {/* Statutory Access & Role Matrix */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Statutory Role & Interface Matrix</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-[11px] flex items-center justify-between">
                  <span>Commercial Business Owner</span>
                  <span className="text-[10px] text-cyan-700 font-mono font-bold">Portal 1</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Register instruments, AI OCR plate scan, fee payments, and verified certificates.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-[11px] flex items-center justify-between">
                  <span>Legal Metrology Field Inspector</span>
                  <span className="text-[10px] text-indigo-700 font-mono font-bold">Portal 2</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Standard weight tests, Gemini AI anomaly detection, and tamper-evident wire seal issuance.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-[11px] flex items-center justify-between">
                  <span>Citizen Consumer Verifier</span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">Public</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Holographic QR seal scanner, calibration certificate check, and malpractice reporting.
                </div>
              </div>
            </div>
          </div>

          {/* Helpdesk & Credential Assistance Box */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Need Registration or Credential Help?</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              If you have forgotten your password or need a new Legal Metrology Cadre ID, switch to the <strong>Register</strong> tab on the left or contact your State Directorate Helpdesk at <span className="font-mono font-bold text-slate-800">1800-11-4000</span>.
            </p>
          </div>

        </div>

      </div>

      {/* Footer Section with Admin Portal Link */}
      <footer id="login-footer" className="w-full max-w-5xl mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <span>Department of Consumer Affairs • Legal Metrology Act, 2009 Standards & Compliance</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="footer-admin-portal-btn"
            onClick={() => setActiveScreen('ADMIN_PORTAL')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all group"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Administrator Portal (Login / Setup)</span>
          </button>
        </div>
      </footer>

      {/* Forgot Password / Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-950 text-sm">Security Credential Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setOtpSent(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered official email or mobile number to receive a statutory 6-digit One-Time Password (OTP) for password reset:
            </p>

            {!otpSent ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email or registered phone number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setOtpSent(true)}
                  className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-black transition-all"
                >
                  Send Verification OTP
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OTP dispatched to registered contact. Use default test PIN: <strong>482190</strong></span>
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  defaultValue="482190"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center tracking-widest text-slate-900 focus:bg-white focus:border-cyan-600 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPassword('GovVerify@2026');
                    setShowForgotModal(false);
                    setOtpSent(false);
                    setSuccessMessage('Credentials reset successfully. Default password applied.');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all"
                >
                  Confirm & Reset Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
