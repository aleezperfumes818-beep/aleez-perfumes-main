/**
 * Production Security & Input Sanitization Library for Aleez Perfumes
 * Protects against Cross-Site Scripting (XSS), HTML injection, header injection,
 * control character injection, and malformed inputs.
 */

/**
 * Sanitizes single-line plain text strings (names, cities, states, titles).
 * Strips HTML tags, removes non-printable control characters, and truncates to maxLength.
 */
export function sanitizeText(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '') // Strip control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes and normalizes email addresses.
 * Lowercases, strips whitespace, carriage returns, and newlines to prevent email header injection.
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s\r\n\t]/g, '')
    .slice(0, 254);
}

/**
 * Sanitizes telephone and WhatsApp numbers.
 * Preserves country code '+', digits, and standard separators, stripping potential script characters.
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[^0-9+\s\-()]/g, '')
    .slice(0, 20);
}

/**
 * Sanitizes Indian Postal PIN codes (strictly 6 digits).
 */
export function sanitizePincode(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[^0-9]/g, '').slice(0, 6);
}

/**
 * Sanitizes customer and recipient names.
 * Supports Unicode international letters, spaces, dots, hyphens, and apostrophes.
 */
export function sanitizeName(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{M}\s.'\-]/gu, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes multi-line inputs such as messages, notes, and full street addresses.
 * Strips executable HTML, script tags, style tags, and dangerous control characters,
 * while preserving safe formatting and line breaks.
 */
export function sanitizeMultiline(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes numeric inputs (prices, quantities, stock numbers).
 */
export function sanitizeNumber(input: unknown, fallback = 0, min = 0, max = 1000000): number {
  const num = typeof input === 'number' ? input : parseFloat(String(input));
  if (isNaN(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}
