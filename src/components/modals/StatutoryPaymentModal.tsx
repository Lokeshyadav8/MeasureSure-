import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  Smartphone,
  Building,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  RefreshCw,
  QrCode,
  Check,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { InstrumentEntity, PaymentMode, PaymentReceiptEntity } from '../../types';
import { formatCurrencyINR, formatCapacity } from '../../utils/formatters';

interface StatutoryPaymentModalProps {
  isOpen: boolean;
  instrument: InstrumentEntity | null;
  onClose: () => void;
  onPaymentSuccess: (receipt: PaymentReceiptEntity) => void;
}

type TabType = 'UPI' | 'CARDS' | 'NETBANKING' | 'CHALLAN';

export const StatutoryPaymentModal: React.FC<StatutoryPaymentModalProps> = ({
  isOpen,
  instrument,
  onClose,
  onPaymentSuccess
}) => {
  // Calculate realistic statutory fees based on category/capacity
  const feeCalculation = useMemo(() => {
    let statutoryFee = 750;
    let stampingFee = 150;
    let portalFee = 50;

    switch (instrument?.category) {
      case 'Industrial':
        statutoryFee = 1500;
        stampingFee = 250;
        portalFee = 100;
        break;
      case 'Petroleum':
        statutoryFee = 1150;
        stampingFee = 200;
        portalFee = 100;
        break;
      case 'Laboratory':
        statutoryFee = 950;
        stampingFee = 200;
        portalFee = 100;
        break;
      case 'Commercial':
      case 'Retail':
      default:
        statutoryFee = 750;
        stampingFee = 150;
        portalFee = 50;
        break;
    }

    const total = statutoryFee + stampingFee + portalFee;
    return { statutoryFee, stampingFee, portalFee, total };
  }, [instrument?.category]);

  const [activeTab, setActiveTab] = useState<TabType>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<PaymentReceiptEntity | null>(null);

  // --- UPI State ---
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PHONEPE' | 'GPAY' | 'PAYTM' | 'BHIM' | 'AMAZONPAY' | 'CRED'>('PHONEPE');
  const [customVpa, setCustomVpa] = useState('');
  const [vpaVerified, setVpaVerified] = useState(false);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [qrCountdown, setQrCountdown] = useState(600); // 10 minutes

  // --- Card State ---
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(instrument?.ownerBusiness || 'Director of Operations');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCardRbi, setSaveCardRbi] = useState(true);
  const [cardNetwork, setCardNetwork] = useState<'RUPAY' | 'VISA' | 'MASTERCARD'>('RUPAY');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');

  // --- Net Banking State ---
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [otherBank, setOtherBank] = useState('');
  const [showBankAuthModal, setShowBankAuthModal] = useState(false);
  const [bankUserId, setBankUserId] = useState('');
  const [bankPassword, setBankPassword] = useState('');

  // Generate real dynamic Bharat QR Code for UPI
  useEffect(() => {
    if (!isOpen || !instrument) return;
    const upiString = `upi://pay?pa=legalmetrology.govt@sbi&pn=Directorate%20of%20Legal%20Metrology&am=${feeCalculation.total}.00&cu=INR&tn=Statutory%20Fee%20${instrument.instrumentId}`;
    QRCode.toDataURL(upiString, {
      margin: 1,
      width: 220,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setUpiQrDataUrl(url))
      .catch(err => console.error('Error generating UPI QR code:', err));
  }, [isOpen, feeCalculation.total, instrument?.instrumentId]);

  // QR Timer Countdown
  useEffect(() => {
    if (!isOpen || qrCountdown <= 0) return;
    const timer = setInterval(() => {
      setQrCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, qrCountdown]);

  // Card Number formatting & auto-detection
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    // Detect network
    if (raw.startsWith('60') || raw.startsWith('65') || raw.startsWith('508') || raw.startsWith('35')) {
      setCardNetwork('RUPAY');
    } else if (raw.startsWith('4')) {
      setCardNetwork('VISA');
    } else if (raw.startsWith('51') || raw.startsWith('52') || raw.startsWith('53') || raw.startsWith('54') || raw.startsWith('55')) {
      setCardNetwork('MASTERCARD');
    }

    // Format with spaces
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  // Helper to trigger success receipt
  const finalizePayment = (
    mode: PaymentMode,
    modeLabel: string,
    details: string
  ) => {
    if (!instrument) return;
    setIsProcessing(true);
    setProcessingStep('Connecting to National Payments Corporation of India (NPCI)...');

    setTimeout(() => {
      setProcessingStep('Authenticating 2-Factor Statutory Authorization...');
      setTimeout(() => {
        setProcessingStep('Depositing to Treasury Account Head 1475-00-106-01-00...');
        setTimeout(() => {
          setProcessingStep('Generating Official Form TR-5 e-Challan...');
          setTimeout(() => {
            setIsProcessing(false);
            setShowOtpModal(false);
            setShowBankAuthModal(false);

            const now = Date.now();
            const grnNumber = `GRN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
            const receiptNumber = `TR5-2026-LM-${Math.floor(10000 + Math.random() * 90000)}`;
            const transactionId = `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
            const cinNumber = `CIN-${Math.floor(100000000 + Math.random() * 900000000)}`;
            const bankReferenceNumber = `BRN-${Math.floor(1000000 + Math.random() * 9000000)}`;

            const receipt: PaymentReceiptEntity = {
              receiptNumber,
              grnNumber,
              transactionId,
              bankReferenceNumber,
              cinNumber,
              instrumentId: instrument.instrumentId,
              instrumentName: instrument.name,
              ownerBusiness: instrument.ownerBusiness,
              amount: feeCalculation.total,
              statutoryFee: feeCalculation.statutoryFee,
              stampingFee: feeCalculation.stampingFee,
              portalFee: feeCalculation.portalFee,
              paymentMode: mode,
              paymentModeLabel: modeLabel,
              paymentMethodDetails: details,
              paidAt: now,
              treasuryHead: '1475-00-106-01-00 (Legal Metrology Stamping & Verification Fees)',
              status: 'SUCCESS'
            };

            setPaymentSuccessReceipt(receipt);
            onPaymentSuccess(receipt);

            // Trigger celebration confetti
            try {
              confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.6 }
              });
            } catch (e) {
              // Ignore if canvas blocked
            }
          }, 600);
        }, 600);
      }, 700);
    }, 800);
  };

  // UPI Submit Handler
  const handleUpiPay = (appChoice?: string) => {
    const app = appChoice || selectedUpiApp;
    let label = 'UPI Payment';
    let details = 'UPI Bharat QR Code';

    if (app === 'PHONEPE') {
      label = 'PhonePe UPI';
      details = 'PhonePe UPI Gateway (Direct App Transfer)';
    } else if (app === 'GPAY') {
      label = 'Google Pay (GPay)';
      details = 'Google Pay UPI Gateway';
    } else if (app === 'PAYTM') {
      label = 'Paytm UPI';
      details = 'Paytm UPI Wallet / Bank';
    } else if (app === 'BHIM') {
      label = 'BHIM UPI';
      details = 'NPCI BHIM Unified Payments';
    } else if (app === 'AMAZONPAY') {
      label = 'Amazon Pay UPI';
      details = 'Amazon Pay UPI Handle';
    } else if (app === 'CRED') {
      label = 'CRED UPI';
      details = 'CRED UPI Direct Transfer';
    }

    if (customVpa.trim()) {
      details = `UPI ID: ${customVpa.trim()}`;
    }

    finalizePayment(
      app === 'PHONEPE' ? 'UPI_PHONEPE' :
      app === 'GPAY' ? 'UPI_GPAY' :
      app === 'PAYTM' ? 'UPI_PAYTM' :
      app === 'BHIM' ? 'UPI_BHIM' : 'UPI_CUSTOM',
      label,
      details
    );
  };

  // Card Submit Handler -> Triggers OTP Modal
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      alert('Please enter a valid card expiry date (MM/YY).');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      alert('Please enter a valid CVV.');
      return;
    }
    setShowOtpModal(true);
    setOtpValue('');
    setOtpError('');
  };

  // OTP Validation Handler
  const handleOtpConfirm = () => {
    if (!otpValue || otpValue.length < 6) {
      setOtpError('Please enter the 6-digit Bank SMS OTP.');
      return;
    }
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    const mode: PaymentMode = cardNetwork === 'RUPAY' ? 'CARD_RUPAY' : cardNetwork === 'VISA' ? 'CARD_VISA' : 'CARD_MASTERCARD';
    const label = `${cardNetwork === 'RUPAY' ? 'RuPay' : cardNetwork === 'VISA' ? 'Visa' : 'Mastercard'} Card (ending in ${last4})`;
    finalizePayment(mode, label, `Card: •••• •••• •••• ${last4} (${cardHolder})`);
  };

  // Net Banking Submit Handler
  const handleNetBankingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bankName = selectedBank === 'OTHER' ? (otherBank || 'Scheduled Indian Bank') : selectedBank;
    setShowBankAuthModal(true);
  };

  const handleBankLoginAndPay = () => {
    const bankName = selectedBank === 'OTHER' ? (otherBank || 'Scheduled Indian Bank') : selectedBank;
    finalizePayment(
      'NETBANKING',
      `${bankName} NetBanking`,
      `Internet Banking Account • ${bankName}`
    );
  };

  // Treasury Challan Submit Handler
  const handleChallanSubmit = () => {
    finalizePayment(
      'TREASURY_CHALLAN',
      'Bharatkosh e-Challan / RTGS',
      `Treasury Head: 1475-00-106-01-00 • RTGS / NEFT Virtual Account`
    );
  };

  if (!isOpen || !instrument) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                <span>Statutory Metrology Fee Payment Gateway</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Govt. of India
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Non-Tax Receipt Portal (Bharatkosh) • Legal Metrology Act 2009
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
            <h4 className="text-base font-black tracking-tight mb-1">
              Securing Statutory Transaction
            </h4>
            <p className="text-xs text-cyan-300 font-mono animate-pulse max-w-sm">
              {processingStep}
            </p>
            <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted • NPCI & RBI Certified Payment Route</span>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Instrument Summary & Fee Breakdown Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  {instrument.instrumentId}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {instrument.category} • {formatCapacity(instrument.capacity, instrument.unitOfMeasurement)}
                </span>
              </div>
              <h4 className="text-base font-black text-white truncate max-w-md" title={instrument.name}>
                {instrument.name}
              </h4>
              <p className="text-xs text-slate-400">
                Payer: <span className="text-slate-200 font-bold">{instrument.ownerBusiness}</span> • S/N: <span className="font-mono text-slate-300">{instrument.serialNumber}</span>
              </p>
            </div>

            <div className="text-left md:text-right shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Statutory Fee Payable
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                {formatCurrencyINR(feeCalculation.total)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Incl. Stamping & Holographic Seal Fees
              </span>
            </div>
          </div>

          {/* Fee Itemization Drawer */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span>Statutory Verification & Stamping Fee:</span>
              <span className="font-bold text-slate-900">{formatCurrencyINR(feeCalculation.statutoryFee)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Calibration Holographic Tamper Seal:</span>
              <span className="font-bold text-slate-900">{formatCurrencyINR(feeCalculation.stampingFee)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>e-Governance & Legal Metrology Portal Surcharge:</span>
              <span className="font-bold text-slate-900">{formatCurrencyINR(feeCalculation.portalFee)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-900 font-black pt-1.5 border-t border-slate-200">
              <span>Head 1475 Net Realized Amount:</span>
              <span className="text-emerald-700 font-black">{formatCurrencyINR(feeCalculation.total)}</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
              
              <button
                type="button"
                onClick={() => setActiveTab('UPI')}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === 'UPI'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span>UPI (PhonePe / GPay / Paytm)</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-extrabold">
                  Instant
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CARDS')}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === 'CARDS'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-cyan-600" />
                <span>Cards (RuPay / Visa / Master)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('NETBANKING')}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === 'NETBANKING'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4 text-amber-600" />
                <span>Net Banking (SBI / HDFC / ICICI)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CHALLAN')}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === 'CHALLAN'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-700" />
                <span>e-Challan / RTGS</span>
              </button>

            </div>

            {/* TAB CONTENT 1: UPI (PhonePe, Google Pay, Paytm, BHIM, etc.) */}
            {activeTab === 'UPI' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                
                {/* UPI Apps Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span>Select Preferred UPI Application</span>
                    <span className="text-[10px] text-slate-500 font-medium">Zero Gateway Surcharge</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    
                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('PHONEPE')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                        selectedUpiApp === 'PHONEPE'
                          ? 'border-[#5f259f] bg-[#5f259f]/5 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#5f259f] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        पे
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-900 leading-tight">PhonePe</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">@ybl / @ibl</div>
                      </div>
                    </button>

                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('GPAY')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                        selectedUpiApp === 'GPAY'
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        <span className="text-blue-600">G</span>
                        <span className="text-red-500">P</span>
                        <span className="text-amber-500">a</span>
                        <span className="text-emerald-500">y</span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-900 leading-tight">Google Pay</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">@okhdfc / @okaxis</div>
                      </div>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('PAYTM')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                        selectedUpiApp === 'PAYTM'
                          ? 'border-[#002970] bg-[#002970]/5 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#002970] text-cyan-300 flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs">
                        Paytm
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-900 leading-tight">Paytm UPI</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">@paytm / Wallet</div>
                      </div>
                    </button>

                    {/* BHIM UPI */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('BHIM')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                        selectedUpiApp === 'BHIM'
                          ? 'border-[#00823f] bg-[#00823f]/5 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#00823f] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        BHIM
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-900 leading-tight">BHIM UPI</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">NPCI Govt. Portal</div>
                      </div>
                    </button>

                    {/* Amazon Pay */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('AMAZONPAY')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                        selectedUpiApp === 'AMAZONPAY'
                          ? 'border-[#ff9900] bg-[#ff9900]/5 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-[#ff9900] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        aPay
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-900 leading-tight">Amazon Pay</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">@apl / @rapl</div>
                      </div>
                    </button>

                    {/* CRED */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('CRED')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-left ${
                        selectedUpiApp === 'CRED'
                          ? 'border-slate-900 bg-slate-100 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        CRED
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-900 leading-tight">CRED UPI</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">Member Exclusive</div>
                      </div>
                    </button>

                  </div>
                </div>

                {/* Live Dynamic UPI Bharat QR Code Box */}
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                  <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-300 shrink-0">
                    {upiQrDataUrl ? (
                      <img
                        src={upiQrDataUrl}
                        alt="Statutory UPI Bharat QR Code"
                        className="w-36 h-36 object-contain select-none"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center bg-slate-100 animate-pulse rounded-xl">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                        Dynamic Bharat QR
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Expires in {Math.floor(qrCountdown / 60)}:{String(qrCountdown % 60).padStart(2, '0')}
                      </span>
                    </div>

                    <h5 className="text-sm font-black text-slate-950">
                      Scan with any UPI App (PhonePe, GPay, Paytm)
                    </h5>
                    <p className="text-xs text-slate-600">
                      Open your phone camera or any UPI app to scan and deposit statutory fees directly to the Directorate of Legal Metrology.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpiPay()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Simulate Phone App Scan & Pay</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* OR Enter UPI ID */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    OR Enter UPI ID / VPA
                  </span>
                  <div className="border-t border-slate-200 w-full"></div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customVpa}
                      onChange={e => {
                        setCustomVpa(e.target.value);
                        setVpaVerified(e.target.value.includes('@'));
                      }}
                      placeholder="Enter your UPI ID (e.g. username@bank or mobile@upi)"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpiPay('UPI_CUSTOM')}
                      className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap shadow-xs flex items-center gap-1.5"
                    >
                      <span>Pay {formatCurrencyINR(feeCalculation.total)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {vpaVerified && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid Virtual Payment Address • Verified with NPCI Switch</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: CREDIT / DEBIT CARDS (RuPay, Visa, Mastercard) */}
            {activeTab === 'CARDS' && (
              <form onSubmit={handleCardSubmit} className="space-y-4 animate-in fade-in duration-150">
                
                {/* Network Highlights */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Supported Card Networks:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black border ${cardNetwork === 'RUPAY' ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                      RuPay (Zero MDR)
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black border ${cardNetwork === 'VISA' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300'}`}>
                      VISA
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black border ${cardNetwork === 'MASTERCARD' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-slate-700 border-slate-300'}`}>
                      Mastercard
                    </span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900">
                    Card Number (16-Digits)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                      className="w-full pl-4 pr-20 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                        {cardNetwork}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900">
                    Cardholder Name (as on card)
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    placeholder="Full Name as printed on card"
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-900">
                      Valid Thru (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                      <span>CVV / CVC</span>
                      <span className="text-[10px] text-slate-400">3-Digits on back</span>
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Tokenization Toggle */}
                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveCardRbi}
                    onChange={e => setSaveCardRbi(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                  />
                  <span>Secure this card according to RBI Tokenization Guidelines</span>
                </label>

                {/* Submit to OTP step */}
                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Bank 3D-Secure ({formatCurrencyINR(feeCalculation.total)})</span>
                </button>

              </form>
            )}

            {/* TAB CONTENT 3: NET BANKING */}
            {activeTab === 'NETBANKING' && (
              <form onSubmit={handleNetBankingSubmit} className="space-y-4 animate-in fade-in duration-150">
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900">
                    Select Indian Commercial Bank
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    
                    {[
                      { id: 'SBI', name: 'State Bank of India', tag: 'SBI', color: 'bg-blue-700' },
                      { id: 'HDFC', name: 'HDFC Bank', tag: 'HDFC', color: 'bg-blue-900' },
                      { id: 'ICICI', name: 'ICICI Bank', tag: 'ICICI', color: 'bg-orange-700' },
                      { id: 'AXIS', name: 'Axis Bank', tag: 'AXIS', color: 'bg-rose-800' },
                      { id: 'PNB', name: 'Punjab National Bank', tag: 'PNB', color: 'bg-amber-800' },
                      { id: 'BOB', name: 'Bank of Baroda', tag: 'BOB', color: 'bg-orange-600' },
                      { id: 'CANARA', name: 'Canara Bank', tag: 'CANARA', color: 'bg-cyan-700' },
                      { id: 'KOTAK', name: 'Kotak Mahindra Bank', tag: 'KOTAK', color: 'bg-red-700' }
                    ].map(bank => {
                      const isSelected = selectedBank === bank.id;
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                            isSelected
                              ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl ${bank.color} text-white flex items-center justify-center font-black text-[10px] mb-1.5 shadow-xs`}>
                            {bank.tag}
                          </div>
                          <span className="text-[11px] font-black text-slate-900 leading-tight">
                            {bank.name}
                          </span>
                        </button>
                      );
                    })}

                  </div>
                </div>

                {/* Other Banks Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Or Choose from 45+ Scheduled Indian Banks
                  </label>
                  <select
                    value={selectedBank === 'OTHER' ? otherBank : selectedBank}
                    onChange={e => {
                      setSelectedBank('OTHER');
                      setOtherBank(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="Bank of India">Bank of India (BOI)</option>
                    <option value="Central Bank of India">Central Bank of India</option>
                    <option value="Indian Bank">Indian Bank</option>
                    <option value="Indian Overseas Bank">Indian Overseas Bank</option>
                    <option value="IDBI Bank">IDBI Bank</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
                    <option value="Yes Bank">Yes Bank</option>
                    <option value="RBL Bank">RBL Bank</option>
                    <option value="AU Small Finance Bank">AU Small Finance Bank</option>
                    <option value="South Indian Bank">South Indian Bank</option>
                    <option value="Karur Vysya Bank">Karur Vysya Bank</option>
                    <option value="Bandhan Bank">Bandhan Bank</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  <span>Proceed to {selectedBank} NetBanking ({formatCurrencyINR(feeCalculation.total)})</span>
                </button>

              </form>
            )}

            {/* TAB CONTENT 4: TREASURY CHALLAN (BHARATKOSH) */}
            {activeTab === 'CHALLAN' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Direct Bharatkosh Government Treasury Deposit</span>
                  </div>
                  <p className="text-slate-600">
                    For corporate accounts and bulk industrial metrology deposits via Real-Time Gross Settlement (RTGS) or National Electronic Funds Transfer (NEFT).
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-slate-300 font-mono text-[11px] space-y-1 text-slate-800">
                    <div><strong>Treasury Head:</strong> 1475-00-106-01-00 (Weights & Measures Fees)</div>
                    <div><strong>Virtual Acc No (VAN):</strong> GOILM{instrument.instrumentId.replace(/[^A-Z0-9]/g, '')}</div>
                    <div><strong>Bank:</strong> State Bank of India • CAG Branch New Delhi</div>
                    <div><strong>IFSC Code:</strong> SBIN0004261</div>
                    <div><strong>Statutory Amount:</strong> {formatCurrencyINR(feeCalculation.total)}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChallanSubmit}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Official e-Challan & Mark Fee Realized</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Modal Bottom Security Notice */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Authorized by Controller of Legal Metrology • RBI & NPCI Certified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cancel & Pay Later
          </button>
        </div>

        {/* MODAL STEP 2: Bank 3D-Secure / OTP Screen */}
        {showOtpModal && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
              
              <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-300" />
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-cyan-200">
                      Bank 3D-Secure 2.0
                    </h5>
                    <div className="text-xs font-bold text-white">
                      {cardNetwork} PaySecure Authorization
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Merchant:</span>
                    <span className="font-bold text-slate-900">Directorate of Legal Metrology</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-black text-slate-950">{formatCurrencyINR(feeCalculation.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Card Number:</span>
                    <span className="font-mono font-bold text-slate-900">•••• •••• •••• {cardNumber.replace(/\s/g, '').slice(-4)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 block">
                    Enter 6-Digit Bank SMS One-Time Password (OTP)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    OTP sent to your registered mobile number ending in <span className="font-bold text-slate-800">••••••9821</span>
                  </p>

                  <input
                    type="text"
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-center text-lg font-mono font-black tracking-widest text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />

                  {otpError && (
                    <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpValue('482910')}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      Autofill Test OTP (482910)
                    </button>
                    <span className="text-[11px] text-slate-500">Resend in 00:45</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleOtpConfirm}
                    className="flex-2 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    Submit OTP & Authorize
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL STEP 3: NetBanking Gateway Screen */}
        {showBankAuthModal && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
              
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-400" />
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-amber-300">
                      {selectedBank} Internet Banking Gateway
                    </h5>
                    <div className="text-xs font-bold text-white">
                      Statutory Government Fee Authorization
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowBankAuthModal(false)}
                  className="text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Government Portal:</span>
                    <span className="font-bold text-slate-900">Bharatkosh • Legal Metrology</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Payable:</span>
                    <span className="font-black text-slate-950 text-sm">{formatCurrencyINR(feeCalculation.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Treasury Head:</span>
                    <span className="font-mono font-bold text-slate-900">1475-00-106-01-00</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-900">Customer ID / User ID</label>
                    <input
                      type="text"
                      value={bankUserId}
                      onChange={e => setBankUserId(e.target.value)}
                      placeholder="e.g. 774829103"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-900">Login Password</label>
                    <input
                      type="password"
                      value={bankPassword}
                      onChange={e => setBankPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBankUserId('CORP_99182');
                      setBankPassword('SecurePass@2026');
                    }}
                    className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 underline block"
                  >
                    Pre-fill Authorized Corporate NetBanking ID (SBI Commercial)
                  </button>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBankAuthModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBankLoginAndPay}
                    className="flex-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Authorize & Realize Payment
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
