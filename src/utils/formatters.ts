/**
 * Utility helper functions for clean formatting across Legal Metrology app
 */

export function formatCapacity(capacity: string | number | undefined | null, unit: string | undefined | null): string {
  if (capacity === undefined || capacity === null || capacity === '') {
    return `0 ${unit || ''}`.trim();
  }
  
  const capStr = String(capacity).trim();
  const unitStr = (unit || '').trim();
  
  if (!unitStr) return capStr;
  
  // If capacity string already ends with or includes the unit (e.g. "60 Ton" with unit "Ton", or "15 kg" with unit "kg")
  const regex = new RegExp(`\\s*${unitStr}$`, 'i');
  if (regex.test(capStr)) {
    return capStr;
  }
  
  return `${capStr} ${unitStr}`;
}

export function formatTolerance(tolerance: number | undefined | null): string {
  if (tolerance === undefined || tolerance === null) return '±0.05%';
  return `±${(tolerance * 100).toFixed(2)}%`;
}

export function formatTestReadingError(errorDelta: number, unit: string, errorPct: number, toleranceLimit: number): string {
  const sign = errorDelta >= 0 ? '+' : '';
  const pctSign = errorPct >= 0 ? '+' : '';
  return `Error Δ: ${sign}${errorDelta.toFixed(4)} ${unit}  •  Dev: ${pctSign}${(errorPct * 100).toFixed(3)}%  •  MPE Limit: ±${(toleranceLimit * 100).toFixed(2)}%`;
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
