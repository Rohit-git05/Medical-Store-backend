const rateLimit = require('express-rate-limit');

// Rate limiting middleware to prevent brute force / DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Simple custom XSS/HTML sanitizer middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      // Escape HTML tags to prevent XSS
      return val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    } else if (Array.isArray(val)) {
      return val.map(sanitizeValue);
    } else if (typeof val === 'object' && val !== null) {
      const sanitizedObj = {};
      for (const key in val) {
        sanitizedObj[key] = sanitizeValue(val[key]);
      }
      return sanitizedObj;
    }
    return val;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

module.exports = { apiLimiter, sanitizeInput };
