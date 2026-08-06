// Load environment variables FIRST
require('dotenv').config();

const app = require('./app');
const { ENVIRONMENT } = require('./config/environment');
const { initializeFirebase, getFirestore } = require('./config/firebase');

// Initialize Firebase
console.log('🔍 Initializing Firebase...');
try {
  initializeFirebase();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// Get database instance
const db = getFirestore();

// Set database in all repositories
const userRepo = require('./repositories/userRepository');
const otpRepo = require('./repositories/otpRepository');
const sessionRepo = require('./repositories/sessionRepository');
const deviceRepo = require('./repositories/deviceRepository');
const walletRepo = require('./repositories/walletRepository');

userRepo.setDb(db);
otpRepo.setDb(db);
sessionRepo.setDb(db);
deviceRepo.setDb(db);
walletRepo.setDb(db);

console.log('✅ Database set in all repositories');

const PORT = ENVIRONMENT.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 SierraPay Backend Server Started`);
    console.log(`=========================================`);
    console.log(`📍 Environment: ${ENVIRONMENT.NODE_ENV}`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
    console.log(`📍 Ready Check: http://localhost:${PORT}/health/ready`);
    console.log(`📍 Auth Routes: http://localhost:${PORT}/api/v1/auth`);
    console.log(`📍 Wallet Routes: http://localhost:${PORT}/api/v1/wallet`);
    console.log(`=========================================`);
});
