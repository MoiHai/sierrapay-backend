// Payment Routes
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const paymentValidation = require('../validators/paymentValidator');
const { paymentLimiter } = require('../middleware/rateLimitMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Send money
router.post(
  '/send',
  paymentLimiter,
  validateRequest(paymentValidation.sendMoney),
  PaymentController.sendMoney
);

// Request money
router.post(
  '/request',
  paymentLimiter,
  validateRequest(paymentValidation.requestMoney),
  PaymentController.requestMoney
);

// QR Payment
router.post(
  '/qr-payment',
  paymentLimiter,
  validateRequest(paymentValidation.qrPayment),
  PaymentController.qrPayment
);

// Generate QR code
router.post('/qr/generate', PaymentController.generateQR);

// Scan QR code
router.post('/qr/scan', PaymentController.scanQR);

module.exports = router;
