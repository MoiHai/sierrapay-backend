const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Standard require for firebase-admin
let admin;
try {
  admin = require('firebase-admin');
  console.log('✅ firebase-admin loaded successfully');
} catch (error) {
  console.error('❌ Failed to load firebase-admin:', error.message);
  process.exit(1);
}

// Initialize Firebase from environment variables
const initializeFirebase = () => {
  try {
    // Check if we have the service account as environment variable
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      
      // Clean up the private key - handle newlines
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      // Replace literal \n with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: "render-deployment",
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: "render",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
        universe_domain: "googleapis.com"
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
      
      console.log('🔥 Firebase initialized from environment variables');
      console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID}`);
      return admin.firestore();
    }
    
    // Fallback: Try to load from file (local development)
    try {
      const fs = require('fs');
      const path = require('path');
      const serviceAccountPath = path.join(__dirname, 'credentials', 'serviceAccountKey.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });
        console.log('🔥 Firebase initialized from file');
        console.log(`📁 Project: ${serviceAccount.project_id}`);
        return admin.firestore();
      }
    } catch (fileError) {
      console.log('⚠️ No service account file found, checking environment variables...');
    }
    
    throw new Error('No Firebase credentials found. Set FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, and FIREBASE_CLIENT_EMAIL environment variables.');
    
  } catch (error) {
    console.error(`❌ Firebase initialization failed: ${error.message}`);
    process.exit(1);
  }
};

// Initialize Firebase
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

// Start server
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
