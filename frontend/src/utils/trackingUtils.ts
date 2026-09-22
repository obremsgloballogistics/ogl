/**
 * OGL Tracking Number Utility
 * Format: OGL + 8 random digits + country suffix
 * e.g.  OGL99823412CN  (China)
 *        OGL88734512UK  (United Kingdom)
 *        OGL77261234GH  (Ghana)
 */

export type TrackingCountryCode = 'CN' | 'UK' | 'GH';

/** Derive the 2-letter suffix from a free-text origin or destination string */
export function getCountrySuffix(locationText: string): TrackingCountryCode {
  const s = (locationText || '').toLowerCase();
  if (
    s.includes('china') ||
    s.includes('guangzhou') ||
    s.includes('shanghai') ||
    s.includes('beijing') ||
    s.includes('shenzhen') ||
    s.includes('yiwu') ||
    s.includes('cn')
  ) {
    return 'CN';
  }
  if (
    s.includes('ghana') ||
    s.includes('accra') ||
    s.includes('kumasi') ||
    s.includes('tema') ||
    s.includes('takoradi') ||
    s.includes('gh')
  ) {
    return 'GH';
  }
  // Default — UK
  return 'UK';
}

/** Generate a random OGL tracking number from an origin string */
export function generateTrackingNumber(origin: string): string {
  const suffix = getCountrySuffix(origin);
  const digits = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
  return `OGL${digits}${suffix}`;
}

/** Parse the country suffix from an existing tracking number */
export function parseSuffix(trackingNumber: string): TrackingCountryCode | null {
  if (!trackingNumber) return null;
  const upper = trackingNumber.toUpperCase();
  if (upper.endsWith('CN')) return 'CN';
  if (upper.endsWith('GH')) return 'GH';
  if (upper.endsWith('UK')) return 'UK';
  return null;
}

/** Return a human-readable country label from a tracking number or suffix */
export function getSuffixLabel(trackingNumber: string): string {
  const suffix = parseSuffix(trackingNumber);
  switch (suffix) {
    case 'CN': return 'China';
    case 'GH': return 'Ghana';
    case 'UK': return 'United Kingdom';
    default: return '';
  }
}

/** Return a flag emoji from a tracking number */
export function getSuffixFlag(trackingNumber: string): string {
  const suffix = parseSuffix(trackingNumber);
  switch (suffix) {
    case 'CN': return '🇨🇳';
    case 'GH': return '🇬🇭';
    case 'UK': return '🇬🇧';
    default: return '';
  }
}

/** All currency codes supported by the system */
export const CURRENCIES = [
  { code: 'GBP', symbol: '£',    label: 'GBP (£ - British Pound)' },
  { code: 'GHS', symbol: 'GH₵', label: 'GHS (GH₵ - Ghana Cedi)' },
  { code: 'CNY', symbol: '¥',    label: 'CNY (¥ - Chinese Yuan)' },
  { code: 'USD', symbol: '$',    label: 'USD ($ - US Dollar)' },
  { code: 'EUR', symbol: '€',    label: 'EUR (€ - Euro)' },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]['code'];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
}
