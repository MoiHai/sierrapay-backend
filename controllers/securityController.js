const securityService = require('../services/security/securityService');

class SecurityController {
  // ============================================
  // DEVICE MANAGEMENT
  // ============================================

  // Get all devices
  async getDevices(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await securityService.getUserDevices(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Register device
  async registerDevice(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const deviceData = req.body;

      if (!deviceData.deviceId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Device ID is required'
        });
      }

      const result = await securityService.registerDevice(userId, deviceData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Trust device
  async trustDevice(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId } = req.params;

      const result = await securityService.trustDevice(userId, deviceId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Revoke device
  async revokeDevice(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId } = req.params;

      const result = await securityService.revokeDevice(userId, deviceId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Get device details
  async getDeviceDetails(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId } = req.params;

      const result = await securityService.getDeviceDetails(userId, deviceId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Update device name
  async updateDeviceName(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId } = req.params;
      const { deviceName } = req.body;

      if (!deviceName) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Device name is required'
        });
      }

      const result = await securityService.updateDeviceName(userId, deviceId, deviceName);

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
  // FINGERPRINT / BIOMETRIC
  // ============================================

  // Enable biometric
  async enableBiometric(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Device ID is required'
        });
      }

      const result = await securityService.enableBiometric(userId, deviceId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Disable biometric
  async disableBiometric(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Device ID is required'
        });
      }

      const result = await securityService.disableBiometric(userId, deviceId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify biometric
  async verifyBiometric(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId, biometricData } = req.body;

      if (!deviceId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Device ID is required'
        });
      }

      const result = await securityService.verifyBiometric(userId, deviceId, biometricData);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // TRUSTED DEVICES
  // ============================================

  // Get trusted devices
  async getTrustedDevices(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await securityService.getTrustedDevices(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Untrust device
  async untrustDevice(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { deviceId } = req.params;

      const result = await securityService.untrustDevice(userId, deviceId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // SESSIONS
  // ============================================

  // Get active sessions
  async getSessions(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await securityService.getActiveSessions(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Terminate session
  async terminateSession(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { sessionId } = req.params;

      const result = await securityService.terminateSession(userId, sessionId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Terminate all sessions
  async terminateAllSessions(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const currentSessionId = req.session?.sessionId || null;

      const result = await securityService.terminateAllSessions(userId, currentSessionId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { count: result.count }
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // TWO-FACTOR AUTHENTICATION
  // ============================================

  // Enable 2FA
  async enable2FA(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await securityService.enable2FA(userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Disable 2FA
  async disable2FA(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await securityService.disable2FA(userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify 2FA
  async verify2FA(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          error: 'Validation failed',
          message: '2FA code is required'
        });
      }

      const result = await securityService.verify2FA(userId, code);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SecurityController();
