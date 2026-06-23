const request = require('supertest');
const express = require('express');
const createAuthRouter = require('../routes/auth');
const attachResponseTime = require('../middleware/responseTime');

/**
 * Builds a minimal Express app with a fresh auth router for each test.
 * Each call produces a new createRateLimiter() instance with its own isolated store.
 */
function buildApp(limiterConfig = {}) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.requestId = req.get('x-request-id') ?? 'test-request-id';
    res.set('X-Request-Id', req.requestId);
    next();
  });
  app.use(attachResponseTime);
  app.use('/auth', createAuthRouter(limiterConfig));
  return app;
}

const ENDPOINTS = [
  {
    method: 'post',
    path: '/auth/login',
    validBody: { username: 'alice', password: 'secret-password' },
    invalidBody: { username: 'alice' },
  },
  {
    method: 'post',
    path: '/auth/reset-password',
    validBody: { email: 'alice@example.com' },
    invalidBody: { email: 'invalid-email' },
  },
  {
    method: 'post',
    path: '/auth/verify-code',
    validBody: { code: '123456' },
    invalidBody: { code: '12A' },
  },
];

// ── Nominal: all requests under the limit succeed ────────────────────────────

describe('Auth rate limiter — nominal (under limit)', () => {
  const MAX = 3;

  test.each(ENDPOINTS)(
    `POST $path — all ${MAX} requests return 200`,
    async ({ method, path, validBody }) => {
      const app = buildApp({ max: MAX, windowMs: 60_000 });
      for (let i = 0; i < MAX; i++) {
        const res = await request(app)[method](path).send(validBody);
        expect(res.statusCode).toBe(200);
        expect(res.body.requestId).toBe('test-request-id');
        expect(res.headers['x-response-time-ms']).toBeDefined();
      }
    },
  );
});

describe('Auth responses — request context', () => {
  test.each(ENDPOINTS)(
    'POST $path — keeps request id in header and response body',
    async ({ method, path, validBody }) => {
      const app = buildApp({ max: 5, windowMs: 60_000 });
      const res = await request(app)[method](path).set('x-request-id', 'auth-flow-777').send(validBody);
      expect(res.statusCode).toBe(200);
      expect(res.body.requestId).toBe('auth-flow-777');
      expect(res.headers['x-request-id']).toBe('auth-flow-777');
      expect(res.headers['x-response-time-ms']).toBeDefined();
    },
  );
});

// ── Limit exceeded: (MAX + 1)th request returns 429 ─────────────────────────

describe('Auth rate limiter — limit exceeded', () => {
  const MAX = 2;

  test.each(ENDPOINTS)(
    `POST $path — returns 429 after ${MAX} requests`,
    async ({ method, path, validBody }) => {
      const app = buildApp({ max: MAX, windowMs: 60_000 });
      for (let i = 0; i < MAX; i++) {
        await request(app)[method](path).send(validBody);
      }
      const res = await request(app)[method](path).send(validBody);
      expect(res.statusCode).toBe(429);
      expect(res.body).toMatchObject({
        error: 'Too Many Requests',
        retryAfter: expect.any(Number),
      });
      expect(res.headers['retry-after']).toBeDefined();
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.headers['x-response-time-ms']).toBeDefined();
    },
  );
});

// ── Window reset: requests succeed again after the window expires ─────────────

describe('Auth rate limiter — window reset', () => {
  const MAX = 2;
  const WINDOW_MS = 1000;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test.each(ENDPOINTS)(
    'POST $path — returns 200 again after window expires',
    async ({ method, path, validBody }) => {
      const app = buildApp({ max: MAX, windowMs: WINDOW_MS });

      // Exhaust the limit
      for (let i = 0; i < MAX; i++) {
        await request(app)[method](path).send(validBody);
      }
      const blocked = await request(app)[method](path).send(validBody);
      expect(blocked.statusCode).toBe(429);

      // Advance fake clock past the window
      jest.advanceTimersByTime(WINDOW_MS + 1);

      const recovered = await request(app)[method](path).send(validBody);
      expect(recovered.statusCode).toBe(200);
    },
  );
});

// ── Env var config: limiter reads RATE_LIMIT_* variables at creation time ────

describe('Auth rate limiter — env var configuration', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_MAX;
    delete process.env.RATE_LIMIT_WINDOW_MS;
  });

  it('respects RATE_LIMIT_MAX from environment', async () => {
    process.env.RATE_LIMIT_MAX = '1';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    const app = buildApp(); // no explicit config → reads env vars
    await request(app).post('/auth/login').send({ username: 'alice', password: 'secret-password' });
    const res = await request(app).post('/auth/login').send({ username: 'alice', password: 'secret-password' });
    expect(res.statusCode).toBe(429);
  });
});

describe('Auth payload validation', () => {
  test.each(ENDPOINTS)(
    'POST $path — returns 400 for invalid payload',
    async ({ method, path, invalidBody }) => {
      const app = buildApp({ max: 5, windowMs: 60_000 });
      const res = await request(app)[method](path).send(invalidBody);
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        error: 'Bad Request',
        message: expect.any(String),
        requestId: 'test-request-id',
      });
      expect(res.headers['x-request-id']).toBe('test-request-id');
      expect(res.headers['x-response-time-ms']).toBeDefined();
    },
  );
});

// ── Edge case: empty payload returns 400 on every auth endpoint ───────────────

describe('Auth payload validation — empty payload', () => {
  test.each(ENDPOINTS)(
    'POST $path — returns 400 for empty payload',
    async ({ method, path }) => {
      const app = buildApp({ max: 5, windowMs: 60_000 });
      const res = await request(app)[method](path).send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        error: 'Bad Request',
        message: expect.any(String),
        requestId: expect.any(String),
      });
      expect(res.headers['x-request-id']).toBeDefined();
    },
  );
});

// ── P1: X-Response-Time-Ms value validation (positive number, 2 decimal places) ─

describe('X-Response-Time-Ms header — value format', () => {
  test.each(ENDPOINTS)(
    'POST $path — X-Response-Time-Ms is a positive number with 2 decimal places',
    async ({ method, path, validBody }) => {
      const app = buildApp({ max: 5, windowMs: 60_000 });
      const res = await request(app)[method](path).send(validBody);

      const headerValue = res.headers['x-response-time-ms'];
      expect(headerValue).toBeDefined();

      // Must be parseable as a finite positive number
      const parsed = parseFloat(headerValue);
      expect(Number.isFinite(parsed)).toBe(true);
      expect(parsed).toBeGreaterThanOrEqual(0);

      // Must have exactly 2 decimal places (e.g. "1.23", "0.05")
      expect(headerValue).toMatch(/^\d+\.\d{2}$/);
    },
  );
});
