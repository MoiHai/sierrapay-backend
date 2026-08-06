const dotenv = require('dotenv');
const path = require('path');

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

console.log(`🔧 Environment: ${ENVIRONMENT.NODE_ENV}`);
console.log(`🔧 Port: ${ENVIRONMENT.PORT}`);

module.exports = {
  ENVIRONMENT
};
