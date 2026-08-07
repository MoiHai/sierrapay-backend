const profileService = require('../services/profile/profileService');

class UserController {
  // Get user profile
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const profile = await profileService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { fullName, email, settings } = req.body;

      const result = await profileService.updateProfile(userId, {
        fullName,
        email,
        settings
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user
      });
    } catch (error) {
      next(error);
    }
  }

  // Update settings
  async updateSettings(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const settings = req.body;

      const result = await profileService.updateSettings(userId, settings);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.settings
      });
    } catch (error) {
      next(error);
    }
  }

  // Change phone number
  async changePhoneNumber(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { newPhoneNumber, otpCode } = req.body;

      if (!newPhoneNumber) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'New phone number is required'
        });
      }

      const result = await profileService.changePhoneNumber(
        userId,
        newPhoneNumber,
        otpCode
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: { phoneNumber: result.phoneNumber }
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload profile picture
  async uploadProfilePicture(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      
      // In production, handle file upload
      // For now, use a placeholder
      const fileData = req.file || { buffer: null };

      const result = await profileService.uploadProfilePicture(userId, fileData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { imageUrl: result.imageUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user activity
  async getActivity(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const result = await profileService.getActivity(userId, limit);

      res.status(200).json({
        success: true,
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

      const result = await profileService.getKYCStatus(userId);

      res.status(200).json({
        success: true,
        data: {
          kycStatus: result.kycStatus,
          isVerified: result.isVerified,
          message: result.message
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's devices
  async getDevices(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;

      const result = await profileService.getDevices(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's stats
  async getStats(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const profile = await profileService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: {
          stats: profile.stats,
          wallet: profile.wallet
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
