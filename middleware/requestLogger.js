/**
 * Structured JSON request logger middleware factory.
 *
 * Logs one line per request on `res.finish`, after the response is sent:
 *   { timestamp, method, path, statusCode, duration, requestId }
 *
 * @param {Function} [output=console.log] - destination function, injectable for testing
 */
function createRequestLogger(output = console.log) {
  return function requestLogger(req, res, next) {
    const startedAt = Date.now();

    res.on('finish', () => {
      output(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: Date.now() - startedAt,
          requestId: req.requestId ?? null,
        }),
      );
    });

    next();
  };
}

module.exports = createRequestLogger;
