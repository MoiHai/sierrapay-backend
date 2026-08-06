const userRepository = require('../../repositories/userRepository');
const sessionRepository = require('../../repositories/sessionRepository');
const deviceRepository = require('../../repositories/deviceRepository');
const otpService = require('../otp/otpService');
const tokenService = require('../token/tokenService');

class AuthService {
  async register(phoneNumber, deviceData) {
    try {
      const existingUser = await userRepository.findByPhone(phoneNumber);
      if (existingUser) {
        throw new Error('User already exists with this phone number');
      }

      await otpService.generateOTP(phoneNumber, 'registration');

      return {
        success: true,
        message: 'OTP sent for verification',
        requiresOTP: true
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async verifyRegistration(phoneNumber, code, userData) {
    try {
      // Verify OTP with purpose 'registration'
      const verification = await otpService.verifyOTP(phoneNumber, code, 'registration');
      if (!verification.valid) {
        throw new Error('Invalid registration verification');
      }

      const user = await userRepository.create({
        phoneNumber,
        fullName: userData.fullName,
        email: userData.email,
        isVerified: true
      });

      return { success: true, user };
    } catch (error) {
      throw new Error(`Registration verification failed: ${error.message}`);
    }
  }

  async login(phoneNumber, code, deviceData) {
    try {
      const user = await userRepository.findByPhone(phoneNumber);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify OTP with purpose 'login'
      const verification = await otpService.verifyOTP(phoneNumber, code, 'login');
      if (!verification.valid) {
        throw new Error('Invalid login verification');
      }

      const device = await deviceRepository.findOrCreate({
        userId: user.userId,
        deviceId: deviceData.deviceId,
        deviceName: deviceData.deviceName,
        deviceType: deviceData.deviceType,
        deviceModel: deviceData.deviceModel,
        osVersion: deviceData.osVersion,
        appVersion: deviceData.appVersion,
        fcmToken: deviceData.fcmToken
      });

      const { accessToken, refreshToken } = tokenService.generateTokenPair(
        user.userId,
        device.deviceId
      );

      const session = await sessionRepository.create({
        userId: user.userId,
        deviceId: device.deviceId,
        refreshToken: refreshToken,
        accessToken: accessToken,
        ipAddress: deviceData.ipAddress,
        userAgent: deviceData.userAgent
      });

      await userRepository.updateLastLogin(user.userId);
      await deviceRepository.updateLastUsed(device.deviceId);
      await userRepository.addDevice(user.userId, device.deviceId);

      return {
        success: true,
        user,
        device,
        session,
        accessToken,
        refreshToken,
        isTrusted: device.isTrusted
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken, deviceId) {
    try {
      const session = await sessionRepository.findByRefreshToken(refreshToken);
      if (!session) {
        throw new Error('Invalid refresh token');
      }

      if (session.deviceId !== deviceId) {
        throw new Error('Device mismatch');
      }

      const { accessToken, refreshToken: newRefreshToken } = tokenService.generateTokenPair(
        session.userId,
        deviceId
      );

      await sessionRepository.invalidate(session.sessionId);
      
      const newSession = await sessionRepository.create({
        userId: session.userId,
        deviceId: deviceId,
        refreshToken: newRefreshToken,
        accessToken: accessToken
      });

      return {
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
        session: newSession
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async logout(userId, refreshToken) {
    try {
      const session = await sessionRepository.findByRefreshToken(refreshToken);
      if (session) {
        await sessionRepository.invalidate(session.sessionId);
        return { success: true, message: 'Logged out successfully' };
      }
      throw new Error('Session not found');
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async logoutAllDevices(userId) {
    try {
      const count = await sessionRepository.invalidateAllForUser(userId);
      return { 
        success: true, 
        message: `Logged out from ${count} devices`,
        count
      };
    } catch (error) {
      throw new Error(`Logout from all devices failed: ${error.message}`);
    }
  }

  async trustDevice(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device || device.userId !== userId) {
        throw new Error('Device not found');
      }

      await deviceRepository.updateTrusted(deviceId, true);
      return { success: true, message: 'Device trusted successfully' };
    } catch (error) {
      throw new Error(`Trust device failed: ${error.message}`);
    }
  }

  async revokeDevice(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device || device.userId !== userId) {
        throw new Error('Device not found');
      }

      await deviceRepository.revoke(deviceId);
      return { success: true, message: 'Device revoked successfully' };
    } catch (error) {
      throw new Error(`Revoke device failed: ${error.message}`);
    }
  }

  async getDevices(userId) {
    try {
      return await deviceRepository.findActiveByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get devices: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
