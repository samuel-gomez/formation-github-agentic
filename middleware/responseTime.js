function attachResponseTime(req, res, next) {
  const start = process.hrtime.bigint();
  const originalEnd = res.end;

  res.end = function patchedEnd(...args) {
    const elapsedNs = process.hrtime.bigint() - start;
    const elapsedMs = Number(elapsedNs) / 1_000_000;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time-Ms', elapsedMs.toFixed(2));
    }
    return originalEnd.apply(this, args);
  };

  next();
}

module.exports = attachResponseTime;
