// Health Routes
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const environment = require('../config/environment');

// Health check
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const db = getDb();
    await db.collection('_health').doc('ping').set({ ping: Date.now() });
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: environment.NODE_ENV,
      version: require('../package.json').version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness probe
router.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

module.exports = router;
