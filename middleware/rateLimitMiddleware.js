// Rate Limit Middleware
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

// Payment rate limit
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter
};
