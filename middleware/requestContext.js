const { randomUUID } = require('crypto');

function resolveRequestId(rawRequestId) {
  if (typeof rawRequestId === 'string' && rawRequestId.trim() !== '') {
    return rawRequestId.trim();
  }

  return randomUUID();
}

function attachRequestContext(req, res, next) {
  const requestId = resolveRequestId(req.get('x-request-id'));
  req.requestId = requestId;
  res.set('X-Request-Id', requestId);
  next();
}

module.exports = attachRequestContext;
