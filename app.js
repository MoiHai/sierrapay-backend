const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { ENVIRONMENT, isProduction } = require('./config/environment');
const { initializeFirebase, checkFirebaseHealth } = require('./config/firebase');

// Simple logger
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  debug: (msg) => console.debug(`[DEBUG] ${msg}`)
};

try {
  initializeFirebase();
  logger.info('✅ Firebase initialized successfully');
} catch (error) {
  logger.error(`❌ Firebase initialization failed: ${error.message}`);
  if (!isProduction) {
    logger.warn('⚠️ Continuing without Firebase for development');
  } else {
    throw error;
  }
}

const app = express();

// ============================================
// Health check endpoints (BEFORE any middleware)
// ============================================

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    service: 'SierraPay Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    const dbHealth = await checkFirebaseHealth();
    res.status(dbHealth.connected ? 200 : 503).json({
      status: dbHealth.connected ? 'ready' : 'not ready',
      service: 'SierraPay Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SierraPay Backend',
    version: '1.0.0',
    environment: ENVIRONMENT.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SierraPay Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      ready: '/health/ready',
      live: '/health/live',
      auth: '/api/v1/auth',
      wallet: '/api/v1/wallet'
    }
  });
});

// ============================================
// Security Middleware
// ============================================

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ============================================
// Logging Middleware
// ============================================

if (!isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// Body Parsing Middleware
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ============================================
// Static Files
// ============================================

app.use('/uploads', express.static('uploads'));

// ============================================
// API Routes
// ============================================

// Auth routes

// User routes

// KYC routes

// Security routes
app.use('/api/v1/security', require('./routes/securityRoutes'));
app.use('/api/v1/kyc', require('./routes/kycRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));

// Wallet routes - ADDED!

// Transaction routes

// QR routes

// Bill routes

// Notification routes
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/bills', require('./routes/billRoutes'));
app.use('/api/v1/qr', require('./routes/qrRoutes'));
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));
app.use('/api/v1/wallet', require('./routes/walletRoutes'));

// ============================================
// 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

// ============================================
// Global Error Handler
// ============================================

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  if (err.stack) {
    logger.error(`Stack: ${err.stack}`);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

module.exports = app;
