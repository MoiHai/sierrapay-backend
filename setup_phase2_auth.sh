#!/bin/bash
# SierraPay Phase 2 - Authentication Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 2 - Authentication Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE MODELS
# ============================================
echo "📁 Creating models..."

# User.js
cat > models/User.js << 'EOF'
/**
 * User Model - Firestore Schema
 * Collection: users
 */
class User {
  constructor(data) {
    this.userId = data.userId || null;
    this.phoneNumber = data.phoneNumber || null;
    this.fullName = data.fullName || null;
    this.email = data.email || null;
    this.passwordHash = data.passwordHash || null;
    this.isVerified = data.isVerified || false;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.kycStatus = data.kycStatus || 'pending'; // pending | verified | rejected
    this.role = data.role || 'user'; // user | merchant | admin
    this.deviceIds = data.deviceIds || [];
    this.settings = {
      biometricEnabled: data.settings?.biometricEnabled || false,
      twoFactorEnabled: data.settings?.twoFactorEnabled || false,
      notificationsEnabled: data.settings?.notificationsEnabled !== undefined ? data.settings.notificationsEnabled : true
    };
    this.lastLoginAt = data.lastLoginAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      userId: this.userId,
      phoneNumber: this.phoneNumber,
      fullName: this.fullName,
      email: this.email,
      passwordHash: this.passwordHash,
      isVerified: this.isVerified,
      isActive: this.isActive,
      kycStatus: this.kycStatus,
      role: this.role,
      deviceIds: this.deviceIds,
      settings: this.settings,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User({ ...data, userId: doc.id });
  }
}

module.exports = User;
EOF
echo "✅ User.js created"

# OTP.js
cat > models/OTP.js << 'EOF'
/**
 * OTP Model - Firestore Schema
 * Collection: otp
 */
class OTP {
  constructor(data) {
    this.otpId = data.otpId || null;
    this.phoneNumber = data.phoneNumber || null;
    this.code = data.code || null;
    this.purpose = data.purpose || 'login'; // login | registration | password_reset | verification
    this.isUsed = data.isUsed || false;
    this.attempts = data.attempts || 0;
    this.maxAttempts = data.maxAttempts || 5;
    this.expiresAt = data.expiresAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  isValid() {
    return !this.isUsed && !this.isExpired();
  }

  toFirestore() {
    return {
      phoneNumber: this.phoneNumber,
      code: this.code,
      purpose: this.purpose,
      isUsed: this.isUsed,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new OTP({ ...data, otpId: doc.id });
  }
}

module.exports = OTP;
EOF
echo "✅ OTP.js created"

# Session.js
cat > models/Session.js << 'EOF'
/**
 * Session Model - Firestore Schema
 * Collection: sessions
 */
class Session {
  constructor(data) {
    this.sessionId = data.sessionId || null;
    this.userId = data.userId || null;
    this.deviceId = data.deviceId || null;
    this.refreshToken = data.refreshToken || null;
    this.accessToken = data.accessToken || null;
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.expiresAt = data.expiresAt || null;
    this.lastActivityAt = data.lastActivityAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  toFirestore() {
    return {
      userId: this.userId,
      deviceId: this.deviceId,
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      isActive: this.isActive,
      expiresAt: this.expiresAt,
      lastActivityAt: this.lastActivityAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Session({ ...data, sessionId: doc.id });
  }
}

module.exports = Session;
EOF
echo "✅ Session.js created"

# Device.js
cat > models/Device.js << 'EOF'
/**
 * Device Model - Firestore Schema
 * Collection: devices
 */
class Device {
  constructor(data) {
    this.deviceId = data.deviceId || null;
    this.userId = data.userId || null;
    this.deviceName = data.deviceName || null;
    this.deviceType = data.deviceType || null; // android | ios | web
    this.deviceModel = data.deviceModel || null;
    this.osVersion = data.osVersion || null;
    this.appVersion = data.appVersion || null;
    this.fcmToken = data.fcmToken || null;
    this.isTrusted = data.isTrusted || false;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastUsedAt = data.lastUsedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      userId: this.userId,
      deviceName: this.deviceName,
      deviceType: this.deviceType,
      deviceModel: this.deviceModel,
      osVersion: this.osVersion,
      appVersion: this.appVersion,
      fcmToken: this.fcmToken,
      isTrusted: this.isTrusted,
      isActive: this.isActive,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Device({ ...data, deviceId: doc.id });
  }
}

module.exports = Device;
EOF
echo "✅ Device.js created"

# ============================================
# 2. CREATE REPOSITORIES
# ============================================
echo ""
echo "📁 Creating repositories..."

# userRepository.js (already exists, updating)
cat > repositories/userRepository.js << 'EOF'
const { db } = require('../config/firebase');
const User = require('../models/User');

class UserRepository {
  constructor() {
    this.collection = db.collection('users');
  }

  async create(userData) {
    try {
      const user = new User(userData);
      const docRef = this.collection.doc();
      user.userId = docRef.id;
      await docRef.set(user.toFirestore());
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findByPhone(phoneNumber) {
    try {
      const snapshot = await this.collection
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return User.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async findById(userId) {
    try {
      const doc = await this.collection.doc(userId).get();
      if (!doc.exists) return null;
      return User.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async update(userId, data) {
    try {
      const user = await this.findById(userId);
      if (!user) throw new Error('User not found');
      
      const updates = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await this.collection.doc(userId).update(updates);
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async addDevice(userId, deviceId) {
    try {
      const user = await this.findById(userId);
      if (!user) throw new Error('User not found');
      
      if (!user.deviceIds.includes(deviceId)) {
        user.deviceIds.push(deviceId);
        await this.collection.doc(userId).update({
          deviceIds: user.deviceIds,
          updatedAt: new Date().toISOString()
        });
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to add device: ${error.message}`);
    }
  }

  async updateLastLogin(userId) {
    try {
      await this.collection.doc(userId).update({
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }
}

module.exports = new UserRepository();
EOF
echo "✅ userRepository.js updated"

# otpRepository.js
cat > repositories/otpRepository.js << 'EOF'
const { db } = require('../config/firebase');
const OTP = require('../models/OTP');

class OTPRepository {
  constructor() {
    this.collection = db.collection('otp');
  }

  async create(otpData) {
    try {
      const otp = new OTP(otpData);
      const docRef = this.collection.doc();
      otp.otpId = docRef.id;
      await docRef.set(otp.toFirestore());
      return otp;
    } catch (error) {
      throw new Error(`Failed to create OTP: ${error.message}`);
    }
  }

  async findByPhoneAndCode(phoneNumber, code) {
    try {
      const snapshot = await this.collection
        .where('phoneNumber', '==', phoneNumber)
        .where('code', '==', code)
        .where('isUsed', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return OTP.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Failed to find OTP: ${error.message}`);
    }
  }

  async markAsUsed(otpId) {
    try {
      await this.collection.doc(otpId).update({
        isUsed: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to mark OTP as used: ${error.message}`);
    }
  }

  async incrementAttempts(otpId) {
    try {
      const doc = await this.collection.doc(otpId).get();
      if (!doc.exists) throw new Error('OTP not found');
      
      const data = doc.data();
      const attempts = (data.attempts || 0) + 1;
      await this.collection.doc(otpId).update({
        attempts: attempts,
        updatedAt: new Date().toISOString()
      });
      return attempts;
    } catch (error) {
      throw new Error(`Failed to increment attempts: ${error.message}`);
    }
  }

  async deleteExpired() {
    try {
      const now = new Date().toISOString();
      const snapshot = await this.collection
        .where('expiresAt', '<', now)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to delete expired OTPs: ${error.message}`);
    }
  }
}

module.exports = new OTPRepository();
EOF
echo "✅ otpRepository.js created"

# sessionRepository.js
cat > repositories/sessionRepository.js << 'EOF'
const { db } = require('../config/firebase');
const Session = require('../models/Session');

class SessionRepository {
  constructor() {
    this.collection = db.collection('sessions');
  }

  async create(sessionData) {
    try {
      const session = new Session(sessionData);
      const docRef = this.collection.doc();
      session.sessionId = docRef.id;
      await docRef.set(session.toFirestore());
      return session;
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async findByRefreshToken(refreshToken) {
    try {
      const snapshot = await this.collection
        .where('refreshToken', '==', refreshToken)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return Session.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Failed to find session: ${error.message}`);
    }
  }

  async findActiveByUserId(userId) {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();
      
      return snapshot.docs.map(doc => Session.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Failed to find sessions: ${error.message}`);
    }
  }

  async invalidate(sessionId) {
    try {
      await this.collection.doc(sessionId).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to invalidate session: ${error.message}`);
    }
  }

  async invalidateAllForUser(userId) {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to invalidate sessions: ${error.message}`);
    }
  }

  async updateActivity(sessionId) {
    try {
      await this.collection.doc(sessionId).update({
        lastActivityAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }
  }
}

module.exports = new SessionRepository();
EOF
echo "✅ sessionRepository.js created"

# deviceRepository.js
cat > repositories/deviceRepository.js << 'EOF'
const { db } = require('../config/firebase');
const Device = require('../models/Device');

class DeviceRepository {
  constructor() {
    this.collection = db.collection('devices');
  }

  async create(deviceData) {
    try {
      const device = new Device(deviceData);
      const docRef = this.collection.doc();
      device.deviceId = docRef.id;
      await docRef.set(device.toFirestore());
      return device;
    } catch (error) {
      throw new Error(`Failed to create device: ${error.message}`);
    }
  }

  async findByDeviceId(deviceId) {
    try {
      const doc = await this.collection.doc(deviceId).get();
      if (!doc.exists) return null;
      return Device.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Failed to find device: ${error.message}`);
    }
  }

  async findActiveByUserId(userId) {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();
      
      return snapshot.docs.map(doc => Device.fromFirestore(doc));
    } catch (error) {
      throw new Error(`Failed to find devices: ${error.message}`);
    }
  }

  async updateTrusted(deviceId, isTrusted) {
    try {
      await this.collection.doc(deviceId).update({
        isTrusted: isTrusted,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update trusted status: ${error.message}`);
    }
  }

  async updateFCMToken(deviceId, fcmToken) {
    try {
      await this.collection.doc(deviceId).update({
        fcmToken: fcmToken,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update FCM token: ${error.message}`);
    }
  }

  async updateLastUsed(deviceId) {
    try {
      await this.collection.doc(deviceId).update({
        lastUsedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update last used: ${error.message}`);
    }
  }

  async revoke(deviceId) {
    try {
      await this.collection.doc(deviceId).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to revoke device: ${error.message}`);
    }
  }

  async findOrCreate(deviceData) {
    try {
      // Check if device exists
      let device = await this.findByDeviceId(deviceData.deviceId);
      if (device) {
        // Update existing device
        await this.collection.doc(deviceData.deviceId).update({
          ...deviceData,
          lastUsedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return await this.findByDeviceId(deviceData.deviceId);
      }
      // Create new device
      return await this.create(deviceData);
    } catch (error) {
      throw new Error(`Failed to find or create device: ${error.message}`);
    }
  }
}

module.exports = new DeviceRepository();
EOF
echo "✅ deviceRepository.js created"

# ============================================
# 3. CREATE SERVICES
# ============================================
echo ""
echo "📁 Creating services..."

# services/otp/otpService.js
mkdir -p services/otp
cat > services/otp/otpService.js << 'EOF'
const crypto = require('crypto');
const otpRepository = require('../../repositories/otpRepository');

class OTPService {
  constructor() {
    this.OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
    this.OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
  }

  generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  generateExpiry() {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.OTP_EXPIRY_MINUTES);
    return expiry.toISOString();
  }

  async generateOTP(phoneNumber, purpose = 'login') {
    try {
      const code = this.generateCode();
      const expiresAt = this.generateExpiry();
      
      const otpData = {
        phoneNumber,
        code,
        purpose,
        expiresAt,
        isUsed: false,
        attempts: 0
      };
      
      return await otpRepository.create(otpData);
    } catch (error) {
      throw new Error(`Failed to generate OTP: ${error.message}`);
    }
  }

  async verifyOTP(phoneNumber, code) {
    try {
      const otp = await otpRepository.findByPhoneAndCode(phoneNumber, code);
      
      if (!otp) {
        throw new Error('Invalid OTP');
      }
      
      if (otp.isExpired()) {
        throw new Error('OTP has expired');
      }
      
      if (otp.isUsed) {
        throw new Error('OTP has already been used');
      }
      
      // Check attempts
      if (otp.attempts >= otp.maxAttempts) {
        throw new Error('Maximum attempts exceeded. Please request a new OTP.');
      }
      
      // Mark as used
      await otpRepository.markAsUsed(otp.otpId);
      
      return { valid: true, purpose: otp.purpose };
    } catch (error) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

  async resendOTP(phoneNumber, purpose = 'login') {
    try {
      return await this.generateOTP(phoneNumber, purpose);
    } catch (error) {
      throw new Error(`Failed to resend OTP: ${error.message}`);
    }
  }

  async cleanupExpired() {
    try {
      const count = await otpRepository.deleteExpired();
      return { cleaned: count };
    } catch (error) {
      throw new Error(`Failed to cleanup OTPs: ${error.message}`);
    }
  }
}

module.exports = new OTPService();
EOF
echo "✅ services/otp/otpService.js created"

# services/token/tokenService.js
mkdir -p services/token
cat > services/token/tokenService.js << 'EOF'
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET, JWT_EXPIRY, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY } = require('../../config/jwt');

class TokenService {
  generateAccessToken(payload) {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    } catch (error) {
      throw new Error(`Failed to generate access token: ${error.message}`);
    }
  }

  generateRefreshToken() {
    try {
      return crypto.randomBytes(64).toString('hex');
    } catch (error) {
      throw new Error(`Failed to generate refresh token: ${error.message}`);
    }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      }
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  verifyRefreshToken(token, storedToken) {
    if (token !== storedToken) {
      throw new Error('Invalid refresh token');
    }
    // No JWT verification needed for random token
    return true;
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  generateTokenPair(userId, deviceId) {
    const payload = { userId, deviceId };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken();
    return { accessToken, refreshToken };
  }
}

module.exports = new TokenService();
EOF
echo "✅ services/token/tokenService.js created"

# services/auth/authService.js
mkdir -p services/auth
cat > services/auth/authService.js << 'EOF'
const userRepository = require('../../repositories/userRepository');
const sessionRepository = require('../../repositories/sessionRepository');
const deviceRepository = require('../../repositories/deviceRepository');
const otpService = require('../otp/otpService');
const tokenService = require('../token/tokenService');

class AuthService {
  async register(phoneNumber, deviceData) {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByPhone(phoneNumber);
      if (existingUser) {
        throw new Error('User already exists with this phone number');
      }

      // Generate OTP
      await otpService.generateOTP(phoneNumber, 'registration');

      // Return success (user will complete registration after OTP verification)
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
      // Verify OTP
      const verification = await otpService.verifyOTP(phoneNumber, code);
      if (!verification.valid || verification.purpose !== 'registration') {
        throw new Error('Invalid registration verification');
      }

      // Create user
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
      // Find user
      const user = await userRepository.findByPhone(phoneNumber);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify OTP
      const verification = await otpService.verifyOTP(phoneNumber, code);
      if (!verification.valid || verification.purpose !== 'login') {
        throw new Error('Invalid login verification');
      }

      // Find or create device
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

      // Generate tokens
      const { accessToken, refreshToken } = tokenService.generateTokenPair(
        user.userId,
        device.deviceId
      );

      // Create session
      const session = await sessionRepository.create({
        userId: user.userId,
        deviceId: device.deviceId,
        refreshToken: refreshToken,
        accessToken: accessToken,
        ipAddress: deviceData.ipAddress,
        userAgent: deviceData.userAgent
      });

      // Update user last login
      await userRepository.updateLastLogin(user.userId);

      // Update device last used
      await deviceRepository.updateLastUsed(device.deviceId);

      // Add device to user's device list
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
      // Find session
      const session = await sessionRepository.findByRefreshToken(refreshToken);
      if (!session) {
        throw new Error('Invalid refresh token');
      }

      // Verify device matches
      if (session.deviceId !== deviceId) {
        throw new Error('Device mismatch');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = tokenService.generateTokenPair(
        session.userId,
        deviceId
      );

      // Create new session and invalidate old one
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

  async logout(accessToken, refreshToken) {
    try {
      // Find session by refresh token
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
      // Verify device belongs to user
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
      // Verify device belongs to user
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
EOF
echo "✅ services/auth/authService.js created"

# ============================================
# 4. CREATE VALIDATORS
# ============================================
echo ""
echo "📁 Creating validators..."

# authValidator.js
cat > validators/authValidator.js << 'EOF'
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg
  }));
  
  return res.status(400).json({
    error: 'Validation failed',
    errors: extractedErrors
  });
};

const registerValidation = [
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email address'),
  validate
];

const loginValidation = [
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  body('code')
    .notEmpty().withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP code must be 6 digits')
    .isNumeric().withMessage('OTP code must be numeric'),
  validate
];

const otpRequestValidation = [
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  body('purpose')
    .optional()
    .isIn(['login', 'registration', 'password_reset', 'verification']).withMessage('Invalid purpose'),
  validate
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
  body('deviceId')
    .notEmpty().withMessage('Device ID is required'),
  validate
];

const logoutValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
  validate
];

const deviceValidation = [
  body('deviceId')
    .notEmpty().withMessage('Device ID is required'),
  body('deviceName')
    .optional()
    .isString().withMessage('Device name must be a string'),
  body('deviceType')
    .optional()
    .isIn(['android', 'ios', 'web']).withMessage('Invalid device type'),
  validate
];

const trustDeviceValidation = [
  body('deviceId')
    .notEmpty().withMessage('Device ID is required'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  otpRequestValidation,
  refreshTokenValidation,
  logoutValidation,
  deviceValidation,
  trustDeviceValidation
};
EOF
echo "✅ validators/authValidator.js created"

# ============================================
# 5. CREATE MIDDLEWARE
# ============================================
echo ""
echo "📁 Creating middleware..."

# authMiddleware.js
cat > middleware/authMiddleware.js << 'EOF'
const tokenService = require('../services/token/tokenService');
const userRepository = require('../repositories/userRepository');
const sessionRepository = require('../repositories/sessionRepository');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = tokenService.verifyAccessToken(token);
    
    // Check if user exists
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account is deactivated'
      });
    }

    // Attach user and device to request
    req.user = user;
    req.deviceId = decoded.deviceId;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.message === 'Access token expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = tokenService.verifyAccessToken(token);
      const user = await userRepository.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.deviceId = decoded.deviceId;
      }
    }
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

const sessionAuthMiddleware = async (req, res, next) => {
  try {
    await authMiddleware(req, res, async () => {
      // Check if session is active
      const sessions = await sessionRepository.findActiveByUserId(req.user.userId);
      const activeSession = sessions.find(s => s.deviceId === req.deviceId);
      
      if (!activeSession) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session invalid or expired'
        });
      }
      
      req.session = activeSession;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
};

const trustedDeviceMiddleware = async (req, res, next) => {
  try {
    await authMiddleware(req, res, async () => {
      // Check if device is trusted
      const device = await deviceRepository.findByDeviceId(req.deviceId);
      if (!device || !device.isTrusted) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Device not trusted. Please verify your device first.'
        });
      }
      
      req.device = device;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  sessionAuthMiddleware,
  trustedDeviceMiddleware
};
EOF
echo "✅ middleware/authMiddleware.js created"

# ============================================
# 6. CREATE CONTROLLERS
# ============================================
echo ""
echo "📁 Creating controllers..."

# authController.js
cat > controllers/authController.js << 'EOF'
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
          expiresIn: parseInt(process.env.OTP_EXPIRY_MINUTES) * 60, // seconds
          // In development, include the code for testing
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
      
      const result = await authService.verifyRegistration(
        phoneNumber,
        code,
        { fullName, email }
      );
      
      // Generate tokens for auto-login after registration
      const deviceData = {
        deviceId: req.body.deviceId || 'temp_device',
        deviceName: req.body.deviceName || 'Unknown Device',
        deviceType: req.body.deviceType || 'web',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      };
      
      const loginResult = await authService.login(phoneNumber, code, deviceData);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: loginResult.user,
          device: loginResult.device,
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
          isTrusted: loginResult.isTrusted
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
      
      const result = await authService.logout(req.user.userId, refreshToken);
      
      res.status(200).json({
        success: true,
        message: result.message
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
EOF
echo "✅ controllers/authController.js created"

# ============================================
# 7. CREATE ROUTES
# ============================================
echo ""
echo "📁 Creating routes..."

# authRoutes.js
cat > routes/authRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  authMiddleware,
  sessionAuthMiddleware,
  trustedDeviceMiddleware 
} = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  otpRequestValidation,
  refreshTokenValidation,
  logoutValidation,
  trustDeviceValidation
} = require('../validators/authValidator');

// Public routes
router.post('/otp/send', otpRequestValidation, authController.sendOTP.bind(authController));
router.post('/register', registerValidation, authController.register.bind(authController));
router.post('/login', loginValidation, authController.login.bind(authController));
router.post('/refresh', refreshTokenValidation, authController.refreshToken.bind(authController));

// Protected routes (require authentication)
router.use(authMiddleware);
router.use(sessionAuthMiddleware);

router.post('/logout', logoutValidation, authController.logout.bind(authController));
router.post('/logout-all', authController.logoutAll.bind(authController));
router.get('/me', authController.getCurrentUser.bind(authController));
router.get('/devices', authController.getDevices.bind(authController));

// Routes that require trusted device
router.post('/devices/trust', trustDeviceValidation, authController.trustDevice.bind(authController));
router.delete('/devices/:deviceId', authController.revokeDevice.bind(authController));

module.exports = router;
EOF
echo "✅ routes/authRoutes.js created"

# ============================================
# 8. UPDATE APP.JS TO INCLUDE AUTH ROUTES
# ============================================
echo ""
echo "📁 Updating app.js..."

# Check if app.js exists and update it
if [ -f "app.js" ]; then
  # Backup original app.js
  cp app.js app.js.backup
  echo "✅ app.js backed up to app.js.backup"
fi

# Create or update app.js with auth routes
cat > app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { ENVIRONMENT, isProduction } = require('./config/environment');
const { initializeFirebase, checkFirebaseHealth } = require('./config/firebase');

// Simple logger
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  debug: (msg) => console.debug(`[DEBUG] ${msg}`)
};

try {
  initializeFirebase();
  logger.info('✅ Firebase initialized successfully');
} catch (error) {
  logger.error(`❌ Firebase initialization failed: ${error.message}`);
  if (!isProduction) {
    logger.warn('⚠️ Continuing without Firebase for development');
  } else {
    throw error;
  }
}

const app = express();

// ============================================
// Health check endpoints (BEFORE any middleware)
// ============================================

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    service: 'SierraPay Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    const dbHealth = await checkFirebaseHealth();
    res.status(dbHealth.connected ? 200 : 503).json({
      status: dbHealth.connected ? 'ready' : 'not ready',
      service: 'SierraPay Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SierraPay Backend',
    version: '1.0.0',
    environment: ENVIRONMENT.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SierraPay Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      ready: '/health/ready',
      live: '/health/live',
      auth: '/api/v1/auth'
    }
  });
});

// ============================================
// Security Middleware
// ============================================

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ============================================
// Logging Middleware
// ============================================

if (!isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// Body Parsing Middleware
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ============================================
// Static Files
// ============================================

app.use('/uploads', express.static('uploads'));

// ============================================
// API Routes
// ============================================

// Auth routes
app.use('/api/v1/auth', require('./routes/authRoutes'));

// ============================================
// 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

// ============================================
// Global Error Handler
// ============================================

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  if (err.stack) {
    logger.error(`Stack: ${err.stack}`);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

module.exports = app;
EOF
echo "✅ app.js updated with auth routes"

# ============================================
# 9. UPDATE CONFIG (if needed)
# ============================================
echo ""
echo "📁 Updating config..."

# Ensure environment.js has all needed variables
echo "Checking .env file..."
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
FIREBASE_PROJECT_ID=sierrapay-3899d
FIREBASE_EMULATOR=false
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_secret_change_this_in_production
JWT_REFRESH_EXPIRY=30d
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
CORS_ORIGIN=http://localhost:3000,https://sierrapay.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF
  echo "✅ .env file created"
else
  echo "✅ .env file already exists"
fi

# ============================================
# 10. COMPLETION MESSAGE
# ============================================
echo ""
echo "============================================"
echo "  ✅ PHASE 2 - AUTHENTICATION COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created:"
echo "  Models: User.js, OTP.js, Session.js, Device.js"
echo "  Repositories: userRepository.js, otpRepository.js, sessionRepository.js, deviceRepository.js"
echo "  Services: otpService.js, tokenService.js, authService.js"
echo "  Validators: authValidator.js"
echo "  Middleware: authMiddleware.js"
echo "  Controllers: authController.js"
echo "  Routes: authRoutes.js"
echo ""
echo "🔑 API Endpoints Added:"
echo "  POST   /api/v1/auth/otp/send        - Send OTP"
echo "  POST   /api/v1/auth/register        - Register new user"
echo "  POST   /api/v1/auth/login           - Login with OTP"
echo "  POST   /api/v1/auth/refresh         - Refresh access token"
echo "  POST   /api/v1/auth/logout          - Logout"
echo "  POST   /api/v1/auth/logout-all      - Logout from all devices"
echo "  GET    /api/v1/auth/me              - Get current user"
echo "  GET    /api/v1/auth/devices         - Get user's devices"
echo "  POST   /api/v1/auth/devices/trust   - Trust a device"
echo "  DELETE /api/v1/auth/devices/:id     - Revoke a device"
echo ""
echo "📋 Next Steps:"
echo "  1. Update .env with your actual JWT_SECRET"
echo "  2. Run: npm install express-validator (if not installed)"
echo "  3. Test: npm run dev"
echo "  4. Test endpoints with Postman or curl"
echo ""
echo "============================================"