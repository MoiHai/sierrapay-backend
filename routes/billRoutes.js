const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All bill routes require authentication
router.use(authMiddleware);

// Get bill providers
router.get('/providers', billController.getProviders.bind(billController));

// Pay electricity bill
router.post('/electricity', billController.payElectricity.bind(billController));

// Pay water bill
router.post('/water', billController.payWater.bind(billController));

// Pay internet bill
router.post('/internet', billController.payInternet.bind(billController));

// Pay TV bill
router.post('/tv', billController.payTV.bind(billController));

// Generic bill payment
router.post('/pay', billController.payBill.bind(billController));

// Verify customer
router.post('/verify', billController.verifyCustomer.bind(billController));

// Get bill history
router.get('/history', billController.getBillHistory.bind(billController));

// Get bill stats
router.get('/stats', billController.getBillStats.bind(billController));

// Get bills by category
router.get('/category/:category', billController.getBillsByCategory.bind(billController));

// Get bill by ID
router.get('/:billId', billController.getBill.bind(billController));

module.exports = router;
