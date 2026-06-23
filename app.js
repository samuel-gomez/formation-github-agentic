const express = require('express');
const { version } = require('./package.json');

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/version', (req, res) => {
  res.json({ version });
});

module.exports = app;
