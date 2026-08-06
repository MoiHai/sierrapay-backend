const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Simplified import and initialization
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
        if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('Missing required Firebase environment variables.');
        }

        // The key must have actual newlines, not literal \n
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        // Build the service account object
        const serviceAccount = {
            "type": "service_account",
            "project_id": process.env.FIREBASE_PROJECT_ID,
            "private_key_id": "render-deployment",
            "private_key": privateKey,
            "client_email": process.env.FIREBASE_CLIENT_EMAIL,
            "client_id": "render",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
            "universe_domain": "googleapis.com"
        };

        // Check if already initialized to avoid double initialization
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
            });
            console.log('🔥 Firebase app initialized.');
        } else {
            console.log('🔥 Firebase app already initialized.');
        }

        console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID}`);
        return admin.firestore();
    } catch (error) {
        console.error(`❌ Firebase initialization failed: ${error.message}`);
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

// --- Health Check Endpoints ---
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