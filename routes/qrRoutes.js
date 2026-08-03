// QR Routes
const express = require('express');
const router = express.Router();
const QRController = require('../controllers/qrController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Generate QR
router.post('/generate', QRController.generate);

// Verify QR
router.post('/verify', QRController.verify);

// Process QR payment
router.post('/pay', QRController.processPayment);

module.exports = router;
