const authService = require('../services/auth/authService');
const otpService = require('../services/otp/otpService');

class AuthController {
  // Send OTP for registration or login
  async sendOTP(req, res, next) {
    try {
      const { phoneNumber, purpose = 'login' } = req.body;
      
      const otp = await otpService.generateOTP(phoneNumber, purpose);
      
      res.status(200).json({
        success: true,
        message: `OTP sent to ${phoneNumber}`,
        data: {
          phoneNumber,
          purpose,
          expiresIn: parseInt(process.env.OTP_EXPIRY_MINUTES) * 60,
          ...(process.env.NODE_ENV !== 'production' && { testCode: otp.code })
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Register new user
  async register(req, res, next) {
    try {
      const { phoneNumber, code, fullName, email } = req.body;
      
      // Verify registration OTP
      const result = await authService.verifyRegistration(
        phoneNumber,
        code,
        { fullName, email }
      );
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { phoneNumber, code } = req.body;
      
      const deviceData = {
        deviceId: req.body.deviceId || 'temp_device',
        deviceName: req.body.deviceName || 'Unknown Device',
        deviceType: req.body.deviceType || 'web',
        deviceModel: req.body.deviceModel || null,
        osVersion: req.body.osVersion || null,
        appVersion: req.body.appVersion || null,
        fcmToken: req.body.fcmToken || null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      };
      
      const result = await authService.login(phoneNumber, code, deviceData);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          device: result.device,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          isTrusted: result.isTrusted
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken, deviceId } = req.body;
      
      const result = await authService.refreshToken(refreshToken, deviceId);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      const result = await authService.logout(req.user?.userId, refreshToken);
      
      res.status(200).json({
        success: true,
        message: result.message || 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout from all devices
  async logoutAll(req, res, next) {
    try {
      const result = await authService.logoutAllDevices(req.user.userId);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: { count: result.count }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Trust a device
  async trustDevice(req, res, next) {
    try {
      const { deviceId } = req.body;
      
      const result = await authService.trustDevice(req.user.userId, deviceId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Revoke a device
  async revokeDevice(req, res, next) {
    try {
      const { deviceId } = req.params;
      
      const result = await authService.revokeDevice(req.user.userId, deviceId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's devices
  async getDevices(req, res, next) {
    try {
      const devices = await authService.getDevices(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: { devices }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
