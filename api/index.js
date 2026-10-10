// Root Vercel Serverless Function entry point
// Routes all /api/* requests to the Express application
const app = require('../server/server');

module.exports = app;
