// Validation Middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Sanitize input
const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags or script from input
  // This is a basic implementation - you can enhance it
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Basic sanitization
      return obj.replace(/[<>]/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

module.exports = {
  validateRequest,
  sanitizeInput
};
