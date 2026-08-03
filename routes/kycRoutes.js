// KYC Routes
const express = require('express');
const router = express.Router();
const KYCController = require('../controllers/kycController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

router.use(authMiddleware);

// Submit KYC
router.post('/submit', KYCController.submit);

// Get KYC status
router.get('/status', KYCController.getStatus);

// Admin only routes
router.use(adminMiddleware);

// Get all KYC submissions
router.get('/all', KYCController.getAll);

// Verify KYC
router.put('/:id/verify', KYCController.verify);

// Reject KYC
router.put('/:id/reject', KYCController.reject);

module.exports = router;
