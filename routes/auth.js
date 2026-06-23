const { Router } = require('express');
const createRateLimiter = require('../middleware/rateLimiter');

function createAuthRouter(limiterConfig = {}) {
  const router = Router();
  const authLimiter = createRateLimiter(limiterConfig);

  router.post('/login', authLimiter, (req, res) => {
    res.status(200).json({ message: 'Login successful' });
  });

  router.post('/reset-password', authLimiter, (req, res) => {
    res.status(200).json({ message: 'Password reset email sent' });
  });

  router.post('/verify-code', authLimiter, (req, res) => {
    res.status(200).json({ message: 'Code verified' });
  });

  router._limiter = authLimiter;
  return router;
}

module.exports = createAuthRouter;
