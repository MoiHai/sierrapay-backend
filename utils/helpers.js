// Helper Functions
const helpers = {
  // Check if object is empty
  isEmpty: (obj) => {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },
  
  // Deep clone object
  clone: (obj) => {
    if (!obj) return null;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      return obj;
    }
  },
  
  // Pick specific fields from object
  pick: (obj, fields) => {
    if (!obj) return {};
    const result = {};
    fields.forEach(field => {
      if (obj[field] !== undefined) {
        result[field] = obj[field];
      }
    });
    return result;
  },
  
  // Omit specific fields from object
  omit: (obj, fields) => {
    if (!obj) return {};
    const result = { ...obj };
    fields.forEach(field => {
      delete result[field];
    });
    return result;
  },
  
  // Sanitize phone number
  sanitizePhone: (phone) => {
    if (!phone) return '';
    // Remove all non-digit characters except +
    return phone.replace(/[^0-9+]/g, '');
  },
  
  // Mask sensitive data
  mask: (data, start = 0, end = 0) => {
    if (!data) return '';
    const str = String(data);
    const length = str.length;
    if (start >= length) return str;
    const endIndex = end > 0 ? length - end : length;
    const masked = str.substring(0, start) + 
                   '*'.repeat(Math.max(0, endIndex - start)) + 
                   str.substring(endIndex);
    return masked;
  },
  
  // Generate random string
  randomString: (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  },
  
  // Sleep function
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  // Try catch wrapper for async functions
  tryCatch: (fn) => {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        return { error };
      }
    };
  },
  
  // Get environment variable with fallback
  getEnv: (key, fallback = null) => {
    const value = process.env[key];
    return value !== undefined ? value : fallback;
  }
};

module.exports = helpers;
