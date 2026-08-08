const otpRepository = require('../../repositories/otpRepository');
const emailService = require('../email/emailService');
const userRepository = require('../../repositories/userRepository');

class OTPService {
  constructor() {
    this.OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
    this.OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;

    // Phone to email mapping for testing
    // In production, this comes from the user's email in database
    this.phoneToEmail = {
      '+23275335034': 'moihai.sl@gmail.com',  // Your phone
      '+23232335034': 'moihai.sl@gmail.com',  // Your second phone
      // Add more test users here
    };
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateExpiry() {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.OTP_EXPIRY_MINUTES);
    return expiry.toISOString();
  }

  async getEmailForPhone(phoneNumber) {
    // First check the mapping
    if (this.phoneToEmail[phoneNumber]) {
      return this.phoneToEmail[phoneNumber];
    }

    // Then try to get from database
    try {
      const user = await userRepository.findByPhone(phoneNumber);
      if (user && user.email) {
        return user.email;
      }
    } catch (error) {
      // User not found
    }

    return null;
  }

  async generateOTP(phoneNumber, purpose = 'login') {
    try {
      const code = this.generateCode();
      const expiresAt = this.generateExpiry();
      
      // Get email for this phone number
      const email = await this.getEmailForPhone(phoneNumber);

      // Save OTP to database
      const otpData = {
        phoneNumber,
        code,
        purpose,
        expiresAt,
        isUsed: false,
        attempts: 0,
        maxAttempts: 5
      };
      
      const otp = await otpRepository.create(otpData);

      // Send OTP via email if email is available
      let emailSent = false;
      let emailError = null;

      if (email) {
        try {
          await emailService.sendOTPEmail(email, code, purpose, this.OTP_EXPIRY_MINUTES);
          emailSent = true;
          console.log(`📧 OTP sent via email to ${email}`);
        } catch (error) {
          emailError = error.message;
          console.error(`❌ Failed to send OTP email: ${error.message}`);
        }
      } else {
        console.log(`⚠️ No email found for phone: ${phoneNumber}`);
        console.log(`📱 Please add email mapping in phoneToEmail`);
      }

      // Log OTP for development
      console.log(`📱 OTP for ${phoneNumber}: ${code}`);
      if (email) {
        console.log(`📧 Email: ${email}`);
      }

      return {
        ...otp,
        emailSent: emailSent,
        email: email || null,
        emailError: emailError || null
      };
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
      
      if (otp.purpose !== purpose) {
        throw new Error(`OTP is for ${otp.purpose}, not ${purpose}`);
      }
      
      if (otp.isExpired()) {
        throw new Error('OTP has expired');
      }
      
      if (otp.isUsed) {
        throw new Error('OTP has already been used');
      }
      
      if (otp.attempts >= otp.maxAttempts) {
        throw new Error('Maximum attempts exceeded. Please request a new OTP.');
      }
      
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
