const request = require('supertest');
const express = require('express');
const createRequestLogger = require('./requestLogger');

/**
 * Builds a minimal app with an injected log function so tests
 * can capture output without hitting stdout.
 */
function buildApp({ logFn, withRequestId = true } = {}) {
  const app = express();
  if (withRequestId) {
    app.use((req, _res, next) => {
      req.requestId = 'test-logger-id';
      next();
    });
  }
  app.use(createRequestLogger(logFn));
  app.get('/ping', (_req, res) => res.status(200).json({ ok: true }));
  app.post('/fail', (_req, res) => res.status(400).json({ error: 'Bad Request' }));
  return app;
}

describe('requestLogger middleware', () => {
  it('logs a JSON line with all expected fields on a successful request', async () => {
    const logged = [];
    const app = buildApp({ logFn: (line) => logged.push(JSON.parse(line)) });

    await request(app).get('/ping');

    expect(logged).toHaveLength(1);
    expect(logged[0]).toMatchObject({
      method: 'GET',
      path: '/ping',
      statusCode: 200,
      requestId: 'test-logger-id',
    });
    expect(typeof logged[0].duration).toBe('number');
    expect(logged[0].duration).toBeGreaterThanOrEqual(0);
    expect(typeof logged[0].timestamp).toBe('string');
    expect(new Date(logged[0].timestamp).toString()).not.toBe('Invalid Date');
  });

  it('logs statusCode 400 for a failing route', async () => {
    const logged = [];
    const app = buildApp({ logFn: (line) => logged.push(JSON.parse(line)) });

    await request(app).post('/fail');

    expect(logged[0].statusCode).toBe(400);
    expect(logged[0].method).toBe('POST');
    expect(logged[0].path).toBe('/fail');
  });

  it('logs statusCode 404 for unknown routes', async () => {
    const logged = [];
    const app = buildApp({ logFn: (line) => logged.push(JSON.parse(line)) });

    await request(app).get('/not-found');

    expect(logged[0].statusCode).toBe(404);
  });

  it('logs requestId as null when requestContext middleware is absent', async () => {
    const logged = [];
    const app = buildApp({ logFn: (line) => logged.push(JSON.parse(line)), withRequestId: false });

    await request(app).get('/ping');

    expect(logged[0].requestId).toBeNull();
  });
});
