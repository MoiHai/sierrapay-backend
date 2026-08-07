const qrService = require('../services/qr/qrService');
const qrRepository = require('../repositories/qrRepository');

class QRController {
  // Generate QR code
  async generateQR(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Amount must be greater than 0'
        });
      }

      const result = await qrService.generateQR(userId, amount, description);

      res.status(200).json({
        success: true,
        message: 'QR code generated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Scan QR code
  async scanQR(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { qrCode, amount } = req.body;

      if (!qrCode) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'QR code is required'
        });
      }

      const result = await qrService.scanQR(userId, qrCode, amount);

      res.status(200).json({
        success: true,
        message: 'QR payment successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get QR payment by ID
  async getQRPayment(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { qrId } = req.params;

      const qrPayment = await qrService.getQRPayment(qrId, userId);

      res.status(200).json({
        success: true,
        data: qrPayment
      });
    } catch (error) {
      next(error);
    }
  }

  // Get QR payment history - FIXED: Uses repository directly
  async getQRHistory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;

      // Use repository directly - NOT the service
      const history = await qrRepository.findByUserId(userId, limit);

      res.status(200).json({
        success: true,
        data: {
          history,
          count: history.length,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel QR payment
  async cancelQR(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { qrId } = req.params;

      const result = await qrService.cancelQR(qrId, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QRController();
