const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All QR routes require authentication
router.use(authMiddleware);

// Generate QR code
router.post('/generate', qrController.generateQR.bind(qrController));

// Scan QR code
router.post('/scan', qrController.scanQR.bind(qrController));

// Get QR payment history - MUST COME BEFORE /:qrId
router.get('/history', qrController.getQRHistory.bind(qrController));

// Get QR payment by ID - comes AFTER /history
router.get('/:qrId', qrController.getQRPayment.bind(qrController));

// Cancel QR payment
router.delete('/:qrId', qrController.cancelQR.bind(qrController));

module.exports = router;
