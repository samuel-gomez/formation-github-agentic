function attachResponseTime(req, res, next) {
  const start = process.hrtime.bigint();
  const originalEnd = res.end;

  res.end = function patchedEnd(...args) {
    const elapsedNs = process.hrtime.bigint() - start;
    // Divide in BigInt to keep full precision, then convert only the final ms value
    const elapsedMs = (Number(elapsedNs / 1_000n) / 1_000).toFixed(2);
    if (!res.headersSent) {
      res.setHeader('X-Response-Time-Ms', elapsedMs);
    }
    return originalEnd.apply(this, args);
  };

  next();
}

module.exports = attachResponseTime;
