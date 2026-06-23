const attachResponseTime = require('./responseTime');

function makeMocks({ headersSent = false } = {}) {
  const headers = {};
  const res = {
    headersSent,
    setHeader: jest.fn((name, value) => { headers[name] = value; }),
    end: jest.fn(function (...args) { return this; }),
    _headers: headers,
  };
  const req = {};
  const next = jest.fn();
  return { req, res, next };
}

describe('attachResponseTime middleware', () => {
  it('sets X-Response-Time-Ms header when res.end is called', () => {
    const { req, res, next } = makeMocks();
    attachResponseTime(req, res, next);
    expect(next).toHaveBeenCalled();
    res.end();
    expect(res.setHeader).toHaveBeenCalledWith('X-Response-Time-Ms', expect.any(String));
  });

  it('value matches format /^\\d+\\.\\d{2}$/', () => {
    const { req, res, next } = makeMocks();
    attachResponseTime(req, res, next);
    res.end();
    const value = res._headers['X-Response-Time-Ms'];
    expect(value).toMatch(/^\d+\.\d{2}$/);
  });

  it('value is non-negative', () => {
    const { req, res, next } = makeMocks();
    attachResponseTime(req, res, next);
    res.end();
    expect(Number(res._headers['X-Response-Time-Ms'])).toBeGreaterThanOrEqual(0);
  });

  it('does NOT set header if res.headersSent is true', () => {
    const { req, res, next } = makeMocks({ headersSent: true });
    attachResponseTime(req, res, next);
    res.end();
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('calls original res.end with original arguments', () => {
    const { req, res, next } = makeMocks();
    const originalEnd = res.end;
    attachResponseTime(req, res, next);
    res.end('body', 'utf8');
    expect(originalEnd).toHaveBeenCalledWith('body', 'utf8');
  });
});
