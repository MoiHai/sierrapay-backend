const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All KYC routes require authentication
router.use(authMiddleware);

// ============================================
// USER KYC ENDPOINTS
// ============================================

// Submit KYC application
router.post('/submit', kycController.submitKYC.bind(kycController));

// Get KYC status
router.get('/status', kycController.getKYCStatus.bind(kycController));

// Get full KYC details
router.get('/', kycController.getKYC.bind(kycController));

// Upload ID document
router.post('/upload/id', kycController.uploadID.bind(kycController));

// Upload selfie
router.post('/upload/selfie', kycController.uploadSelfie.bind(kycController));

// Upload proof of address
router.post('/upload/proof', kycController.uploadProofOfAddress.bind(kycController));

// Resubmit KYC
router.post('/resubmit', kycController.resubmitKYC.bind(kycController));

// ============================================
// ADMIN KYC ENDPOINTS
// ============================================

// Get all KYC submissions (Admin)
router.get('/admin/all', kycController.getAllKYC.bind(kycController));

// Get KYC stats (Admin)
router.get('/admin/stats', kycController.getStats.bind(kycController));

// Verify KYC (Admin)
router.put('/admin/:kycId/verify', kycController.verifyKYC.bind(kycController));

// Reject KYC (Admin)
router.put('/admin/:kycId/reject', kycController.rejectKYC.bind(kycController));

module.exports = router;
