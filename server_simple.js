const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load Firebase credentials
const serviceAccountPath = path.join(__dirname, 'credentials', 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();
console.log('🔥 Firebase initialized successfully');
console.log(`📁 Project: ${serviceAccount.project_id}`);

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
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
  console.log(`=========================================`);
});
