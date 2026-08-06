const admin = require('firebase-admin');

let db = null;
let auth = null;
let messaging = null;

const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('🔥 Firebase already initialized');
      db = admin.firestore();
      auth = admin.auth();
      messaging = admin.messaging();
      return;
    }

    // Use environment variables for service account
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      
      // Clean the private key
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

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
      
      console.log('🔥 Firebase initialized from environment variables');
      console.log(`📁 Project: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      // Fallback: Try to load from file
      try {
        const fs = require('fs');
        const path = require('path');
        const serviceAccountPath = path.join(__dirname, '..', 'credentials', 'serviceAccountKey.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = require(serviceAccountPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
          });
          console.log('🔥 Firebase initialized from file');
          console.log(`📁 Project: ${serviceAccount.project_id}`);
        } else {
          throw new Error('No Firebase credentials found. Set environment variables or provide service account file.');
        }
      } catch (fileError) {
        throw new Error(`No Firebase credentials found: ${fileError.message}`);
      }
    }

    // Initialize services
    db = admin.firestore();
    auth = admin.auth();
    messaging = admin.messaging();
    
    console.log('✅ Firebase services ready');
  } catch (error) {
    console.error(`❌ Firebase initialization failed: ${error.message}`);
    throw error;
  }
};

const getFirestore = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

const getAuth = () => {
  if (!auth) throw new Error('Auth not initialized');
  return auth;
};

const getMessaging = () => {
  if (!messaging) throw new Error('Messaging not initialized');
  return messaging;
};

const checkFirebaseHealth = async () => {
  try {
    if (!db) return { connected: false, message: 'Firestore not initialized' };
    await db.collection('_health_check').doc('test').set({ timestamp: new Date().toISOString() });
    await db.collection('_health_check').doc('test').delete();
    return { connected: true, message: 'Firebase connection healthy' };
  } catch (error) {
    return { connected: false, message: error.message };
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  getMessaging,
  checkFirebaseHealth,
  db,
  auth,
  messaging
};
