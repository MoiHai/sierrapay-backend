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
