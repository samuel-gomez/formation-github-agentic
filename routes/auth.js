const { Router } = require('express');
const createRateLimiter = require('../middleware/rateLimiter');

function createAuthRouter(limiterConfig = {}) {
  const router = Router();
  const authLimiter = createRateLimiter(limiterConfig);
  const withRequestMeta = (req, payload) => ({ ...payload, requestId: req.requestId });

  router.post('/login', authLimiter, (req, res) => {
    res.status(200).json(withRequestMeta(req, { message: 'Login successful' }));
  });

  router.post('/reset-password', authLimiter, (req, res) => {
    res.status(200).json(withRequestMeta(req, { message: 'Password reset email sent' }));
  });

  router.post('/verify-code', authLimiter, (req, res) => {
    res.status(200).json(withRequestMeta(req, { message: 'Code verified' }));
  });

  return router;
}

module.exports = createAuthRouter;
