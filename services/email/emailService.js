/**
 * Email Service - Gmail Integration
 * Uses Gmail App Password for authentication
 */
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure Gmail transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'moihai.sl@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'buja tcrf zihc wryn',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    this.fromEmail = process.env.EMAIL_FROM || 'moihai.sl@gmail.com';
  }

  /**
   * Send OTP via email
   */
  async sendOTPEmail(to, otp, purpose = 'login', expiresIn = 5) {
    try {
      // Get user's name if available
      let userName = 'User';
      try {
        const userRepository = require('../../repositories/userRepository');
        const user = await userRepository.findByPhone(to);
        if (user && user.fullName) {
          userName = user.fullName;
        }
      } catch (error) {
        // Ignore - use default name
      }

      // Subject based on purpose
      const subjects = {
        login: '🔐 SierraPay - Login OTP',
        registration: '📱 SierraPay - Verify Your Account',
        password_reset: '🔑 SierraPay - Reset Your Password',
        verification: '✅ SierraPay - Verify Your Identity'
      };

      const subject = subjects[purpose] || 'SierraPay OTP';

      // HTML Email Template
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              letter-spacing: 2px;
            }
            .header .subtitle {
              margin: 8px 0 0;
              opacity: 0.8;
              font-size: 14px;
            }
            .body {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .otp-box {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border: 2px dashed #0f3460;
            }
            .otp-code {
              font-size: 48px;
              font-weight: bold;
              color: #0f3460;
              letter-spacing: 12px;
              font-family: 'Courier New', monospace;
            }
            .info {
              color: #666;
              font-size: 14px;
              line-height: 1.8;
              margin: 20px 0;
            }
            .expiry {
              color: #dc3545;
              font-weight: bold;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #888;
              font-size: 12px;
              border-top: 1px solid #eee;
            }
            .footer .team {
              font-weight: bold;
              color: #0f3460;
            }
            .divider {
              border: none;
              border-top: 1px solid #eee;
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏦 SierraPay</h1>
              <div class="subtitle">Secure • Fast • Reliable</div>
            </div>

            <div class="body">
              <div class="greeting">Hello <strong>${userName}</strong>,</div>

              <p class="info">
                Your SierraPay OTP verification code is:
              </p>

              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>

              <p class="info">
                This code is valid for <strong class="expiry">${expiresIn} minutes</strong>.
                <strong>Do not share this code with anyone.</strong>
              </p>

              <p class="info" style="color: #888; font-size: 13px;">
                If you did not request this, please ignore this email or contact our
                support team immediately.
              </p>

              <hr class="divider">

              <p style="text-align: center; color: #666; font-size: 14px;">
                <strong>Best regards,</strong><br>
                <span style="font-weight: bold; color: #0f3460;">UTech Support Team</span>
              </p>
            </div>

            <div class="footer">
              <p>
                <span class="team">SierraPay</span> — Secure Mobile Payments<br>
                © 2026 SierraPay. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Plain text version
      const text = `
        ${subject}
        ${'='.repeat(subject.length)}

        Hello ${userName},

        Your SierraPay OTP verification code is:

        ${otp}

        This code is valid for ${expiresIn} minutes. Do not share this code with anyone.

        If you did not request this, please ignore this email or contact our
        support team immediately.

        Best regards,
        UTech Support Team
      `;

      // Send email
      const mailOptions = {
        from: `"SierraPay" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent: ${info.messageId}`);
      console.log(`📧 To: ${to}`);
      console.log(`📧 OTP: ${otp}`);

      return {
        success: true,
        messageId: info.messageId,
        to: to,
        otp: otp
      };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
