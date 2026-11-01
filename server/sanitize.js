/**
 * Server-Side Security & Input Sanitization Library for Aleez Perfumes
 * Guarantees that all data written to database or sent in emails is clean and safe.
 */

export function sanitizeText(input, maxLength = 255) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(input) {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s\r\n\t]/g, '')
    .slice(0, 254);
}

export function sanitizePhone(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[^0-9+\s\-()]/g, '')
    .slice(0, 20);
}

export function sanitizePincode(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[^0-9]/g, '').slice(0, 6);
}

export function sanitizeMultiline(input, maxLength = 2000) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeNumber(input, fallback = 0, min = 0, max = 1000000) {
  const num = typeof input === 'number' ? input : parseFloat(String(input));
  if (isNaN(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}
