import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit';
import { Request } from 'express';
import { env } from '../config/env.js';

/**
 * User-friendly rate limit error messages
 */
const messages = {
  contact: {
    success: false,
    message: 'Anda telah mengirim terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.',
    messageEn: 'You have submitted too many requests. Please try again in a few minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  general: {
    success: false,
    message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
    messageEn: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  auth: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.',
    messageEn: 'Too many login attempts. Please try again in a few minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
};

/**
 * Generate key from IP and optionally email
 */
function generateKeyWithEmail(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = req.body?.email || '';
  return `${ip}-${email}`;
}

/**
 * Generate key from IP only
 */
function generateKeyFromIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Rate limiter for contact/services form submissions
 * Default: 5 requests per 10 minutes per IP+email
 */
export const contactRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_CONTACT_WINDOW_MS,
  max: env.RATE_LIMIT_CONTACT_MAX_REQUESTS,
  message: messages.contact,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKeyWithEmail,
  handler: (req, res) => {
    const windowMinutes = Math.ceil(env.RATE_LIMIT_CONTACT_WINDOW_MS / 60000);
    res.status(429).json({
      ...messages.contact,
      retryAfterMinutes: windowMinutes,
      limit: env.RATE_LIMIT_CONTACT_MAX_REQUESTS,
    });
  },
});

/**
 * Rate limiter for authentication endpoints
 * Default: 20 requests per 15 minutes per IP
 * Configurable via AUTH_RATE_LIMIT_* environment variables
 * Can bypass for localhost via AUTH_RATE_LIMIT_BYPASS_LOCAL=true
 */
export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: messages.auth,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    // Bypass for localhost in dev/test mode
    if (env.AUTH_RATE_LIMIT_BYPASS_LOCAL) {
      const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost';
      if (isLocalhost) {
        // Return a unique key per request to effectively disable rate limiting
        return `bypass-${Date.now()}-${Math.random()}`;
      }
    }
    return ip;
  },
  handler: (req, res) => {
    const windowMinutes = Math.ceil(env.AUTH_RATE_LIMIT_WINDOW_MS / 60000);
    res.status(429).json({
      ...messages.auth,
      retryAfterMinutes: windowMinutes,
      limit: env.AUTH_RATE_LIMIT_MAX,
    });
  },
});

/**
 * General API rate limiter
 * Default: 300 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: messages.general,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKeyFromIp,
});

/**
 * Factory function to create custom rate limiters
 */
export function createRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: typeof messages.general;
  keyGenerator?: (req: Request) => string;
}): ReturnType<typeof rateLimit> {
  const {
    windowMs = env.RATE_LIMIT_WINDOW_MS,
    maxRequests = env.RATE_LIMIT_MAX_REQUESTS,
    message = messages.general,
    keyGenerator = generateKeyFromIp,
  } = options;

  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) => {
      const windowMinutes = Math.ceil(windowMs / 60000);
      res.status(429).json({
        ...message,
        retryAfterMinutes: windowMinutes,
        limit: maxRequests,
      });
    },
  });
}
