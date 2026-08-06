// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🔍 Loading environment variables...');
console.log('  FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ SET' : '❌ MISSING');
console.log('  FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ SET' : '❌ MISSING');
console.log('  FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ SET' : '❌ MISSING');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING');

// Warn if JWT_SECRET is the default placeholder
if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
  console.warn('⚠️  WARNING: JWT_SECRET is set to the default placeholder! Use a strong secret in production.');
}

const admin = require('firebase-admin');
console.log('✅ firebase-admin loaded successfully. Version:', admin.SDK_VERSION);

const initializeFirebase = () => {
    try {
        if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('Missing required Firebase environment variables.');
        }

        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID.trim(),
            private_key_id: "render-deployment",
            private_key: privateKey,
            client_email: process.env.FIREBASE_CLIENT_EMAIL.trim(),
            client_id: "render",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL.trim())}`,
            universe_domain: "googleapis.com"
        };

        if (admin.apps.length > 0) {
            console.log('🔥 Firebase app already initialized.');
            return admin.firestore();
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });

        console.log('🔥 Firebase initialized from environment variables');
        console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID}`);
        return admin.firestore();
    } catch (error) {
        console.error(`❌ Firebase initialization failed: ${error.message}`);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

const db = initializeFirebase();

// Set the database in all repositories
const userRepo = require('./repositories/userRepository');
const otpRepo = require('./repositories/otpRepository');
const sessionRepo = require('./repositories/sessionRepository');
const deviceRepo = require('./repositories/deviceRepository');

userRepo.setDb(db);
otpRepo.setDb(db);
sessionRepo.setDb(db);
deviceRepo.setDb(db);

console.log('✅ Database set in all repositories');

const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'SierraPay Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health/ready', async (req, res) => {
    try {
        await db.collection('_test').limit(1).get();
        res.json({
            status: 'ready',
            database: { connected: true }
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            database: { connected: false, error: error.message }
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'SierraPay Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

// Auth routes
try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/v1/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('⚠️ Auth routes not yet available:', error.message);
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 SierraPay Backend Server Started`);
    console.log(`=========================================`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
    console.log(`📍 Ready Check: http://localhost:${PORT}/health/ready`);
    console.log(`📍 Auth Routes: http://localhost:${PORT}/api/v1/auth`);
    console.log(`=========================================`);
});
