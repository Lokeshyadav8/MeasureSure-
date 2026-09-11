import React from 'react';
import { X, Send, Eye, ShieldCheck, MapPin, Calendar, Activity, AlertCircle, CreditCard, FileCheck, CheckCircle2, Scan } from 'lucide-react';
import { InstrumentEntity, CertificateEntity, PaymentReceiptEntity } from '../../types';
import { InstrumentStatusBadge, RiskScoreBadge, ExpiryStatusBadge } from '../common/StatusBadge';
import { MetrologyQrCode } from '../common/QrCodeGenerator';
import { formatCapacity, formatTolerance, formatCurrencyINR } from '../../utils/formatters';
import { useMetrology } from '../../context/MetrologyContext';

interface InstrumentDetailsModalProps {
  instrument: InstrumentEntity | null;
  certificate: CertificateEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestVerification: (instrument: InstrumentEntity) => void;
  onViewCertificate: (cert: CertificateEntity) => void;
  onPayFee?: (instrument: InstrumentEntity) => void;
  onViewReceipt?: (receipt: PaymentReceiptEntity) => void;
}

export const InstrumentDetailsModal: React.FC<InstrumentDetailsModalProps> = ({
  instrument,
  certificate,
  isOpen,
  onClose,
  onRequestVerification,
  onViewCertificate,
  onPayFee,
  onViewReceipt
}) => {
  const { openScannedPhotoViewer } = useMetrology();
  if (!isOpen || !instrument) return null;

  const isPaid = instrument.paymentStatus === 'PAID' || !!instrument.paymentReceipt;
  const statutoryFee = instrument.inspectionFee || (
    instrument.category === 'Industrial' ? 1850 :
    instrument.category === 'Petroleum' ? 1450 :
    instrument.category === 'Laboratory' ? 1250 : 950
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <div className="text-[10px] font-mono font-bold text-cyan-400">
              {instrument.instrumentId}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {instrument.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Status & Risk Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <InstrumentStatusBadge status={instrument.status} />
              <RiskScoreBadge riskLevel={instrument.riskScore} />
            </div>
            <ExpiryStatusBadge validUntilDate={instrument.nextVerificationDate} />
          </div>

          {/* Statutory Fee & Challan Status Card */}
          <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Statutory e-Payment (Bharat Kosh)
                </span>
              </div>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>FEE REALIZED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                  <span>PAYMENT PENDING</span>
                </span>
              )}
            </div>

            {isPaid && instrument.paymentReceipt ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    Paid {formatCurrencyINR(instrument.paymentReceipt.amount)} via {instrument.paymentReceipt.paymentModeLabel}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    GRN: {instrument.paymentReceipt.grnNumber} • Challan: {instrument.paymentReceipt.receiptNumber}
                  </div>
                </div>
                {onViewReceipt && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewReceipt(instrument.paymentReceipt!);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View e-Challan</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    Statutory Stamping & Calibration Fee: {formatCurrencyINR(statutoryFee)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Head 1475-00-106-01-00 • Pay with PhonePe, GPay, Paytm, Cards or NetBanking.
                  </div>
                </div>
                {onPayFee && (
                  <button
                    type="button"
                    onClick={() => {
                      onPayFee(instrument);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shrink-0 shadow-xs transition-all active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay {formatCurrencyINR(statutoryFee)}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Technical Specs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs divide-y divide-slate-100 text-xs">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Type / Category</span>
              <span className="font-semibold text-slate-900">{instrument.type} ({instrument.category})</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Manufacturer / Model</span>
              <span className="font-semibold text-slate-800">{instrument.manufacturer} {instrument.modelNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Serial Number</span>
              <span className="font-mono font-bold text-slate-800">{instrument.serialNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Capacity & Unit</span>
              <span className="font-bold text-slate-900">{formatCapacity(instrument.capacity, instrument.unitOfMeasurement)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Permissible Tolerance</span>
              <span className="font-mono font-bold text-slate-900">{formatTolerance(instrument.permissibleTolerance)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Operating Location</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {instrument.location}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Registered Business</span>
              <span className="font-semibold text-slate-800">{instrument.ownerBusiness}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Last Verification Date</span>
              <span className="font-medium text-slate-700">{instrument.lastVerificationDate}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Next Verification Due</span>
              <span className="font-bold text-slate-900">{instrument.nextVerificationDate}</span>
            </div>
          </div>

          {/* AI Risk Assessment Reason */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              Statutory Risk & Health Intelligence
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {instrument.riskReason}
            </p>
          </div>

          {/* Digital QR Code & Certificate Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-900 text-white rounded-2xl">
            <div className="shrink-0">
              <MetrologyQrCode
                data={instrument.qrPayload}
                size={84}
                showEmblem={true}
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Statutory Digital Seal & QR
              </h4>
              <p className="text-[11px] text-slate-300">
                Authorized tamper seal and verifiable public QR code mapped to this instrument registry.
              </p>
              {certificate && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewCertificate(certificate);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-cyan-300 hover:text-white border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Form VI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openScannedPhotoViewer(certificate);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-xs"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>Scan QR (Photo Viewer)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 shadow-xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {!isPaid && onPayFee && (
              <button
                type="button"
                onClick={() => {
                  onPayFee(instrument);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Fee ({formatCurrencyINR(statutoryFee)})</span>
              </button>
            )}

            {(instrument.status === 'DRAFT' || instrument.status === 'FAILED') && (
              <button
                type="button"
                onClick={() => {
                  if (!isPaid && onPayFee) {
                    onPayFee(instrument);
                    onClose();
                  } else {
                    onRequestVerification(instrument);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                {instrument.status === 'FAILED' ? 'Request Re-Verification' : 'Request Statutory Verification'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
