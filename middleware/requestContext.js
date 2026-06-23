const { randomUUID } = require('crypto');

const MAX_REQUEST_ID_LENGTH = 128;

function resolveRequestId(rawRequestId) {
  if (
    typeof rawRequestId === 'string' &&
    rawRequestId.trim() !== '' &&
    rawRequestId.trim().length <= MAX_REQUEST_ID_LENGTH
  ) {
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
