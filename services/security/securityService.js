const deviceRepository = require('../../repositories/deviceRepository');
const sessionRepository = require('../../repositories/sessionRepository');
const userRepository = require('../../repositories/userRepository');
const notificationService = require('../notification/notificationService');
const tokenService = require('../token/tokenService');

class SecurityService {
  // ============================================
  // DEVICE MANAGEMENT
  // ============================================

  // Get all devices for a user
  async getUserDevices(userId) {
    try {
      const devices = await deviceRepository.findActiveByUserId(userId);
      return {
        success: true,
        data: {
          devices: devices || [],
          count: devices ? devices.length : 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get devices: ${error.message}`);
    }
  }

  // Register a new device
  async registerDevice(userId, deviceData) {
    try {
      // Check if device already exists
      let device = await deviceRepository.findByDeviceId(deviceData.deviceId);
      
      if (device) {
        // Update existing device
        await deviceRepository.findOrCreate({
          userId: userId,
          ...deviceData,
          lastUsedAt: new Date().toISOString()
        });
        device = await deviceRepository.findByDeviceId(deviceData.deviceId);
      } else {
        // Create new device
        device = await deviceRepository.create({
          userId: userId,
          ...deviceData,
          isTrusted: false,
          isActive: true,
          lastUsedAt: new Date().toISOString()
        });
        
        // Add device to user's device list
        await userRepository.addDevice(userId, device.deviceId);
        
        // Send notification
        await notificationService.sendToUser(
          userId,
          '📱 New Device Registered',
          `A new device "${deviceData.deviceName || 'Unknown'}" has been registered to your account.`,
          {
            type: 'security',
            action: 'device_registered',
            deviceId: device.deviceId,
            deviceName: deviceData.deviceName || 'Unknown'
          },
          ['in_app', 'push', 'sms']
        );
      }

      return {
        success: true,
        message: 'Device registered successfully',
        data: device
      };
    } catch (error) {
      throw new Error(`Failed to register device: ${error.message}`);
    }
  }

  // Trust a device
  async trustDevice(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized to trust this device');
      }

      await deviceRepository.updateTrusted(deviceId, true);
      const updatedDevice = await deviceRepository.findByDeviceId(deviceId);

      // Send notification
      await notificationService.sendToUser(
        userId,
        '✅ Device Trusted',
        `Device "${device.deviceName || 'Unknown'}" has been marked as trusted.`,
        {
          type: 'security',
          action: 'device_trusted',
          deviceId: deviceId
        },
        ['in_app', 'push']
      );

      return {
        success: true,
        message: 'Device trusted successfully',
        data: updatedDevice
      };
    } catch (error) {
      throw new Error(`Failed to trust device: ${error.message}`);
    }
  }

  // Revoke a device
  async revokeDevice(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized to revoke this device');
      }

      // Revoke all sessions for this device
      await sessionRepository.invalidateAllForUser(userId);

      // Revoke the device
      await deviceRepository.revoke(deviceId);

      // Send notification
      await notificationService.sendToUser(
        userId,
        '🔒 Device Revoked',
        `Device "${device.deviceName || 'Unknown'}" has been revoked and can no longer access your account.`,
        {
          type: 'security',
          action: 'device_revoked',
          deviceId: deviceId
        },
        ['in_app', 'push', 'sms']
      );

      return {
        success: true,
        message: 'Device revoked successfully'
      };
    } catch (error) {
      throw new Error(`Failed to revoke device: ${error.message}`);
    }
  }

  // Get device details
  async getDeviceDetails(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized to view this device');
      }

      // Get sessions for this device
      const sessions = await sessionRepository.findActiveByUserId(userId);
      const deviceSessions = sessions.filter(s => s.deviceId === deviceId);

      return {
        success: true,
        data: {
          ...device,
          sessions: deviceSessions,
          sessionCount: deviceSessions.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get device details: ${error.message}`);
    }
  }

  // Update device name
  async updateDeviceName(userId, deviceId, deviceName) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized to update this device');
      }

      await deviceRepository.update(deviceId, { deviceName });
      const updatedDevice = await deviceRepository.findByDeviceId(deviceId);

      return {
        success: true,
        message: 'Device name updated successfully',
        data: updatedDevice
      };
    } catch (error) {
      throw new Error(`Failed to update device name: ${error.message}`);
    }
  }

  // ============================================
  // FINGERPRINT / BIOMETRIC
  // ============================================

  // Enable biometric authentication
  async enableBiometric(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Update user settings
      await userRepository.update(userId, {
        'settings.biometricEnabled': true
      });

      // Update device
      await deviceRepository.update(deviceId, {
        biometricEnabled: true
      });

      // Send notification
      await notificationService.sendToUser(
        userId,
        '🔐 Biometric Authentication Enabled',
        'Biometric authentication has been enabled for your device.',
        {
          type: 'security',
          action: 'biometric_enabled'
        },
        ['in_app', 'push']
      );

      return {
        success: true,
        message: 'Biometric authentication enabled successfully'
      };
    } catch (error) {
      throw new Error(`Failed to enable biometric: ${error.message}`);
    }
  }

  // Disable biometric authentication
  async disableBiometric(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await userRepository.update(userId, {
        'settings.biometricEnabled': false
      });

      await deviceRepository.update(deviceId, {
        biometricEnabled: false
      });

      return {
        success: true,
        message: 'Biometric authentication disabled successfully'
      };
    } catch (error) {
      throw new Error(`Failed to disable biometric: ${error.message}`);
    }
  }

  // Verify biometric authentication
  async verifyBiometric(userId, deviceId, biometricData) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // In production, this would verify the biometric data with the device
      // For now, simulate verification
      const isValid = true;

      if (!isValid) {
        throw new Error('Biometric verification failed');
      }

      // Update last used
      await deviceRepository.updateLastUsed(deviceId);

      return {
        success: true,
        message: 'Biometric verification successful'
      };
    } catch (error) {
      throw new Error(`Biometric verification failed: ${error.message}`);
    }
  }

  // ============================================
  // TRUSTED DEVICES
  // ============================================

  // Get trusted devices
  async getTrustedDevices(userId) {
    try {
      const devices = await deviceRepository.findActiveByUserId(userId);
      const trusted = devices.filter(d => d.isTrusted === true);

      return {
        success: true,
        data: {
          devices: trusted,
          count: trusted.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get trusted devices: ${error.message}`);
    }
  }

  // Untrust a device
  async untrustDevice(userId, deviceId) {
    try {
      const device = await deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await deviceRepository.updateTrusted(deviceId, false);

      // Send notification
      await notificationService.sendToUser(
        userId,
        '🔓 Device Untrusted',
        `Device "${device.deviceName || 'Unknown'}" has been untrusted.`,
        {
          type: 'security',
          action: 'device_untrusted',
          deviceId: deviceId
        },
        ['in_app', 'push']
      );

      return {
        success: true,
        message: 'Device untrusted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to untrust device: ${error.message}`);
    }
  }

  // ============================================
  // SESSIONS
  // ============================================

  // Get all active sessions
  async getActiveSessions(userId) {
    try {
      const sessions = await sessionRepository.findActiveByUserId(userId);
      
      // Get device details for each session
      const sessionsWithDevices = await Promise.all(
        sessions.map(async (session) => {
          const device = await deviceRepository.findByDeviceId(session.deviceId);
          return {
            ...session,
            deviceName: device ? device.deviceName : 'Unknown Device',
            deviceType: device ? device.deviceType : 'Unknown'
          };
        })
      );

      return {
        success: true,
        data: {
          sessions: sessionsWithDevices,
          count: sessionsWithDevices.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get sessions: ${error.message}`);
    }
  }

  // Terminate a session
  async terminateSession(userId, sessionId) {
    try {
      const session = await sessionRepository.findByRefreshToken(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.userId !== userId) {
        throw new Error('Unauthorized to terminate this session');
      }

      await sessionRepository.invalidate(session.sessionId);

      // Send notification
      await notificationService.sendToUser(
        userId,
        '🔒 Session Terminated',
        'A session has been terminated. If this was not you, please change your password.',
        {
          type: 'security',
          action: 'session_terminated',
          sessionId: sessionId
        },
        ['in_app', 'push']
      );

      return {
        success: true,
        message: 'Session terminated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to terminate session: ${error.message}`);
    }
  }

  // Terminate all sessions (except current)
  async terminateAllSessions(userId, currentSessionId) {
    try {
      const sessions = await sessionRepository.findActiveByUserId(userId);
      
      let terminatedCount = 0;
      for (const session of sessions) {
        if (session.sessionId !== currentSessionId) {
          await sessionRepository.invalidate(session.sessionId);
          terminatedCount++;
        }
      }

      // Send notification
      await notificationService.sendToUser(
        userId,
        '🔒 All Sessions Terminated',
        `All other sessions have been terminated. ${terminatedCount} session(s) were ended.`,
        {
          type: 'security',
          action: 'all_sessions_terminated',
          count: terminatedCount
        },
        ['in_app', 'push']
      );

      return {
        success: true,
        message: `All other sessions terminated (${terminatedCount} sessions)`,
        count: terminatedCount
      };
    } catch (error) {
      throw new Error(`Failed to terminate all sessions: ${error.message}`);
    }
  }

  // ============================================
  // TWO-FACTOR AUTHENTICATION (2FA)
  // ============================================

  // Enable 2FA
  async enable2FA(userId) {
    try {
      // In production, generate TOTP secret
      const secret = 'GENERATED_TOTP_SECRET';
      
      await userRepository.update(userId, {
        'settings.twoFactorEnabled': true
      });

      return {
        success: true,
        message: 'Two-factor authentication enabled',
        data: {
          secret: secret,
          // In production, return QR code URL
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${secret}`
        }
      };
    } catch (error) {
      throw new Error(`Failed to enable 2FA: ${error.message}`);
    }
  }

  // Disable 2FA
  async disable2FA(userId) {
    try {
      await userRepository.update(userId, {
        'settings.twoFactorEnabled': false
      });

      return {
        success: true,
        message: 'Two-factor authentication disabled'
      };
    } catch (error) {
      throw new Error(`Failed to disable 2FA: ${error.message}`);
    }
  }

  // Verify 2FA
  async verify2FA(userId, code) {
    try {
      // In production, verify TOTP code
      const isValid = true;

      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      return {
        success: true,
        message: '2FA verification successful'
      };
    } catch (error) {
      throw new Error(`2FA verification failed: ${error.message}`);
    }
  }

  // ============================================
  // SECURITY EVENTS & LOGGING
  // ============================================

  // Log security event
  async logSecurityEvent(userId, eventType, details, ipAddress, userAgent) {
    try {
      // In production, store in audit_logs collection
      console.log(`🔐 Security Event: ${eventType} - User: ${userId} - IP: ${ipAddress}`);
      
      // Send notification for suspicious events
      if (['failed_login', 'suspicious_activity', 'password_changed'].includes(eventType)) {
        await notificationService.sendToUser(
          userId,
          '🔐 Security Alert',
          `Security event: ${eventType} detected.`,
          {
            type: 'security',
            action: 'security_alert',
            eventType: eventType,
            timestamp: new Date().toISOString()
          },
          ['in_app', 'push']
        );
      }

      return {
        success: true,
        message: 'Security event logged'
      };
    } catch (error) {
      console.error('Failed to log security event:', error.message);
      return {
        success: false,
        message: 'Failed to log security event'
      };
    }
  }
}

module.exports = new SecurityService();
