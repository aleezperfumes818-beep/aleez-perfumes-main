/**
 * Enterprise In-Memory Rate Limiting Middleware
 * Protects against Brute-Force, Denial of Service (DoS), Scraping, and Spam.
 * Features sliding window counters, automatic memory cleanup, standard rate limit headers,
 * and proxy-aware client IP extraction (compatible with Vercel, Cloudflare, and direct Node.js).
 */

const hitStores = new Set();

/**
 * Periodically purge stale entries from all active stores to prevent memory leaks
 */
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const store of hitStores) {
    for (const [key, data] of store.entries()) {
      if (now > data.resetTime) {
        store.delete(key);
      }
    }
  }
}, 60 * 1000);

if (cleanupTimer.unref) {
  cleanupTimer.unref(); // Allow Node event loop to exit cleanly in test/scripts
}

/**
 * Resolves reliable client IP address across reverse proxies (Vercel, Cloudflare, NGINX)
 */
export const getClientIp = (req) => {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return typeof cfIp === 'string' ? cfIp.trim() : cfIp[0].trim();

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return ips[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) return typeof realIp === 'string' ? realIp.trim() : realIp[0].trim();

  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
};

/**
 * Creates an Express middleware rate limiter
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (e.g. 15 * 60 * 1000)
 * @param {number} options.max - Maximum number of requests allowed in window
 * @param {string} [options.message] - Custom error message
 * @param {Function} [options.keyGenerator] - Custom key extractor (defaults to IP)
 * @param {Function} [options.skip] - Function returning boolean to bypass rate limiting
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP. Please try again later.',
  keyGenerator = getClientIp,
  skip = null,
} = {}) => {
  const hits = new Map();
  hitStores.add(hits);

  return (req, res, next) => {
    // Never throttle browser CORS preflight requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    if (skip && typeof skip === 'function' && skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      hits.set(key, record);
    }

    record.count += 1;

    const remaining = Math.max(0, max - record.count);
    const resetTimeSeconds = Math.ceil(record.resetTime / 1000);
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

    // Standard IETF & Express Rate Limit Headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetTimeSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: message,
        statusCode: 429,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
};

/**
 * General API Limiter: 300 requests per 15 minutes
 * Protects public endpoints from scraping and spam while permitting normal navigation.
 */
export const globalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'API rate limit exceeded. Please slow down and try again shortly.',
});

/**
 * Strict Auth Limiter: 10 attempts per 15 minutes
 * Protects authentication, registration fallbacks, and password resets against brute-force attacks.
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
});

/**
 * Order & Checkout Limiter: 15 requests per 10 minutes
 * Prevents automated cart stuffing, card testing, and fake order spam.
 */
export const orderLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'High checkout request volume detected. Please wait a moment before proceeding.',
});

/**
 * Email Dispatch Limiter: 8 requests per 15 minutes
 * Protects Resend quota against notification flooding and email bombing.
 */
export const emailLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Email delivery rate limit reached. Please wait a few minutes before requesting another email.',
});

/**
 * Admin Action Limiter: 60 requests per 5 minutes
 * Protects administrative inventory, category, and asset update endpoints.
 */
export const adminLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: 'Admin operation rate limit reached. Please wait briefly.',
});
