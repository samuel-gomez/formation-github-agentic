/**
 * In-memory rate limiter middleware factory.
 * Each call creates an isolated store — safe to use across multiple routes.
 *
 * Config (via environment variables, overridable via options):
 *   RATE_LIMIT_WINDOW_MS  — fixed window duration in ms (default: 900000 = 15 min)
 *   RATE_LIMIT_MAX        — max requests per window per IP (default: 5)
 */

function createRateLimiter(options = {}) {
  const envWindowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);
  const envMax = Number.parseInt(process.env.RATE_LIMIT_MAX, 10);

  const windowMsRaw = options.windowMs ?? (Number.isFinite(envWindowMs) ? envWindowMs : 900_000);
  const maxRaw = options.max ?? (Number.isFinite(envMax) ? envMax : 5);

  const windowMs = Number.isFinite(windowMsRaw) && windowMsRaw > 0 ? windowMsRaw : 900_000;
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : 5;

  const store = new Map();

  function rateLimiter(req, res, next) {
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const key = `${req.baseUrl ?? ''}${req.path ?? ''}:${ip}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now >= entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} second(s).`,
        retryAfter,
      });
    }

    return next();
  }

  return rateLimiter;
}

module.exports = createRateLimiter;
