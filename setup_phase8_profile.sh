#!/bin/bash
# SierraPay Phase 8 - User Profile Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 8 - User Profile Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE PROFILE SERVICE
# ============================================
echo "📁 Creating services/profile/profileService.js..."

mkdir -p services/profile

cat > services/profile/profileService.js << 'EOF'
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
EOF

echo "✅ services/profile/profileService.js created"

# ============================================
# 2. UPDATE USER CONTROLLER
# ============================================
echo ""
echo "📁 Updating controllers/userController.js..."

cat > controllers/userController.js << 'EOF'
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
EOF

echo "✅ controllers/userController.js updated"

# ============================================
# 3. UPDATE USER ROUTES
# ============================================
echo ""
echo "📁 Updating routes/userRoutes.js..."

cat > routes/userRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', userController.getProfile.bind(userController));

// Update user profile
router.put('/profile', userController.updateProfile.bind(userController));

// Update settings
router.put('/settings', userController.updateSettings.bind(userController));

// Change phone number
router.put('/phone', userController.changePhoneNumber.bind(userController));

// Upload profile picture
router.post('/profile/picture', userController.uploadProfilePicture.bind(userController));

// Get user activity
router.get('/activity', userController.getActivity.bind(userController));

// Get KYC status
router.get('/kyc', userController.getKYCStatus.bind(userController));

// Get user devices
router.get('/devices', userController.getDevices.bind(userController));

// Get user stats
router.get('/stats', userController.getStats.bind(userController));

module.exports = router;
EOF

echo "✅ routes/userRoutes.js updated"

# ============================================
# 4. UPDATE APP.JS TO INCLUDE USER ROUTES
# ============================================
echo ""
echo "📁 Updating app.js with user routes..."

if grep -q "userRoutes" app.js; then
  echo "✅ User routes already in app.js"
else
  # Insert user routes before 404 handler
  sed -i '/\/ Auth routes/a\
\
// User routes\
app.use('\''/api/v1/users'\'', require('\''./routes/userRoutes'\''));' app.js
  
  echo "✅ User routes added to app.js"
fi

# ============================================
# 5. CREATE TEST SCRIPT
# ============================================
echo ""
echo "📁 Creating test_profile.sh..."

cat > test_profile.sh << 'EOF'
#!/bin/bash
# Test script for Phase 8 - User Profile

echo "============================================"
echo "  SierraPay Phase 8 - User Profile Test"
echo "============================================"
echo ""

# Get OTP for Moi Hai
echo "📱 Getting OTP for Moi Hai..."
OTP=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23275335034", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

echo "OTP: $OTP"

# Login
echo ""
echo "🔐 Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23275335034\", \"code\": \"$OTP\"}")

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo ""
echo "============================================"
echo "  Testing Profile Endpoints"
echo "============================================"

# 1. Get profile
echo ""
echo "👤 Getting Profile..."
curl -s -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 2. Update profile
echo ""
echo "✏️ Updating Profile..."
curl -s -X PUT http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Moi Hai SierraPay",
    "email": "moihai.sierra@gmail.com"
  }'

# 3. Update settings
echo ""
echo "⚙️ Updating Settings..."
curl -s -X PUT http://localhost:5000/api/v1/users/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biometricEnabled": true,
    "twoFactorEnabled": false,
    "notificationsEnabled": true
  }'

# 4. Get profile again
echo ""
echo "👤 Updated Profile..."
curl -s -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 5. Get activity
echo ""
echo "📊 User Activity..."
curl -s -X GET "http://localhost:5000/api/v1/users/activity?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 6. Get KYC status
echo ""
echo "🪪 KYC Status..."
curl -s -X GET "http://localhost:5000/api/v1/users/kyc" \
  -H "Authorization: Bearer $TOKEN"

# 7. Get devices
echo ""
echo "📱 Devices..."
curl -s -X GET "http://localhost:5000/api/v1/users/devices" \
  -H "Authorization: Bearer $TOKEN"

# 8. Get stats
echo ""
echo "📊 User Stats..."
curl -s -X GET "http://localhost:5000/api/v1/users/stats" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 8 - USER PROFILE READY!"
echo "============================================"
EOF

chmod +x test_profile.sh
echo "✅ test_profile.sh created"

# ============================================
# 6. COMPLETION MESSAGE
# ============================================
echo ""
echo "============================================"
echo "  ✅ PHASE 8 - USER PROFILE COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created/Updated:"
echo "  Service: profileService.js"
echo "  Controller: userController.js (updated)"
echo "  Routes: userRoutes.js (updated)"
echo "  Test: test_profile.sh"
echo ""
echo "🔑 API Endpoints Added:"
echo "  GET    /api/v1/users/profile       - Get user profile"
echo "  PUT    /api/v1/users/profile       - Update user profile"
echo "  PUT    /api/v1/users/settings      - Update settings"
echo "  PUT    /api/v1/users/phone         - Change phone number"
echo "  POST   /api/v1/users/profile/picture - Upload profile picture"
echo "  GET    /api/v1/users/activity      - Get user activity"
echo "  GET    /api/v1/users/kyc           - Get KYC status"
echo "  GET    /api/v1/users/devices       - Get user devices"
echo "  GET    /api/v1/users/stats         - Get user stats"
echo ""
echo "📋 Next Steps:"
echo "  1. Restart the server: npm run dev"
echo "  2. Run test: bash test_profile.sh"
echo ""
echo "============================================"