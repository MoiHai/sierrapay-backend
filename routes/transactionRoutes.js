const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All transaction routes require authentication
router.use(authMiddleware);

// Send money
router.post('/send', transactionController.sendMoney.bind(transactionController));

// Get transaction history - THIS MUST COME BEFORE /:transactionId
router.get('/history', transactionController.getTransactionHistory.bind(transactionController));

// Get transaction stats
router.get('/stats/summary', transactionController.getStats.bind(transactionController));

// Get transaction by ID - this should come AFTER /history and /stats
router.get('/:transactionId', transactionController.getTransaction.bind(transactionController));

// Get transaction receipt
router.get('/:transactionId/receipt', transactionController.getReceipt.bind(transactionController));

module.exports = router;
