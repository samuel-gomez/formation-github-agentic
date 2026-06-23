const express = require('express');
const { version } = require('./package.json');
const createAuthRouter = require('./routes/auth');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/version', (req, res) => {
  res.json({ version });
});

app.use('/auth', createAuthRouter());

module.exports = app;
