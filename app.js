const express = require('express');
const { version } = require('./package.json');
const createAuthRouter = require('./routes/auth');
const attachRequestContext = require('./middleware/requestContext');

const app = express();

// Configure trust proxy for correct req.ip behind a reverse proxy.
// Set TRUST_PROXY to any Express trust proxy value, or TRUST_PROXY=false to disable.
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy !== 'false') {
  app.set('trust proxy', trustProxy || 1);
}

app.use(express.json());
app.use(attachRequestContext);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
});

app.get('/version', (req, res) => {
  res.json({
    version,
    requestId: req.requestId,
  });
});

app.use('/auth', createAuthRouter());

module.exports = app;
