const app = require('../server/server.js');

module.exports = (req, res) => {
  // Normalize URL so Express routes matching /api/* always resolve correctly on Vercel
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
