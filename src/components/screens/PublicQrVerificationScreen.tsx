import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Eye,
  Camera,
  Scan,
  ShieldCheck,
  Upload,
  VideoOff,
  Sparkles,
  FileCheck,
  Maximize2,
  Printer,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { MetrologyQrCode } from '../common/QrCodeGenerator';
import { ScannedCertificateView } from '../common/ScannedCertificateView';
import { formatCapacity } from '../../utils/formatters';
import { extractVerificationCode } from '../../utils/verification';

export const PublicQrVerificationScreen: React.FC = () => {
  const {
    certificates,
    publicSearchQuery,
    publicSearchResult,
    publicHasSearched,
    searchPublicCertificate,
    setSelectedCertificate,
    setShowCertificateModal,
    openScannedPhotoViewer,
    submitGrievanceReport,
    setActiveScreen,
    isAuthenticated
  } = useMetrology();

  const [inputVal, setInputVal] = useState(publicSearchQuery || 'CERT-2026-NLM-0841');
  const [scannerMode, setScannerMode] = useState<'CAMERA' | 'FILE' | 'TEST'>('TEST');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [showFullScannedCert, setShowFullScannedCert] = useState(true);
  const [showScanner, setShowScanner] = useState<boolean>(!publicSearchResult);

  useEffect(() => {
    if (publicSearchResult) {
      setShowScanner(false);
    }
  }, [publicSearchResult]);

  useEffect(() => {
    if (publicSearchQuery) {
      setInputVal(publicSearchQuery);
    }
  }, [publicSearchQuery]);

  // Citizen grievance form state
  const [grievanceBusiness, setGrievanceBusiness] = useState('');
  const [grievanceLocation, setGrievanceLocation] = useState('');
  const [grievanceType, setGrievanceType] = useState('SHORT_DELIVERY');
  const [grievanceDesc, setGrievanceDesc] = useState('');
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const sampleCerts = [
    { code: 'CERT-2026-NLM-0841', label: 'Apex Heavy Weighbridge (Active Form VI)' },
    { code: 'CERT-2025-NLM-0219', label: 'PetroMax Fuel Pump #4 (Valid Active)' },
    { code: 'CERT-2024-NLM-0782', label: 'Crane Scale (Expired/Needs Re-test)' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    stopCamera();
    const target = inputVal.trim();
    if (!target) return;
    searchPublicCertificate(target);
    setShowScanner(false);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?verify=${encodeURIComponent(target)}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  };

  const handleQuickSelect = (code: string) => {
    stopCamera();
    setInputVal(code);
    searchPublicCertificate(code);
    setShowScanner(false);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?verify=${encodeURIComponent(code)}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  };

  // Start live device camera scanner with real-time jsQR frame decoding
  const startCamera = async () => {
    setCameraError(null);
    setScanMessage('Initializing device camera...');
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setScanMessage('Align QR seal inside viewfinder to scan');
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access or use photo upload below.'
          : 'Could not connect to camera stream. Please use photo upload or sample codes.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Continuous frame scanning loop using jsQR
  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            const rawDecoded = code.data.trim();
            const cleanCode = extractVerificationCode(rawDecoded) || rawDecoded;
            setScanMessage(`Scanned: ${cleanCode}`);
            setInputVal(cleanCode);
            searchPublicCertificate(cleanCode);
            setShowScanner(false);
            stopCamera();
            if (typeof window !== 'undefined') {
              const newUrl = `${window.location.pathname}?verify=${encodeURIComponent(cleanCode)}`;
              window.history.replaceState({ path: newUrl }, '', newUrl);
            }
            return;
          }
        }
      }
    }
    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [isCameraActive, searchPublicCertificate, stopCamera]);

  useEffect(() => {
    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, tick]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle uploaded image / photo of QR code
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    setScanMessage('Processing uploaded certificate photo...');
    const reader = new FileReader();

    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            const rawDecoded = code.data.trim();
            const cleanCode = extractVerificationCode(rawDecoded) || rawDecoded;
            setInputVal(cleanCode);
            searchPublicCertificate(cleanCode);
            setShowScanner(false);
            setScanMessage(`Decoded QR code: ${cleanCode}`);
            if (typeof window !== 'undefined') {
              const newUrl = `${window.location.pathname}?verify=${encodeURIComponent(cleanCode)}`;
              window.history.replaceState({ path: newUrl }, '', newUrl);
            }
          } else {
            // If no QR detected in image, try to check if file name matches a certificate
            const nameMatch = file.name.match(/CERT-\d+-[A-Z]+-\d+/i);
            if (nameMatch) {
              setInputVal(nameMatch[0]);
              searchPublicCertificate(nameMatch[0]);
              setShowScanner(false);
              if (typeof window !== 'undefined') {
                const newUrl = `${window.location.pathname}?verify=${encodeURIComponent(nameMatch[0])}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
              }
            } else {
              setScanMessage('No clear QR code detected in this photo. Please ensure good lighting and contrast.');
            }
          }
        }
        setIsScanningFile(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceBusiness || !grievanceDesc) return;
    submitGrievanceReport({
      reporterName: 'Anonymous Citizen Whistleblower',
      reporterContact: 'Via Public Verification Portal',
      category: grievanceType === 'BROKEN_SEAL' ? 'TAMPERED_SEAL' : grievanceType === 'INSPECTION_DELAY' ? 'INSPECTION_DELAY' : 'SHORT_DELIVERY_MALPRACTICE',
      establishmentName: grievanceBusiness,
      instrumentTypeOrId: publicSearchResult?.instrumentId || 'PUBLIC-REPORT',
      location: grievanceLocation || 'Commercial Operating Premise',
      issueDescription: `[Type: ${grievanceType}] ${grievanceDesc}`,
      severity: grievanceType === 'BROKEN_SEAL' ? 'CRITICAL' : 'URGENT'
    });
    setGrievanceSubmitted(true);
    setTimeout(() => {
      setGrievanceSubmitted(false);
      setGrievanceDesc('');
      setGrievanceBusiness('');
      setGrievanceLocation('');
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setActiveScreen(isAuthenticated ? 'DASHBOARD' : 'LANDING')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {isAuthenticated ? 'Dashboard' : 'Home'}</span>
        </button>

        {publicSearchResult && (
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{showScanner ? 'Hide Scanner' : 'Scan Another QR Code'}</span>
            {showScanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* 1. If a verified certificate is found, display it at the VERY TOP */}
      {publicSearchResult && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-4">
          {/* Top Result Status Banner */}
          <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            publicSearchResult.status === 'EXPIRED'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                publicSearchResult.status === 'EXPIRED' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {publicSearchResult.status === 'EXPIRED' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  National Legal Metrology Registry Status
                </span>
                <h3 className="text-sm sm:text-base font-black">
                  {publicSearchResult.status === 'EXPIRED'
                    ? 'EXPIRED / RE-VERIFICATION MANDATED'
                    : 'OFFICIALLY VERIFIED & ACTIVE IN REGISTRY'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-600">
                  <span className="font-mono font-bold text-slate-800">{publicSearchResult.certificateNumber}</span>
                  <span>•</span>
                  <span>Valid until: <strong className="font-semibold text-slate-800">{publicSearchResult.validUntil}</strong></span>
                  <span>•</span>
                  <span>Physical Wire Seal: <code className="font-mono font-bold text-emerald-700">{publicSearchResult.tamperSealNumber || 'PB-7749-WIRE'}</code></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openScannedPhotoViewer(publicSearchResult)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                <Scan className="w-3.5 h-3.5 text-emerald-200" />
                <span>Open Simple Photo Viewer (QR Removed)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCertificate(publicSearchResult);
                  setShowCertificateModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xs"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Form VI Modal</span>
              </button>
            </div>
          </div>

          {/* Authentic Real Scanned Certificate View (Form VI - QR Removed when Scanned) */}
          <div className="border border-stone-300 rounded-2xl overflow-hidden shadow-lg bg-stone-100 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 px-1 border-b border-stone-200 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
                ✓ Scanned Certificate View • QR Code Removed & Replaced with Official Seal
              </span>
              <button
                type="button"
                onClick={() => openScannedPhotoViewer(publicSearchResult)}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline flex items-center gap-1"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Enlarge in Photo Viewer</span>
              </button>
            </div>
            <ScannedCertificateView
              certificate={publicSearchResult}
              showActions={true}
              hideQrCode={true}
            />
          </div>
        </div>
      )}

      {/* Warning banner when search failed */}
      {publicHasSearched && !publicSearchResult && (
        <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 space-y-2 animate-in fade-in">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-rose-950">
            No Record Found in Legal Metrology Registry
          </h3>
          <p className="text-xs text-rose-800 max-w-md mx-auto">
            No certificate or instrument matching <code className="font-mono font-bold">"{publicSearchQuery}"</code> was found in the official registry. This seal may be unverified, unauthorized, or counterfeit.
          </p>
        </div>
      )}

      {/* 2. Optical Scanner & Search Hub (Shown if no result or if user toggles scanner) */}
      {(!publicSearchResult || showScanner) && (
        <div className="space-y-6 pt-2">
          {/* Header Banner */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Legal Metrology Consumer Protection Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Verify Official Holographic Seal & QR Code
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Scan the QR sticker or Form VI certificate affixed to any grocery scale, petrol pump dispenser, or industrial weighbridge to view its authentic statutory verification record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Live Camera / Scanner Viewfinder Box */}
            <div className="relative aspect-square max-w-sm mx-auto w-full bg-slate-950 rounded-3xl p-4 shadow-xl border-4 border-slate-800 flex flex-col items-center justify-between overflow-hidden">
              
              <div className="w-full flex items-center justify-between text-[11px] text-cyan-400 font-mono font-bold z-20">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  {isCameraActive ? 'LIVE OPTICAL FEED' : 'VIEWFINDER STANDBY'}
                </span>
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
              </div>

              {/* Scanner Viewport with Target Framing */}
              <div className="relative w-56 h-56 border-2 border-cyan-500/40 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-900">
                
                {/* 4 Corner Reticle Brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 z-20"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 z-20"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 z-20"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 z-20"></div>

                {/* Video Feed for Live Camera */}
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Standby State with Real Scannable Example QR */}
                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center p-2 text-center space-y-2 z-10">
                    <MetrologyQrCode
                      data={inputVal || 'CERT-2026-NLM-0841'}
                      size={135}
                      showEmblem={false}
                    />
                    <span className="text-[10px] text-cyan-300 font-mono font-bold">
                      Test Scannable QR Seal
                    </span>
                  </div>
                )}

                {/* Laser scanning beam */}
                {isCameraActive && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-[scan_2s_ease-in-out_infinite] z-20"></div>
                )}
              </div>

              {/* Controls below viewfinder */}
              <div className="w-full z-20 space-y-2">
                <div className="text-[11px] text-slate-300 text-center font-medium truncate px-2">
                  {scanMessage || (isCameraActive ? 'Point camera at statutory seal on equipment' : 'Use device camera or upload a certificate photo')}
                </div>

                <div className="flex items-center justify-center gap-2">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-cyan-600/30"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Start Camera Scanner</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      <VideoOff className="w-3.5 h-3.5 text-rose-400" />
                      <span>Stop Camera</span>
                    </button>
                  )}

                  {/* Photo Upload Scanner */}
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {cameraError && (
                  <p className="text-[10px] text-amber-300 text-center font-medium bg-amber-950/40 p-1.5 rounded-lg border border-amber-800/40">
                    {cameraError}
                  </p>
                )}
              </div>

            </div>

            {/* Search & Quick Samples Panel */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  National Metrology Registry Search
                </h3>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  ISO/IEC 17025
                </span>
              </div>

              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder="Enter Certificate No (e.g. CERT-2026-NLM-0841)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verify Certificate Authenticity
                </button>
              </form>

              {/* Quick Select Sample Chips */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  1-Click Verification Test Samples:
                </span>
                <div className="space-y-1.5">
                  {sampleCerts.map(sample => (
                    <button
                      key={sample.code}
                      type="button"
                      onClick={() => handleQuickSelect(sample.code)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors flex items-center justify-between text-xs group"
                    >
                      <span className="font-mono font-bold text-slate-800 group-hover:text-emerald-700">
                        {sample.code}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                        {sample.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-[11px] text-cyan-900 leading-relaxed">
                <strong>Phone Camera Tip:</strong> You can point your smartphone camera directly at the QR code on any physical scale or certificate. It will automatically open and display this verified certificate.
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Citizen Grievance / Malpractice Whistleblower Reporting Section */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Report Measurement Malpractice or Tampered Seal
            </h3>
            <p className="text-xs text-slate-500">
              Statutory Whistleblower Grievance mechanism under Section 30 of the Legal Metrology Act, 2009.
            </p>
          </div>
        </div>

        {grievanceSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-950">Grievance Successfully Lodged</h4>
            <p className="text-xs text-emerald-800">
              Your report has been securely registered in the Directorate Enforcement Queue for investigation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleGrievanceSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Business / Establishment Name
                </label>
                <input
                  type="text"
                  required
                  value={grievanceBusiness}
                  onChange={e => setGrievanceBusiness(e.target.value)}
                  placeholder="e.g. City Fuel Station #9"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={grievanceLocation}
                  onChange={e => setGrievanceLocation(e.target.value)}
                  placeholder="e.g. Sector 12 Highway Outlet"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Type of Malpractice
                </label>
                <select
                  value={grievanceType}
                  onChange={e => setGrievanceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  <option value="SHORT_DELIVERY">Short Measurement / Short Delivery</option>
                  <option value="BROKEN_SEAL">Broken or Tampered Physical Wire Seal</option>
                  <option value="EXPIRED_CALIBRATION">Expired Calibration Stamp in Commercial Use</option>
                  <option value="UNREGISTERED_DEVICE">Unregistered Measuring Scale</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Details & Specific Observations
              </label>
              <textarea
                rows={2}
                required
                value={grievanceDesc}
                onChange={e => setGrievanceDesc(e.target.value)}
                placeholder="Describe suspected short-measure amount, seal condition, or invoice number..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                Submit Grievance to Legal Metrology Directorate
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};
