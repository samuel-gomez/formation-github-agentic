/**
 * Factory for the response-time middleware.
 *
 * We override res.end (not res.on('finish')) because the header must be set
 * *before* the response is flushed to the network. res.on('finish') fires
 * after the socket write, so setHeader() would be a no-op at that point.
 * The !res.headersSent guard prevents a double-set if another middleware
 * (e.g. compression) has already patched res.end and closed the headers.
 *
 * @param {object} [options]
 * @param {string} [options.headerName='X-Response-Time-Ms'] - Response header name.
 */
function createResponseTime({ headerName = 'X-Response-Time-Ms' } = {}) {
  return function attachResponseTime(req, res, next) {
    const start = process.hrtime.bigint();
    const originalEnd = res.end;

    res.end = function patchedEnd(...args) {
      const elapsedNs = process.hrtime.bigint() - start;
      // BigInt division keeps full precision; only the final ms value is a float
      const elapsedMs = (Number(elapsedNs / 1_000n) / 1_000).toFixed(2);
      if (!res.headersSent) {
        res.setHeader(headerName, elapsedMs);
      }
      return originalEnd.apply(this, args);
    };

    next();
  };
}

module.exports = createResponseTime;
