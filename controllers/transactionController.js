const paymentService = require('../services/payment/paymentService');

class TransactionController {
  // Send money
  async sendMoney(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { receiverPhone, amount, description } = req.body;

      // Validate input
      if (!receiverPhone) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Receiver phone number is required'
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Amount must be greater than 0'
        });
      }

      const result = await paymentService.sendMoney(
        userId,
        receiverPhone,
        amount,
        description
      );

      res.status(200).json({
        success: true,
        message: 'Money sent successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction by ID
  async getTransaction(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Transaction ID is required'
        });
      }

      const transaction = await paymentService.getTransaction(transactionId, userId);

      res.status(200).json({
        success: true,
        data: transaction
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
      const offset = parseInt(req.query.offset) || 0;

      // Get transactions from repository directly
      const transactionRepository = require('../repositories/transactionRepository');
      const transactions = await transactionRepository.findByUserId(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          count: transactions.length,
          limit,
          offset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction receipt
  async getReceipt(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Transaction ID is required'
        });
      }

      const receipt = await paymentService.getReceipt(transactionId, userId);

      res.status(200).json({
        success: true,
        data: receipt
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction stats
  async getStats(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;

      const stats = await paymentService.getStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
