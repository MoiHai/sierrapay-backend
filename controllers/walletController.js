const walletService = require('../services/wallet/walletService');

class WalletController {
  // Get wallet balance
  async getBalance(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const balance = await walletService.getBalance(userId);
      
      res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction history
  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      
      const transactions = await walletService.getTransactionHistory(userId, limit);
      
      res.status(200).json({
        success: true,
        data: {
          transactions,
          count: transactions.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh wallet data
  async refreshWallet(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const wallet = await walletService.refreshWallet(userId);
      
      res.status(200).json({
        success: true,
        message: 'Wallet refreshed successfully',
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  // Get wallet details (for admin or user)
  async getWalletDetails(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const wallet = await walletService.getWalletByUserId(userId);
      
      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
