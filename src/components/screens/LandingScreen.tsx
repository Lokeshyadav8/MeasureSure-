import React from 'react';
import {
  Scale,
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
  Search,
  LogIn,
  Lock,
  QrCode
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { UserRole } from '../../types';

export const LandingScreen: React.FC = () => {
  const { setUserRole, setActiveScreen, isAuthenticated, instruments, requests, certificates } = useMetrology();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setActiveScreen('LOGIN');
  };

  const certifiedCount = instruments.filter(i => i.status === 'CERTIFICATE_GENERATED').length;
  const pendingCount = requests.filter(r => r.status !== 'CERTIFICATE_GENERATED' && r.status !== 'FAILED').length;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 flex flex-col justify-between">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>ISO/IEC 17025 & OIML R76 Legal Metrology Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
            Online Verification System for Weighing & Measuring Instruments
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Statutory metrological registry, tamper-evident digital certificates, real-time QR validation, and Gemini AI calibration anomaly diagnostics.
          </p>

          {/* Secure Access Action */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveScreen('PUBLIC_VERIFY')}
              className="inline-flex items-center gap-2.5 px-7 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-base font-extrabold shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
            >
              <QrCode className="w-5 h-5 text-emerald-200" />
              <span>Verify Instrument QR Code</span>
            </button>

            {!isAuthenticated ? (
              <button
                onClick={() => setActiveScreen('LOGIN')}
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-extrabold shadow-lg shadow-slate-900/20 transition-all active:scale-95"
              >
                <LogIn className="w-5 h-5 text-cyan-400" />
                <span>Sign In via Officer Portal</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveScreen('DASHBOARD')}
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-extrabold shadow-lg shadow-slate-900/20 transition-all active:scale-95"
              >
                <Scale className="w-5 h-5 text-cyan-400" />
                <span>Go to Authenticated Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Counter */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {instruments.length}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Registered Devices
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {certifiedCount}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Verified & Certified
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {pendingCount}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Active Workflow
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600">
              {certificates.length}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Issued Certificates
            </div>
          </div>
        </div>

        {/* Role Access Cards */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="text-center mb-6 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Statutory Credential-Gated Access Control</span>
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Select Stakeholder Role to Sign In
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Direct unauthenticated access is restricted. Choose your role below to open the official login gateway and authenticate your identity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Business Owner */}
            <div
              onClick={() => handleRoleSelect('BUSINESS_OWNER')}
              className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-cyan-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    Business Owner
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Register scales & meters, request statutory verification, auto-scan specs via AI OCR.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-600">
                <span>Sign In as Business Owner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Inspector */}
            <div
              onClick={() => handleRoleSelect('INSPECTOR')}
              className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Legal Inspector
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Execute calibration tests, run AI anomaly & drift diagnostics, issue digital certificates.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Sign In as Inspector</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Public Consumer */}
            <div
              onClick={() => handleRoleSelect('PUBLIC')}
              className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Public Citizen
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Verify legal seals on grocery scales, fuel dispensers, and weighbridges instantly.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Sign In as Citizen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Statutory Footer */}
      <footer id="landing-footer" className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">GovVerify Legal Metrology Directorate</span>
            <span>•</span>
            <span>ISO/IEC 17025 Compliance Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Powered by Google Gemini 2.5 Flash AI</span>
            <button
              type="button"
              id="landing-footer-admin-link"
              onClick={() => setActiveScreen('ADMIN_PORTAL')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal Access</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
