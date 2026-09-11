import React, { useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Printer,
  Download,
  QrCode,
  ExternalLink,
  Scale
} from 'lucide-react';
import { CertificateEntity } from '../../types';
import { MetrologyQrCode } from './QrCodeGenerator';
import { formatCapacity } from '../../utils/formatters';
import { getPublicVerificationUrl } from '../../utils/verification';

interface ScannedCertificateViewProps {
  certificate: CertificateEntity;
  showActions?: boolean;
  className?: string;
  hideQrCode?: boolean;
  onSimulateScan?: () => void;
}

export const ScannedCertificateView: React.FC<ScannedCertificateViewProps> = ({
  certificate,
  showActions = true,
  className = '',
  hideQrCode = false,
  onSimulateScan
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const isExpired = certificate.status === 'EXPIRED';

  const handlePrint = () => {
    window.print();
  };

  // Generate deterministic statutory challan and seal wire numbers based on certificate ID
  const challanNumber = `TR-${certificate.certificateNumber.replace(/[^0-9]/g, '').slice(-5) || '99214'}/GOV`;
  const leadSealNumber = `PB-${certificate.tamperSealNumber || 'LM-7749'}-WIRE`;
  const accuracyClass = certificate.instrumentType.toLowerCase().includes('fuel') 
    ? 'Class 0.5 (Measuring Systems for Liquids)'
    : certificate.capacity && parseInt(certificate.capacity, 10) > 1000
    ? 'Class III (Medium Accuracy NAWI)'
    : 'Class II (High Accuracy NAWI)';

  const qrPayload = getPublicVerificationUrl(certificate.certificateNumber);

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Printable / Scanned Document Sheet */}
      <div
        ref={certificateRef}
        id="scanned-certificate-document"
        className="relative mx-auto w-full max-w-3xl bg-[#fcfaf4] text-slate-900 shadow-2xl rounded-sm border border-stone-300 p-6 sm:p-10 overflow-hidden select-text transition-all print:shadow-none print:border-none print:p-4 print:max-w-none print:w-full"
        style={{
          boxShadow: '0 10px 35px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(180, 160, 120, 0.3)',
          backgroundImage: `
            radial-gradient(#eedcb3 0.75px, transparent 0.75px),
            radial-gradient(#e5cf9b 0.75px, #fcfaf4 0.75px)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px'
        }}
      >
        
        {/* Scanned Document Paper Edge Vignette & Light Scan Texture */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-stone-900/[0.03] via-transparent to-stone-900/[0.04] mix-blend-multiply"></div>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300"></div>

        {/* Guilloché Double Security Border Frame */}
        <div className="relative border-4 border-double border-[#8c6d31] p-4 sm:p-7 bg-[#fffdfa]/95 rounded-sm">
          
          {/* Ornate Corner Rosettes */}
          <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-[#8c6d31]"></div>
          <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#8c6d31]"></div>
          <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#8c6d31]"></div>
          <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-[#8c6d31]"></div>

          {/* Background Government Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.045] overflow-hidden select-none">
            <div className="w-[380px] h-[380px] border-[16px] border-slate-900 rounded-full flex flex-col items-center justify-center text-center p-6">
              <Scale className="w-40 h-40 text-slate-900 stroke-[1.5]" />
              <span className="text-xl font-black uppercase tracking-widest mt-2">LEGAL METROLOGY</span>
              <span className="text-xs font-bold uppercase tracking-wider">DIRECTORATE OF WEIGHTS & MEASURES</span>
              <span className="text-[10px] font-serif italic mt-1">सत्यमेव जयते • GOVERNMENT OF INDIA</span>
            </div>
          </div>

          {/* Top Header: Barcode & Serial Tracking */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-b-2 border-stone-300 pb-3 text-[11px] font-mono text-stone-700">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-stone-200 text-stone-800 font-bold rounded-xs tracking-wider">
                ORIGINAL STATUTORY CERTIFICATE
              </span>
              <span className="hidden sm:inline text-stone-400">•</span>
              <span className="text-stone-600">BOOK NO: <strong>48</strong></span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-600">PAGE NO: <strong>19</strong></span>
            </div>

            {/* Document Serial Barcode */}
            <div className="text-right flex items-center gap-2">
              <div className="flex flex-col items-end">
                <div className="tracking-[0.25em] font-bold text-[11px] text-red-800 font-mono">
                  ★ {certificate.certificateNumber} ★
                </div>
                <div className="text-[9px] text-stone-500 font-mono tracking-tighter">
                  SECURITY BARCODE REG: 2026-IND-LM
                </div>
              </div>
            </div>
          </div>

          {/* Official Government Crest & Form Title */}
          <div className="relative z-10 text-center pt-4 pb-3 space-y-1">
            
            {/* Government Emblem Symbol */}
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#8c6d31] bg-[#faf6ed] shadow-xs flex flex-col items-center justify-center p-1">
                <Scale className="w-7 h-7 text-[#8c6d31]" />
                <span className="text-[7px] font-black uppercase text-[#8c6d31] tracking-tighter">सत्यमेव जयते</span>
              </div>
            </div>

            <h3 className="text-xs sm:text-sm font-black tracking-widest text-stone-900 uppercase font-serif">
              GOVERNMENT OF INDIA • DEPARTMENT OF CONSUMER AFFAIRS
            </h3>
            <h2 className="text-sm sm:text-base font-extrabold tracking-wider text-[#735824] uppercase">
              DIRECTORATE OF LEGAL METROLOGY (WEIGHTS & MEASURES)
            </h2>
            <div className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">
              Statutory Verification Wing • ISO/IEC 17025 Calibration Standards
            </div>

            <div className="py-2">
              <div className="inline-block px-5 py-1.5 bg-[#f5efe1] border-y-2 border-[#8c6d31] text-stone-900">
                <span className="block text-xs font-black uppercase tracking-widest font-serif">
                  FORM - VI [See Rule 14(1)]
                </span>
                <span className="block text-sm sm:text-lg font-black tracking-tight uppercase font-serif text-stone-950">
                  CERTIFICATE OF VERIFICATION
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-700 italic max-w-xl mx-auto font-serif">
              Issued under Section 24 of the Legal Metrology Act, 2009 & OIML R-76 International Standards for commercial weighing and measuring instruments.
            </p>
          </div>

          {/* Certificate Identification Band */}
          <div className="relative z-10 my-3 bg-[#f3ecda] border border-[#d2be92] p-2.5 rounded-xs flex flex-wrap items-center justify-between gap-2 text-xs font-serif">
            <div>
              <span className="text-stone-600 uppercase text-[10px] font-sans font-bold block">Verification Certificate No:</span>
              <span className="font-mono font-black text-sm text-stone-900 tracking-wider">
                {certificate.certificateNumber}
              </span>
            </div>
            <div>
              <span className="text-stone-600 uppercase text-[10px] font-sans font-bold block">Challan / Receipt Reference:</span>
              <span className="font-mono font-bold text-xs text-stone-800">
                {challanNumber}
              </span>
            </div>
            <div>
              <span className="text-stone-600 uppercase text-[10px] font-sans font-bold block">Date of Verification:</span>
              <span className="font-bold text-xs text-stone-900 font-mono">
                {certificate.verificationDate}
              </span>
            </div>
            <div>
              <span className="text-stone-600 uppercase text-[10px] font-sans font-bold block">Statutory Validity Until:</span>
              <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-xs ${
                isExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {certificate.validUntil}
              </span>
            </div>
          </div>

          {/* Statutory Formal Data Table */}
          <div className="relative z-10 my-4 border border-stone-400 bg-white/90 text-[11px] sm:text-xs">
            <table className="w-full border-collapse">
              <tbody>
                
                <tr className="border-b border-stone-300">
                  <td className="w-1/3 p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    1. Name & Address of Commercial User:
                  </td>
                  <td className="p-2 text-stone-900 font-semibold">
                    {certificate.ownerBusiness}
                    <div className="text-[10px] text-stone-600 font-normal mt-0.5">
                      Operational Premise: {certificate.location}
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    2. Description & Class of Instrument:
                  </td>
                  <td className="p-2 text-stone-900 font-semibold">
                    {certificate.instrumentName} ({certificate.instrumentType})
                    <div className="text-[10px] text-stone-600 font-mono">
                      Statutory Class: <strong>{accuracyClass}</strong>
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    3. Manufacturer, Make & Model:
                  </td>
                  <td className="p-2 text-stone-900">
                    <span className="font-semibold">{certificate.manufacturer}</span>
                    <span className="text-stone-400 mx-1.5">•</span>
                    <span>Model: <strong className="font-mono">{certificate.modelNumber}</strong></span>
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    4. Instrument Registration & Serial No:
                  </td>
                  <td className="p-2 text-stone-900 font-mono">
                    <span className="font-bold text-stone-950">{certificate.instrumentId}</span>
                    <span className="text-stone-400 mx-1.5">•</span>
                    <span>Machine S/N: <strong className="text-stone-900">{certificate.serialNumber}</strong></span>
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    5. Metrological Capacity Range:
                  </td>
                  <td className="p-2 text-stone-900 font-mono font-bold">
                    Max Capacity: {formatCapacity(certificate.capacity, certificate.unit)}
                    <span className="text-stone-400 font-normal mx-1.5">•</span>
                    <span className="text-[10px] font-normal text-stone-700">Tolerance Limit: ±0.05%</span>
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    6. Verification Standards Applied:
                  </td>
                  <td className="p-2 text-stone-800">
                    Class M1 Certified Working Test Masses & Electronic Reference Calibrators ({certificate.standardCode})
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    7. Maximum Permissible Error (MPE) Test:
                  </td>
                  <td className="p-2 text-stone-900">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      SATISFACTORY & WITHIN LEGAL TOLERANCE (PASS)
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    8. Statutory Stamping & Verification Fee:
                  </td>
                  <td className="p-2 text-stone-900 font-mono">
                    ₹ 2,450.00 <span className="text-[10px] text-stone-500">(Paid under Treasury Challan {challanNumber})</span>
                  </td>
                </tr>

                <tr>
                  <td className="p-2 font-bold bg-stone-100/90 text-stone-800 border-r border-stone-300">
                    9. Physical Security Seal & Hologram:
                  </td>
                  <td className="p-2 text-stone-900 font-mono text-[11px]">
                    Tamper Hologram: <strong>{certificate.tamperSealNumber}</strong>
                    <span className="text-stone-400 mx-1.5">•</span>
                    <span>Lead Wire: <strong>{leadSealNumber}</strong></span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Realistic Official Stamps & Signatures Section */}
          <div className="relative z-10 pt-3 border-t-2 border-stone-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* 1. Official Wet Rubber Stamp (Violet Ink with Authentic Tilt) */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div
                className="relative w-28 h-28 border-[3px] border-dashed border-indigo-800/85 rounded-full flex flex-col items-center justify-center p-1 text-indigo-900 select-none shadow-xs"
                style={{
                  transform: 'rotate(-4deg)',
                  backgroundColor: 'rgba(99, 102, 241, 0.03)'
                }}
              >
                <div className="w-24 h-24 border border-indigo-700/80 rounded-full flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[7px] font-black uppercase tracking-widest text-indigo-900 leading-tight">
                    CONTROLLER OF LEGAL METROLOGY
                  </span>
                  <div className="w-12 h-px bg-indigo-700/60 my-0.5"></div>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-indigo-950 font-serif">
                    VERIFIED & STAMPED
                  </span>
                  <span className="text-[8px] font-mono font-bold text-indigo-900">
                    {certificate.verificationDate}
                  </span>
                  <div className="w-12 h-px bg-indigo-700/60 my-0.5"></div>
                  <span className="text-[6.5px] font-black uppercase tracking-wider text-indigo-800">
                    GOVT. OF INDIA
                  </span>
                </div>
              </div>
              <div className="text-[9px] text-stone-500 font-mono mt-1">
                Official Wet Stamp (Zone IV)
              </div>
            </div>

            {/* 2. Metallic Holographic Tamper Foil Seal */}
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="relative w-24 h-24 rounded-full border-2 border-[#b8973b] p-1 shadow-md flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #f6e8b1 0%, #e2c26b 25%, #fdf5d3 50%, #d4af37 75%, #a88425 100%)',
                  boxShadow: '0 2px 8px rgba(184, 151, 59, 0.4), inset 0 0 4px rgba(255,255,255,0.8)'
                }}
              >
                <div className="w-20 h-20 rounded-full border border-amber-800/40 flex flex-col items-center justify-center p-1 text-center bg-transparent">
                  <Award className="w-5 h-5 text-amber-900" />
                  <span className="text-[6.5px] font-black tracking-widest text-amber-950 uppercase mt-0.5">
                    OFFICIAL SEAL
                  </span>
                  <span className="text-[7.5px] font-mono font-black text-amber-950 tracking-tight">
                    {certificate.tamperSealNumber}
                  </span>
                  <span className="text-[5.5px] font-extrabold uppercase tracking-tighter text-amber-900 mt-0.5">
                    DO NOT TAMPER
                  </span>
                </div>
              </div>
              <div className="text-[9px] text-stone-500 font-mono mt-1">
                Security Hologram Seal
              </div>
            </div>

            {/* 3. Scannable QR Code or Scanned Verification Stamp (QR Removed) */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right space-y-2">
              
              {hideQrCode ? (
                /* QR Code REMOVED when viewing the scanned certificate result */
                <div className="p-2 bg-white border-2 border-emerald-700/80 rounded-sm shadow-xs flex flex-col items-center justify-center text-center select-none w-28 h-28">
                  <div className="w-full h-full border border-dashed border-emerald-600 rounded-xs flex flex-col items-center justify-center p-1 bg-emerald-50/40">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-[7.5px] font-black uppercase text-emerald-950 tracking-tight font-serif leading-tight">
                      OFFICIALLY VERIFIED
                    </span>
                    <span className="text-[6.5px] font-mono font-bold text-emerald-800 uppercase mt-0.5">
                      QR SEAL SCANNED
                    </span>
                    <div className="w-16 h-px bg-emerald-500/60 my-1"></div>
                    <span className="text-[6px] font-mono text-slate-600 font-bold">
                      {certificate.certificateNumber.slice(-12)}
                    </span>
                  </div>
                  <span className="text-[7.5px] font-mono text-emerald-800 mt-0.5 font-bold">
                    ✓ AUTHENTICATED
                  </span>
                </div>
              ) : (
                /* Genuine Scannable QR Code (before scanning) */
                <div className="p-1.5 bg-white border border-stone-300 rounded-sm shadow-xs flex flex-col items-center">
                  <MetrologyQrCode
                    data={qrPayload}
                    size={88}
                    showEmblem={false}
                  />
                  {onSimulateScan ? (
                    <button
                      type="button"
                      onClick={onSimulateScan}
                      title="Simulate scanning this QR code to view scanned certificate with QR removed"
                      className="mt-1 px-2 py-0.5 rounded-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-mono font-bold transition-colors"
                    >
                      ★ SCAN QR (VIEW PHOTO)
                    </button>
                  ) : (
                    <span className="text-[8px] font-mono text-stone-600 mt-1 font-bold">
                      SCAN TO VERIFY SEAL
                    </span>
                  )}
                </div>
              )}

              {/* Hand-Signed Officer Signature */}
              <div className="pt-1">
                <div className="font-serif italic text-base sm:text-lg text-blue-950 font-bold tracking-tight select-none">
                  {certificate.inspectorName}
                </div>
                <div className="w-32 h-0.5 bg-stone-400 ml-auto my-0.5"></div>
                <div className="text-[10px] font-bold text-stone-800">
                  Legal Metrology Officer (Inspector)
                </div>
                <div className="text-[9px] text-stone-500 font-mono">
                  Govt. Authority Badge ID: LM-INS-4091
                </div>
              </div>

            </div>

          </div>

          {/* Statutory Footer Warning Notice */}
          <div className="relative z-10 mt-4 pt-3 border-t border-stone-300 text-center text-[9px] sm:text-[10px] text-stone-600 font-serif leading-tight">
            <p>
              <strong>STATUTORY NOTICE:</strong> This certificate must be exhibited in a conspicuous place near the instrument at the operating premise. Breaking, altering, or tampering with the statutory seals affixed to the instrument is a cognizable offense punishable under Section 34 of the Legal Metrology Act, 2009.
            </p>
          </div>

        </div>
      </div>

      {/* Action Bar (Print, Download, Share) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-800">Genuine Legal Metrology Form VI</span>
            <span>•</span>
            <span>High-Fidelity Official Scanned View</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
