const otpRepository = require('../../repositories/otpRepository');

class OTPService {
  constructor() {
    this.OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
    this.OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
        attempts: 0,
        maxAttempts: 5
      };
      
      return await otpRepository.create(otpData);
    } catch (error) {
      throw new Error(`Failed to generate OTP: ${error.message}`);
    }
  }

  async verifyOTP(phoneNumber, code, purpose = 'login') {
    try {
      const otp = await otpRepository.findByPhoneAndCode(phoneNumber, code);
      
      if (!otp) {
        throw new Error('Invalid OTP');
      }
      
      // Check if OTP is for the right purpose
      if (otp.purpose !== purpose) {
        throw new Error(`OTP is for ${otp.purpose}, not ${purpose}`);
      }
      
      // Check if expired (using the enhanced method)
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
      await otpRepository.markAsUsed(otp.id || otp.otpId);
      
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
