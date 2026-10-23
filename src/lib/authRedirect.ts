/**
 * Security utility to sanitize redirect URLs and prevent Open Redirect vulnerabilities.
 */
export function sanitizeRedirectPath(
  path: string | null | undefined,
  defaultFallback = '/account'
): string {
  if (!path || typeof path !== 'string') {
    return defaultFallback;
  }

  const trimmed = path.trim();

  // 1. Must start with exactly one forward slash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return defaultFallback;
  }

  // 2. Reject URI scheme tricks (javascript:, http:, https:, data:, etc.)
  if (trimmed.includes(':') || trimmed.includes('\\')) {
    return defaultFallback;
  }

  // 3. Reject control characters
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    return defaultFallback;
  }

  return trimmed;
}
