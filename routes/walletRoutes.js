const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All wallet routes require authentication
router.use(authMiddleware);

// Get wallet balance
router.get('/balance', walletController.getBalance.bind(walletController));

// Get transaction history
router.get('/transactions', walletController.getTransactionHistory.bind(walletController));

// Refresh wallet data
router.post('/refresh', walletController.refreshWallet.bind(walletController));

// Get full wallet details
router.get('/', walletController.getWalletDetails.bind(walletController));

module.exports = router;
