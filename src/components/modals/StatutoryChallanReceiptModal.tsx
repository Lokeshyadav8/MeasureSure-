import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Scale,
  CreditCard,
  QrCode,
  FileCheck,
  Calendar,
  Hash
} from 'lucide-react';
import { PaymentReceiptEntity } from '../../types';
import { formatCurrencyINR } from '../../utils/formatters';
import { MetrologyQrCode } from '../common/QrCodeGenerator';

interface StatutoryChallanReceiptModalProps {
  isOpen: boolean;
  receipt: PaymentReceiptEntity | null;
  onClose: () => void;
}

export const StatutoryChallanReceiptModal: React.FC<StatutoryChallanReceiptModalProps> = ({
  isOpen,
  receipt,
  onClose
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textData = `
GOVERNMENT OF INDIA
MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
DIRECTORATE OF LEGAL METROLOGY
NATIONAL NON-TAX RECEIPT PORTAL (BHARATKOSH)
------------------------------------------------------------
STATUTORY VERIFICATION & STAMPING e-CHALLAN (FORM TR-5)
------------------------------------------------------------
Challan / Receipt No : ${receipt.receiptNumber}
Government Ref (GRN) : ${receipt.grnNumber}
Transaction ID       : ${receipt.transactionId}
Bank Ref No (BRN)    : ${receipt.bankReferenceNumber}
CIN Number           : ${receipt.cinNumber}
Payment Date & Time  : ${new Date(receipt.paidAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Treasury Head        : ${receipt.treasuryHead}

PAYER / APPLICANT DETAILS:
Business Name        : ${receipt.ownerBusiness}
Instrument ID        : ${receipt.instrumentId}
Instrument Name      : ${receipt.instrumentName}

STATUTORY FEE BREAKDOWN:
1. Statutory Verification Fee     : INR ${receipt.statutoryFee.toFixed(2)}
2. Hologram Stamping Seal Fee     : INR ${receipt.stampingFee.toFixed(2)}
3. Legal Metrology Portal Surchg : INR ${receipt.portalFee.toFixed(2)}
------------------------------------------------------------
TOTAL AMOUNT PAID                 : INR ${receipt.amount.toFixed(2)}
Payment Mode                      : ${receipt.paymentModeLabel}
Payment Method Details            : ${receipt.paymentMethodDetails}
Payment Status                    : SUCCESS (Revenue Realized)
------------------------------------------------------------
Statutory Authority: Controller of Legal Metrology, Government of India
    `.trim();

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Statutory_Challan_${receipt.grnNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar (Non-Printable) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Official Statutory e-Challan Receipt (Form TR-5)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              title="Print Challan Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              title="Download Challan Copy"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Official Challan */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 print:p-0">
          
          {/* Official National Emblem & Treasury Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900/20 space-y-1 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-600/40 text-amber-900 font-serif font-black text-xl mb-1 shadow-xs">
              🏛️
            </div>
            <h4 className="text-[11px] font-black tracking-widest text-slate-700 uppercase">
              Government of India • Ministry of Consumer Affairs, Food & Public Distribution
            </h4>
            <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
              Department of Consumer Affairs • Directorate of Legal Metrology
            </h2>
            <div className="inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 rounded-full text-[11px] font-bold text-slate-800">
              National Non-Tax Receipt Portal (Bharatkosh) • e-Challan Form TR-5
            </div>
          </div>

          {/* Success Status Banner */}
          <div className="bg-emerald-50/90 border-2 border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Payment Successful • Revenue Realized
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">
                    PAID
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Statutory verification & stamping fee deposited to Consolidated Fund of India.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Total Amount Paid</div>
              <div className="text-xl font-black text-emerald-950">
                {formatCurrencyINR(receipt.amount)}
              </div>
            </div>
          </div>

          {/* Key Reference Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Challan / TR-5 No.</span>
              <span className="font-mono font-black text-slate-900">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Govt. Ref (GRN)</span>
              <span className="font-mono font-black text-slate-900">{receipt.grnNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Bank Ref (BRN)</span>
              <span className="font-mono font-black text-slate-900">{receipt.bankReferenceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Challan ID (CIN)</span>
              <span className="font-mono font-black text-slate-900">{receipt.cinNumber}</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Payer & Establishment Details */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 font-black text-slate-900 text-xs uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>Payer & Establishment Details</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Business Name:</span>
                  <span className="font-bold text-slate-950 text-right">{receipt.ownerBusiness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Treasury Head:</span>
                  <span className="font-mono font-bold text-slate-950 text-right text-[11px]">{receipt.treasuryHead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Date & Time:</span>
                  <span className="font-bold text-slate-950 text-right">
                    {new Date(receipt.paidAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                  </span>
                </div>
              </div>
            </div>

            {/* Instrument Details */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 font-black text-slate-900 text-xs uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-cyan-600" />
                <span>Instrument Covered</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Instrument ID:</span>
                  <span className="font-mono font-black text-cyan-900">{receipt.instrumentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Instrument:</span>
                  <span className="font-bold text-slate-950 truncate max-w-[180px] text-right" title={receipt.instrumentName}>
                    {receipt.instrumentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Payment Method:</span>
                  <span className="font-bold text-emerald-900 text-right">{receipt.paymentModeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Ref Details:</span>
                  <span className="font-mono font-bold text-slate-700 text-right text-[11px] truncate max-w-[180px]">
                    {receipt.paymentMethodDetails}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Statutory Fee Breakdown Table */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2.5 font-black text-slate-900 uppercase tracking-wider flex justify-between">
              <span>Statutory Item Description</span>
              <span>Amount (INR)</span>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              <div className="px-4 py-2 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Statutory Metrology Verification & Stamping Fee</div>
                  <div className="text-[10px] text-slate-500">Legal Metrology Act 2009 • Schedule IX Calibration Schedule</div>
                </div>
                <span className="font-bold text-slate-900">{formatCurrencyINR(receipt.statutoryFee)}</span>
              </div>

              <div className="px-4 py-2 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Tamper-Proof Holographic Security Seal Fee</div>
                  <div className="text-[10px] text-slate-500">Statutory metallic/hologram tamper barrier application</div>
                </div>
                <span className="font-bold text-slate-900">{formatCurrencyINR(receipt.stampingFee)}</span>
              </div>

              <div className="px-4 py-2 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">National Legal Metrology Portal & e-Governance Surcharge</div>
                  <div className="text-[10px] text-slate-500">Non-Tax Receipt Portal transaction facilitation fee</div>
                </div>
                <span className="font-bold text-slate-900">{formatCurrencyINR(receipt.portalFee)}</span>
              </div>

              {/* Total Row */}
              <div className="px-4 py-3 bg-slate-50 flex justify-between items-center text-sm font-black text-slate-950">
                <span>TOTAL AMOUNT REALIZED</span>
                <span className="text-base text-emerald-900 font-black">
                  {formatCurrencyINR(receipt.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Security Seals & Signatures */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white border border-slate-300 rounded-xl shadow-xs">
                <MetrologyQrCode data={receipt.instrumentId} size={84} />
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="font-black text-slate-900">Authentic e-Challan</div>
                <div className="text-slate-600">Scan QR to verify fee clearance and certification status.</div>
                <div className="text-[10px] font-mono text-slate-500">TXN: {receipt.transactionId}</div>
              </div>
            </div>

            <div className="text-right space-y-1 text-[11px]">
              <div className="w-32 h-0.5 bg-slate-900/30 ml-auto mb-1"></div>
              <div className="font-bold text-slate-900">Digitally Verified & Stamped</div>
              <div className="text-slate-600 text-[10px]">Controller of Legal Metrology</div>
              <div className="text-slate-500 text-[10px]">Govt. of India e-Receipt System</div>
            </div>
          </div>

        </div>

        {/* Modal Footer (Non-Printable) */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <span className="text-xs text-slate-600 font-medium">
            This e-Challan serves as official statutory proof of fee payment under the Legal Metrology Act.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
