const request = require('supertest');
const app = require('./app');
const { version } = require('./package.json');

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(res.headers['x-request-id']).toBe(res.body.requestId);
  });

  it('should reuse inbound x-request-id header', async () => {
    const res = await request(app).get('/health').set('x-request-id', 'training-id-001');
    expect(res.statusCode).toBe(200);
    expect(res.body.requestId).toBe('training-id-001');
    expect(res.headers['x-request-id']).toBe('training-id-001');
  });
});

describe('GET /version', () => {
  it('should return 200 with the version from package.json', async () => {
    const res = await request(app).get('/version');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      version,
      requestId: expect.any(String),
    });
    expect(res.headers['x-request-id']).toBe(res.body.requestId);
  });
});
