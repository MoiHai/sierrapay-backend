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
    this.isVerified = data.isVerified !== undefined ? data.isVerified : true;
    this.isActive = data.isActive !== undefined ? data.isActive : true; // Default to true
    this.kycStatus = data.kycStatus || 'pending';
    this.role = data.role || 'user';
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
