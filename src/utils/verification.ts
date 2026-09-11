/**
 * Utility for generating accessible, phone-scannable Legal Metrology verification URLs.
 */

export function getPublicVerificationUrl(certOrInstId: string): string {
  if (!certOrInstId) return '';

  let cleanId = extractVerificationCode(certOrInstId);
  if (!cleanId) {
    cleanId = certOrInstId.trim();
  }

  // Publicly accessible origin determination (convert ais-dev- to public ais-pre- so any mobile scanner works without 403/404)
  let origin = 'https://ais-pre-bftz56dcbccrbt4epqo6wi-584815721425.asia-southeast1.run.app';

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    let currentOrigin = window.location.origin;
    // Replace ais-dev- container domain with ais-pre- public preview domain to avoid Google login 403/404
    if (currentOrigin.includes('ais-dev-')) {
      currentOrigin = currentOrigin.replace('ais-dev-', 'ais-pre-');
    }
    origin = currentOrigin;
  }

  return `${origin}/?verify=${encodeURIComponent(cleanId)}`;
}

/**
 * Normalizes any query, URL, or scanned string into a clean certificate or instrument query code.
 */
export function extractVerificationCode(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // 1. Check URL parameters e.g. ?verify=CERT-2026-NLM-0841 or ?cert=... or ?code=...
  const paramMatch = trimmed.match(/[?&](?:verify|cert|code|id)=([^&#]+)/i);
  if (paramMatch && paramMatch[1]) {
    const extracted = decodeURIComponent(paramMatch[1]).trim();
    if (extracted && extracted !== 'true') {
      return extracted;
    }
  }

  // 2. Check URL path segment e.g. /cert/CERT-2026-NLM-0841 or /verify/CERT-2026-NLM-0841
  const pathMatch = trimmed.match(/(?:cert|inst|verify)\/([^/?&#]+)/i);
  if (pathMatch && pathMatch[1]) {
    return decodeURIComponent(pathMatch[1]).trim();
  }

  // 3. Match statutory certificate format CERT-YYYY-LOC-NNNN
  const certMatch = trimmed.match(/CERT-\d+-[A-Z0-9]+-\d+/i);
  if (certMatch) {
    return certMatch[0].trim();
  }

  // 4. Match instrument format INST-XXX-NNNN
  const instMatch = trimmed.match(/INST-[A-Z0-9]+-\d+/i);
  if (instMatch) {
    return instMatch[0].trim();
  }

  return trimmed;
}

