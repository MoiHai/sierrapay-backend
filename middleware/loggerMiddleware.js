// Logger Middleware
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom morgan format
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Logger middleware
const logger = morgan(morganFormat, {
  stream: accessLogStream,
  skip: (req) => req.method === 'OPTIONS' // Skip OPTIONS requests
});

// Error logger
const errorLogger = morgan(morganFormat, {
  stream: errorLogStream,
  skip: (req) => req.statusCode < 400
});

// Development logger (console)
const devLogger = morgan('dev');

module.exports = {
  logger,
  errorLogger,
  devLogger
};
