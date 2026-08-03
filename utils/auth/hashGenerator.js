// Hash Generator
const crypto = require('crypto');

const hashGenerator = {
  // Generate SHA256 hash
  sha256: (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },
  
  // Generate SHA512 hash
  sha512: (data) => {
    return crypto.createHash('sha512').update(data).digest('hex');
  },
  
  // Generate MD5 hash (not recommended for security, use for non-critical)
  md5: (data) => {
    return crypto.createHash('md5').update(data).digest('hex');
  },
  
  // Generate HMAC
  hmac: (data, key) => {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  },
  
  // Generate random token
  randomToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },
  
  // Generate API key
  apiKey: () => {
    return crypto.randomBytes(32).toString('base64')
      .replace(/\+/g, '')
      .replace(/\//g, '')
      .replace(/=/g, '')
      .substring(0, 32);
  }
};

module.exports = hashGenerator;
