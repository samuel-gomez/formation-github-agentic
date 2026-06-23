const express = require('express');
const { version } = require('./package.json');
const createAuthRouter = require('./routes/auth');

const app = express();

// Trust the first hop from a reverse proxy so req.ip reflects the real client IP.
// Set TRUST_PROXY=false to disable when running without a proxy.
if (process.env.TRUST_PROXY !== 'false') {
  app.set('trust proxy', 1);
}

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/version', (req, res) => {
  res.json({ version });
});

app.use('/auth', createAuthRouter());

module.exports = app;
