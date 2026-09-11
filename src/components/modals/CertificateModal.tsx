import React, { useState } from 'react';
import {
  X,
  Award,
  Download,
  FileCheck,
  Printer,
  FileText,
  Scan,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CertificateEntity } from '../../types';
import { ScannedCertificateView } from '../common/ScannedCertificateView';
import { MetrologyQrCode } from '../common/QrCodeGenerator';
import { formatCapacity } from '../../utils/formatters';
import { useMetrology } from '../../context/MetrologyContext';

interface CertificateModalProps {
  certificate: CertificateEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose
}) => {
  const { openScannedPhotoViewer } = useMetrology();
  const [viewMode, setViewMode] = useState<'SCANNED' | 'DIGITAL'>('SCANNED');

  if (!isOpen || !certificate) return null;

  const isExpired = certificate.status === 'EXPIRED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Statutory Certificate of Verification (Form VI)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {certificate.certificateNumber} • Issued by {certificate.inspectorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:inline-flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('SCANNED')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'SCANNED'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scanned Form VI</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('DIGITAL')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'DIGITAL'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Digital Summary</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Content Viewport */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-stone-100 flex-1">
          {viewMode === 'SCANNED' ? (
            <ScannedCertificateView
              certificate={certificate}
              showActions={false}
              hideQrCode={false}
              onSimulateScan={() => {
                onClose();
                openScannedPhotoViewer(certificate);
              }}
            />
          ) : (
            /* Digital Summary View */
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                    Digital Verification Record
                  </span>
                  <h2 className="text-lg font-black text-slate-900">
                    {certificate.certificateNumber}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Statutory Metrology & Measurement Standards Registry
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isExpired ? 'Expired' : 'Verified & Active'}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Instrument ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{certificate.instrumentId}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Instrument Name</span>
                  <span className="font-bold text-slate-900">{certificate.instrumentName} ({certificate.instrumentType})</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Manufacturer & Model</span>
                  <span className="font-medium text-slate-800">{certificate.manufacturer} - {certificate.modelNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Serial Number</span>
                  <span className="font-mono font-bold text-slate-800">{certificate.serialNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Capacity</span>
                  <span className="font-bold text-slate-900">{formatCapacity(certificate.capacity, certificate.unit)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Registered Business</span>
                  <span className="font-bold text-slate-900">{certificate.ownerBusiness}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Location</span>
                  <span className="font-medium text-slate-800">{certificate.location}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">Inspector & Tamper Seal</span>
                  <span className="font-medium text-slate-900">{certificate.inspectorName} ({certificate.tamperSealNumber})</span>
                </div>
              </div>

              {/* QR Verification Payload Block */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Real-Time Scannable QR Seal</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Scan with your phone camera or the public portal scanner to verify live statutory status.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Valid Until: {certificate.validUntil}
                  </p>
                </div>
                <div className="shrink-0">
                  <MetrologyQrCode
                    data={certificate.certificateNumber}
                    size={96}
                    showEmblem={false}
                    downloadable={true}
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'SCANNED' ? 'DIGITAL' : 'SCANNED')}
              className="sm:hidden px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
            >
              Switch to {viewMode === 'SCANNED' ? 'Digital' : 'Scanned'} View
            </button>
            <span className="hidden sm:inline text-xs text-slate-500">
              Department of Legal Metrology • Form VI Verification Certificate
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                openScannedPhotoViewer(certificate);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
              title="Simulate scanning this QR code to view the certificate with the QR code removed in the photo viewer"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-200" />
              <span>Scan QR (Open Photo Viewer)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Done</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
