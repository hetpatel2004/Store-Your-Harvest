// In-memory sliding window rate limiter for brute-force prevention
const requestCounts = new Map();

// Periodic cleanup of stale tracking entries
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now - record.startTime > record.windowMs) {
      requestCounts.delete(key);
    }
  }
}, 10 * 60 * 1000);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

/**
 * Creates an Express rate limiter middleware
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 min)
 * @param {number} options.max - Max requests within windowMs (default: 30)
 * @param {string} options.message - Error message to return
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 30,
  message = 'Too many requests from this IP. Please try again after 15 minutes.',
} = {}) => {
  return (req, res, next) => {
    // Extract real client IP behind reverse proxy / Vercel Edge
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (forwarded ? forwarded.split(',')[0].trim() : null) || req.socket?.remoteAddress || req.ip || 'unknown';
    const now = Date.now();

    let record = requestCounts.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now, windowMs };
      requestCounts.set(ip, record);
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      const retryAfter = Math.ceil((record.startTime + windowMs - now) / 60000);
      return res.status(429).json({
        success: false,
        message,
        retryAfterMinutes: retryAfter,
      });
    }

    next();
  };
};

module.exports = { createRateLimiter };
