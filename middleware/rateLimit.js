// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// Limit each IP to 60 requests per minute
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,      // 1 minute
  max: 60,                      // limit each IP to 60 requests per window
  message: { error: 'Too many requests – please try again later.' },
  standardHeaders: true,        // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,         // Disable the `X-RateLimit-*` headers
});

module.exports = apiLimiter;
