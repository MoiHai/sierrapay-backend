const kycService = require('../services/kyc/kycService');

class KYCController {
  // Submit KYC application
  async submitKYC(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const kycData = req.body;

      // Validate required fields
      const requiredFields = ['fullName', 'dateOfBirth', 'idType', 'idNumber'];
      for (const field of requiredFields) {
        if (!kycData[field]) {
          return res.status(400).json({
            error: 'Validation failed',
            message: `${field} is required`
          });
        }
      }

      const result = await kycService.submitKYC(userId, kycData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get KYC status
  async getKYCStatus(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await kycService.getKYCStatus(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get full KYC details
  async getKYC(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await kycService.getKYC(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload ID document
  async uploadID(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { idType } = req.body;

      if (!idType) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'ID type is required'
        });
      }

      // In production, handle file upload
      const fileData = req.file || { buffer: null };

      const result = await kycService.uploadID(userId, fileData, idType);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload selfie
  async uploadSelfie(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      
      // In production, handle file upload
      const fileData = req.file || { buffer: null };

      const result = await kycService.uploadSelfie(userId, fileData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload proof of address
  async uploadProofOfAddress(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      
      const fileData = req.file || { buffer: null };

      const result = await kycService.uploadProofOfAddress(userId, fileData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Resubmit KYC
  async resubmitKYC(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const kycData = req.body;

      const result = await kycService.resubmitKYC(userId, kycData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Get all KYC submissions (Admin)
  async getAllKYC(req, res, next) {
    try {
      const { status } = req.query;
      const limit = parseInt(req.query.limit) || 50;

      const submissions = await kycService.getAllKYC(status, limit);

      res.status(200).json({
        success: true,
        data: {
          submissions,
          count: submissions.length,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify KYC (Admin)
  async verifyKYC(req, res, next) {
    try {
      const { kycId } = req.params;
      const { notes } = req.body;
      const adminId = req.user.userId || req.user.id;

      const result = await kycService.verifyKYC(kycId, adminId, notes);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Reject KYC (Admin)
  async rejectKYC(req, res, next) {
    try {
      const { kycId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Rejection reason is required'
        });
      }

      const result = await kycService.rejectKYC(kycId, reason);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get KYC stats (Admin)
  async getStats(req, res, next) {
    try {
      const stats = await kycService.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KYCController();
