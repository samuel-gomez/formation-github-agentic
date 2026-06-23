const express = require('express');
const { version } = require('./package.json');
const createAuthRouter = require('./routes/auth');

const app = express();

// Configure trust proxy for correct req.ip behind a reverse proxy.
// Set TRUST_PROXY to any Express trust proxy value, or TRUST_PROXY=false to disable.
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy !== 'false') {
  app.set('trust proxy', trustProxy || 1);
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
