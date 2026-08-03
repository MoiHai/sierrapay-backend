// Merchant Routes
const express = require('express');
const router = express.Router();
const MerchantController = require('../controllers/merchantController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

router.use(authMiddleware);

// Apply for merchant
router.post('/apply', MerchantController.apply);

// Get merchant profile
router.get('/profile', MerchantController.getProfile);

// Update merchant profile
router.put('/profile', MerchantController.updateProfile);

// Get merchant transactions
router.get('/transactions', MerchantController.getTransactions);

// Admin only routes
router.use(adminMiddleware);

// Get all merchants
router.get('/all', MerchantController.getAll);

// Verify merchant
router.put('/:id/verify', MerchantController.verify);

// Suspend merchant
router.put('/:id/suspend', MerchantController.suspend);

module.exports = router;
