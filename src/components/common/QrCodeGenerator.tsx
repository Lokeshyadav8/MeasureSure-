import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, Download, Check, ExternalLink } from 'lucide-react';
import { getPublicVerificationUrl } from '../../utils/verification';

interface MetrologyQrCodeProps {
  data: string;
  size?: number;
  showEmblem?: boolean;
  className?: string;
  downloadable?: boolean;
  fileName?: string;
}

export const MetrologyQrCode: React.FC<MetrologyQrCodeProps> = ({
  data,
  size = 140,
  showEmblem = false,
  className = '',
  downloadable = false,
  fileName = 'legal-metrology-qr-seal.png'
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize data to a clean, phone-scannable URL using public origin
  const resolvedPayload = React.useMemo(() => {
    return getPublicVerificationUrl(data);
  }, [data]);

  useEffect(() => {
    let isMounted = true;
    
    // Generate high-density, error-corrected QR code
    QRCode.toDataURL(resolvedPayload, {
      errorCorrectionLevel: showEmblem ? 'H' : 'M',
      margin: 1,
      width: Math.max(size * 2, 280),
      color: {
        dark: '#0f172a', // Deep slate / statutory ink
        light: '#ffffff'
      }
    })
      .then(url => {
        if (isMounted) {
          setQrDataUrl(url);
          setError(null);
        }
      })
      .catch(err => {
        console.error('Failed to generate real QR Code:', err);
        if (isMounted) {
          setError('Failed to render QR');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedPayload, size, showEmblem]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resolvedPayload) return;
    navigator.clipboard.writeText(resolvedPayload);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div
        className="relative bg-white rounded-2xl border-2 border-slate-300 p-2 shadow-sm flex items-center justify-center overflow-hidden transition-all hover:border-cyan-500 group"
        style={{ width: size, height: size }}
      >
        {qrDataUrl ? (
          <>
            <img
              src={qrDataUrl}
              alt="Statutory Legal Metrology Verification QR Code"
              className="w-full h-full object-contain select-none"
              draggable={false}
            />

            {/* Optional Small Center Security Emblem (only when size > 110 and requested) */}
            {showEmblem && size >= 110 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-6 h-6 bg-slate-900 border-2 border-white rounded-md shadow-md flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
            )}
          </>
        ) : error ? (
          <div className="text-[10px] text-rose-500 text-center font-mono p-1">
            {error}
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {downloadable && qrDataUrl && (
        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            title="Download high-resolution printable QR sticker"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Save QR</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copy verification link"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
          >
            {hasCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <ExternalLink className="w-3 h-3" />}
            <span>{hasCopied ? 'Copied' : 'Link'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
