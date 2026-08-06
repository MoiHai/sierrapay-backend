const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Load firebase-admin
let admin;
try {
    admin = require('firebase-admin');
    console.log('✅ firebase-admin loaded successfully. Version:', admin.SDK_VERSION);
} catch (error) {
    console.error('❌ Failed to load firebase-admin:', error.message);
    process.exit(1);
}

const initializeFirebase = () => {
    try {
        // Debug: Log environment variable status
        console.log('🔍 Checking environment variables:');
        console.log('  FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ SET' : '❌ MISSING');
        console.log('  FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ SET' : '❌ MISSING');
        console.log('  FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : '❌ MISSING');

        if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('Missing required Firebase environment variables.');
        }

        // Clean the private key
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        // Build the service account object
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

        console.log('📝 serviceAccount.private_key exists?', serviceAccount.private_key ? 'YES' : 'NO');
        console.log('📝 serviceAccount.private_key length:', serviceAccount.private_key ? serviceAccount.private_key.length : 'undefined');

        // Check if apps already initialized
        if (admin.apps.length > 0) {
            console.log('🔥 Firebase app already initialized.');
            return admin.firestore();
        }

        // Initialize Firebase with the service account
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
            });
            console.log('🔥 Firebase app initialized successfully!');
        } catch (initError) {
            console.error('❌ Error during initializeApp:', initError.message);
            throw initError;
        }

        console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID}`);
        return admin.firestore();
    } catch (error) {
        console.error(`❌ Firebase initialization failed: ${error.message}`);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Initialize the database
const db = initializeFirebase();

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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 SierraPay Backend Server Started`);
    console.log(`=========================================`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
    console.log(`📍 Ready Check: http://localhost:${PORT}/health/ready`);
    console.log(`=========================================`);
});
