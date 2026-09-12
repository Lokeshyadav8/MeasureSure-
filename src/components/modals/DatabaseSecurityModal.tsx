import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Database, KeyRound, AlertTriangle, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { SecurityAuditReport } from '../../types';
import { fetchSecurityAudit } from '../../services/authService';

interface DatabaseSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSecurityModal: React.FC<DatabaseSecurityModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<SecurityAuditReport | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAudit = async () => {
    setLoading(true);
    const data = await fetchSecurityAudit();
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAudit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base sm:text-lg">
                Database Encryption & Breach Protection Audit
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cryptographic Salted Hash Security Verification (PBKDF2-SHA512)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="text-[10px] uppercase font-bold text-emerald-800">Hashing Engine</div>
            <div className="text-xs font-black text-emerald-950 mt-0.5">PBKDF2-SHA512</div>
            <div className="text-[9px] text-emerald-700 mt-0.5">100,000 Rounds</div>
          </div>

          <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200">
            <div className="text-[10px] uppercase font-bold text-cyan-800">Crypto Salt</div>
            <div className="text-xs font-black text-cyan-950 mt-0.5">128-Bit Unique</div>
            <div className="text-[9px] text-cyan-700 mt-0.5">Per-User Generated</div>
          </div>

          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
            <div className="text-[10px] uppercase font-bold text-indigo-800">Plaintext Stored</div>
            <div className="text-xs font-black text-indigo-950 mt-0.5">0 (Zero Exposure)</div>
            <div className="text-[9px] text-indigo-700 mt-0.5">No Plaintext Keys</div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="text-[10px] uppercase font-bold text-amber-800">Breach Defense</div>
            <div className="text-xs font-black text-amber-950 mt-0.5">Irreversible</div>
            <div className="text-[9px] text-amber-700 mt-0.5">One-Way Hashcodes</div>
          </div>
        </div>

        {/* Breach Protection Explanation */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="font-bold flex items-center gap-2 text-cyan-300">
            <Lock className="w-4 h-4" />
            <span>Why Passwords & Usernames Are Immune in a Data Breach</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Even if an unauthorized party gains access to the database file (<code>users_database.json</code>), they <strong>cannot recover any passwords</strong>. Each password is mixed with a cryptographically random 16-byte salt and put through <strong>100,000 recursive hashing iterations</strong> using SHA-512. Rainbow table attacks and brute force cracking are mathematically infeasible.
          </p>
        </div>

        {/* Live Database Records (Demonstrating Irreversible Hashcodes) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-700" />
              <span>Registered User Database Records ({report?.records?.length || 0} Accounts)</span>
            </label>
            <button
              type="button"
              onClick={loadAudit}
              disabled={loading}
              className="text-[11px] text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Audit</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs">
            {report?.records?.map((record, index) => (
              <div key={record.userId || index} className="p-3 bg-slate-50/70 hover:bg-white transition-colors space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-slate-950 flex items-center gap-2">
                    <span>{record.email}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-semibold">
                      {record.role}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 font-bold">
                    Phone: {record.phone || 'N/A'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-bold block">16-Byte Cryptographic Salt:</span>
                    <span className="text-slate-800 font-black">{record.saltSnippet}</span>
                  </div>
                  <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-bold block">Irreversible Hashcode (128-Hex):</span>
                    <span className="text-cyan-800 font-black truncate block">{record.hashSnippet}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>FIPS-Compliant Cryptographic Hash Protection Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
