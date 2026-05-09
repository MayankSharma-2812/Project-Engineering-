const rateLimit = require('express-rate-limit');

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per IP per minute
  message: { message: 'Too many booking requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = bookingLimiter;
