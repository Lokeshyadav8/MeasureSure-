import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
  Scale,
  ShieldCheck,
  FileCheck,
  Scan
} from 'lucide-react';
import { CertificateEntity, InstrumentEntity } from '../../types';
import { ScannedCertificateView } from './ScannedCertificateView';
import { formatCapacity } from '../../utils/formatters';

interface ScannedCertificatePhotoViewerProps {
  isOpen: boolean;
  certificate: CertificateEntity | null;
  onClose: () => void;
  availableCertificates?: CertificateEntity[];
  onSelectCertificate?: (cert: CertificateEntity) => void;
}

export const ScannedCertificatePhotoViewer: React.FC<ScannedCertificatePhotoViewerProps> = ({
  isOpen,
  certificate,
  onClose,
  availableCertificates = [],
  onSelectCertificate
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showInfoSidebar, setShowInfoSidebar] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & rotation when certificate changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen, certificate?.certificateNumber]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  const isExpired = certificate.status === 'EXPIRED';

  // Navigation between instruments/certificates
  const currentIndex = availableCertificates.findIndex(
    c => c.certificateNumber === certificate.certificateNumber
  );
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < availableCertificates.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectCertificate) {
      onSelectCertificate(availableCertificates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectCertificate) {
      onSelectCertificate(availableCertificates[currentIndex + 1]);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));
  const handleResetZoom = () => {
    setZoom(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={containerRef}
      id="scanned-certificate-photo-viewer"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col select-none overflow-hidden animate-in fade-in duration-200"
    >
      {/* 1. Top Photo Viewer Control Toolbar */}
      <div className="h-14 sm:h-16 px-3 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-30">
        
        {/* Left: Certificate & Instrument Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Scan className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-white truncate">
                {certificate.instrumentName}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isExpired ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isExpired ? 'Expired' : 'Verified (QR Scanned)'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
              Cert: {certificate.certificateNumber} • QR Code Removed for Scanned Photo View
            </p>
          </div>
        </div>

        {/* Center: Viewer Tools (Zoom, Rotate, Fullscreen) */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 60}
            title="Zoom Out"
            className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom to 100%"
            className="px-2 py-1 text-[11px] font-mono font-bold text-slate-200 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors"
          >
            {zoom}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Zoom In"
            className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-0.5"></div>

          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90 Degrees"
            className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Actions (Info, Print, Close) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setShowInfoSidebar(!showInfoSidebar)}
            title="Toggle Certificate Details"
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              showInfoSidebar
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            title="Print Scanned Certificate"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Photo Viewer (Esc)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-white transition-all ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* 2. Main Viewer Canvas & Document Container */}
      <div className="relative flex-1 flex overflow-hidden">
        
        {/* Previous Certificate Arrow (if available) */}
        {hasPrev && (
          <button
            type="button"
            onClick={handlePrev}
            title="Previous Certificate"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-2xl transition-all active:scale-95 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Certificate Arrow (if available) */}
        {hasNext && (
          <button
            type="button"
            onClick={handleNext}
            title="Next Certificate"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-2xl transition-all active:scale-95 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Photo Viewport with smooth pan/scroll */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-3 sm:p-8 md:p-12">
          
          <div
            className="transition-transform duration-150 ease-out origin-top flex flex-col items-center select-text"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              width: '100%',
              maxWidth: '860px'
            }}
          >
            {/* Scanned Certificate Card with QR code REMOVED */}
            <div className="w-full relative shadow-2xl rounded-sm">
              <ScannedCertificateView
                certificate={certificate}
                showActions={false}
                hideQrCode={true}
              />
            </div>

            {/* Bottom Scanned Photo Seal Note */}
            <div className="mt-4 p-3 bg-slate-900/80 border border-slate-800 text-slate-300 rounded-xl text-center text-xs font-mono max-w-lg backdrop-blur-sm">
              <span className="text-emerald-400 font-bold">✓ Authentic Scanned Document</span>: QR code seal decoded and replaced with official electronic verification stamp.
            </div>
          </div>

        </div>

        {/* 3. Slide-in Certificate Info Sidebar */}
        {showInfoSidebar && (
          <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto z-30 shrink-0 text-white space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Certificate Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoSidebar(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Card */}
            <div className={`p-3.5 rounded-2xl border ${
              isExpired
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Verification Status</span>
                  <span className="text-xs font-black">{isExpired ? 'Expired / Requires Re-test' : 'Officially Verified & Active'}</span>
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Certificate Number</span>
                <span className="font-mono font-bold text-slate-100">{certificate.certificateNumber}</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Instrument</span>
                <span className="font-bold text-slate-100">{certificate.instrumentName}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">Type: {certificate.instrumentType}</div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Manufacturer & Serial No</span>
                <span className="font-medium text-slate-200">{certificate.manufacturer} • {certificate.modelNumber}</span>
                <div className="font-mono text-cyan-300 text-[11px] mt-0.5">S/N: {certificate.serialNumber}</div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Capacity</span>
                <span className="font-bold text-slate-100">{formatCapacity(certificate.capacity, certificate.unit)}</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Commercial User / Business</span>
                <span className="font-medium text-slate-200">{certificate.ownerBusiness}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">{certificate.location}</div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Physical Tamper Wire Seal</span>
                <span className="font-mono font-bold text-amber-300">{certificate.tamperSealNumber}</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Verification & Expiry Dates</span>
                <div className="flex items-center justify-between mt-1 text-slate-200">
                  <span>Stamped: <strong>{certificate.verificationDate}</strong></span>
                  <span>Valid: <strong className={isExpired ? 'text-rose-400' : 'text-emerald-400'}>{certificate.validUntil}</strong></span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-semibold block">Issuing Officer</span>
                <span className="font-medium text-slate-200">{certificate.inspectorName}</span>
              </div>
            </div>

            {/* Quick Switch to Other Certificates */}
            {availableCertificates.length > 1 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Other Registered Instruments ({availableCertificates.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {availableCertificates.map(c => (
                    <button
                      key={c.certificateNumber}
                      type="button"
                      onClick={() => onSelectCertificate && onSelectCertificate(c)}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        c.certificateNumber === certificate.certificateNumber
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300'
                      }`}
                    >
                      <span className="truncate max-w-[170px]">{c.instrumentName}</span>
                      <span className="font-mono text-[10px] opacity-75">{c.certificateNumber.slice(-8)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 4. Bottom Scannable Status Indicator Bar */}
      <div className="h-10 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">
            National Legal Metrology Digital Verification System • Section 24 Form VI
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>Use Zoom controls or mouse wheel to inspect seals</span>
          <span>•</span>
          <button
            type="button"
            onClick={onClose}
            className="text-cyan-400 hover:underline font-bold"
          >
            Press Esc to Close
          </button>
        </div>
      </div>
    </div>
  );
};
