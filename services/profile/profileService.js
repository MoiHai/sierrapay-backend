const userRepository = require('../../repositories/userRepository');
const walletRepository = require('../../repositories/walletRepository');
const transactionRepository = require('../../repositories/transactionRepository');
const notificationRepository = require('../../repositories/notificationRepository');
const deviceRepository = require('../../repositories/deviceRepository');

class ProfileService {
  // Get user profile with full details
  async getProfile(userId) {
    try {
      // Get user
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get wallet
      const wallet = await walletRepository.findByUserId(userId);

      // Get stats
      const stats = await transactionRepository.getStats(userId);

      // Get device count
      const devices = await deviceRepository.findActiveByUserId(userId);

      // Get notification count
      const unreadCount = await notificationRepository.getUnreadCount(userId);

      // Build profile response
      return {
        user: {
          id: user.id || user.userId,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          email: user.email,
          isVerified: user.isVerified !== false,
          isActive: user.isActive !== false,
          kycStatus: user.kycStatus || 'pending',
          role: user.role || 'user',
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          settings: user.settings || {
            biometricEnabled: false,
            twoFactorEnabled: false,
            notificationsEnabled: true
          }
        },
        wallet: wallet ? {
          id: wallet.id || wallet.walletId,
          balance: wallet.balance || 0,
          currency: wallet.currency || 'SLL',
          walletNumber: wallet.walletNumber
        } : null,
        stats: {
          totalSent: stats.totalSent || 0,
          totalReceived: stats.totalReceived || 0,
          transactionCount: stats.transactionCount || 0,
          netBalance: stats.netBalance || 0
        },
        devices: {
          count: devices ? devices.length : 0,
          devices: devices || []
        },
        notifications: {
          unreadCount: unreadCount || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      // Get user
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Allowed fields to update
      const allowedFields = ['fullName', 'email', 'settings'];
      const updates = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      // Special handling for settings
      if (updateData.settings) {
        updates.settings = {
          ...user.settings,
          ...updateData.settings
        };
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Update user
      const updatedUser = await userRepository.update(userId, updates);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id || updatedUser.userId,
          phoneNumber: updatedUser.phoneNumber,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          isVerified: updatedUser.isVerified !== false,
          isActive: updatedUser.isActive !== false,
          kycStatus: updatedUser.kycStatus || 'pending',
          role: updatedUser.role || 'user',
          settings: updatedUser.settings || {
            biometricEnabled: false,
            twoFactorEnabled: false,
            notificationsEnabled: true
          },
          updatedAt: updatedUser.updatedAt
        }
      };
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  // Update settings only
  async updateSettings(userId, settings) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedSettings = {
        ...user.settings,
        ...settings
      };

      const updatedUser = await userRepository.update(userId, {
        settings: updatedSettings
      });

      return {
        success: true,
        message: 'Settings updated successfully',
        settings: updatedUser.settings
      };
    } catch (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  // Change phone number (requires verification)
  async changePhoneNumber(userId, newPhoneNumber, otpCode) {
    try {
      // Check if user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if new phone already in use
      const existingUser = await userRepository.findByPhone(newPhoneNumber);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Phone number already in use');
      }

      // In production, verify OTP here
      // const otpVerification = await otpService.verifyOTP(newPhoneNumber, otpCode);
      // if (!otpVerification.valid) {
      //   throw new Error('Invalid OTP');
      // }

      // Update phone number
      const updatedUser = await userRepository.update(userId, {
        phoneNumber: newPhoneNumber
      });

      return {
        success: true,
        message: 'Phone number updated successfully',
        phoneNumber: updatedUser.phoneNumber
      };
    } catch (error) {
      throw new Error(`Failed to change phone number: ${error.message}`);
    }
  }

  // Upload profile picture
  async uploadProfilePicture(userId, fileData) {
    try {
      // In production, this would upload to Firebase Storage
      // For now, simulate upload
      const imageUrl = `https://sierrapay-backend.onrender.com/uploads/profile/${userId}.jpg`;

      const updatedUser = await userRepository.update(userId, {
        profileImage: imageUrl
      });

      return {
        success: true,
        message: 'Profile picture uploaded successfully',
        imageUrl: imageUrl
      };
    } catch (error) {
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }
  }

  // Get user activity (recent transactions, etc.)
  async getActivity(userId, limit = 10) {
    try {
      // Get recent transactions
      const transactions = await transactionRepository.findByUserId(userId, limit);

      return {
        success: true,
        data: {
          transactions: transactions || [],
          count: transactions ? transactions.length : 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get activity: ${error.message}`);
    }
  }

  // Get KYC status
  async getKYCStatus(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        kycStatus: user.kycStatus || 'pending',
        isVerified: user.isVerified || false,
        message: user.kycStatus === 'verified' 
          ? 'KYC verification complete' 
          : user.kycStatus === 'pending' 
            ? 'KYC verification pending' 
            : 'KYC verification rejected'
      };
    } catch (error) {
      throw new Error(`Failed to get KYC status: ${error.message}`);
    }
  }

  // Get user's devices
  async getDevices(userId) {
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
}

module.exports = new ProfileService();
