const { Router } = require('express');
const createRateLimiter = require('../middleware/rateLimiter');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidEmail(value) {
  return isNonEmptyString(value) && value.includes('@');
}

function isValidCode(value) {
  return isNonEmptyString(value) && /^\d{6}$/.test(value);
}

function createAuthRouter(limiterConfig = {}) {
  const router = Router();
  const authLimiter = createRateLimiter(limiterConfig);
  const withRequestMeta = (req, payload) => ({ ...payload, requestId: req.requestId });
  const badRequest = (req, res, message) => {
    res.status(400).json(
      withRequestMeta(req, {
        error: 'Bad Request',
        message,
      }),
    );
  };

  router.post('/login', authLimiter, (req, res) => {
    const username = req.body?.username;
    const password = req.body?.password;
    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
      return badRequest(req, res, 'username and password are required');
    }

    res.status(200).json(withRequestMeta(req, { message: 'Login successful' }));
  });

  router.post('/reset-password', authLimiter, (req, res) => {
    const email = req.body?.email;
    if (!isValidEmail(email)) {
      return badRequest(req, res, 'email must be a valid address');
    }

    res.status(200).json(withRequestMeta(req, { message: 'Password reset email sent' }));
  });

  router.post('/verify-code', authLimiter, (req, res) => {
    const code = req.body?.code;
    if (!isValidCode(code)) {
      return badRequest(req, res, 'code must be a 6-digit string');
    }

    res.status(200).json(withRequestMeta(req, { message: 'Code verified' }));
  });

  return router;
}

module.exports = createAuthRouter;
