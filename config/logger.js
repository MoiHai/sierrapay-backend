const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`);
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${message}`);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`);
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`);
    }
  }
};

module.exports = logger;
