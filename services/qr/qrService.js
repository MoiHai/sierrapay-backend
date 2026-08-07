const crypto = require('crypto');
const qrRepository = require('../../repositories/qrRepository');
const walletRepository = require('../../repositories/walletRepository');
const userRepository = require('../../repositories/userRepository');
const paymentService = require('../payment/paymentService');

// Get Firestore instance
const { getFirestore } = require('../../config/firebase');

class QRService {
  // Generate QR code for payment
  async generateQR(userId, amount, description = '') {
    try {
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Get user's wallet
      const wallet = await walletRepository.findByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check if user has sufficient balance
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Generate unique QR code
      const qrCode = this.generateQrCode();
      
      // Set expiry to 5 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // Create QR payment record
      const qrData = {
        userId: userId,
        walletId: wallet.id,
        qrCode: qrCode,
        amount: amount,
        currency: 'SLL',
        type: 'generate',
        status: 'pending',
        description: description || `QR Payment of ${amount} SLL`,
        expiresAt: expiresAt.toISOString(),
        metadata: {
          generatedAt: new Date().toISOString()
        }
      };

      const qrPayment = await qrRepository.create(qrData);

      return {
        qrId: qrPayment.id,
        qrCode: qrPayment.qrCode,
        amount: qrPayment.amount,
        currency: qrPayment.currency,
        description: qrPayment.description,
        expiresAt: qrPayment.expiresAt,
        status: qrPayment.status,
        expiresIn: Math.floor((new Date(qrPayment.expiresAt) - new Date()) / 1000)
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  // Scan QR code and process payment
  async scanQR(scannerId, qrCode, amount) {
    try {
      // Get QR payment
      const qrPayment = await qrRepository.findByQrCode(qrCode);
      
      if (!qrPayment) {
        throw new Error('Invalid QR code');
      }

      // Check if QR is expired
      if (new Date() > new Date(qrPayment.expiresAt)) {
        await qrRepository.markAsExpired(qrPayment.id);
        throw new Error('QR code has expired');
      }

      // Check if QR is already paid
      if (qrPayment.status === 'paid') {
        throw new Error('QR code has already been used');
      }

      // Check if QR is pending
      if (qrPayment.status !== 'pending') {
        throw new Error('QR code is not available');
      }

      // Get scanner's wallet
      const scannerWallet = await walletRepository.findByUserId(scannerId);
      if (!scannerWallet) {
        throw new Error('Scanner wallet not found');
      }

      // Get QR owner's info
      const qrOwner = await userRepository.findById(qrPayment.userId);
      if (!qrOwner) {
        throw new Error('QR owner not found');
      }

      // Use the amount from QR or specified amount
      const paymentAmount = amount || qrPayment.amount;

      // Process payment using payment service
      const result = await paymentService.sendMoney(
        scannerId,
        qrOwner.phoneNumber,
        paymentAmount,
        qrPayment.description || 'QR Code Payment'
      );

      // Mark QR as paid
      await qrRepository.markAsPaid(
        qrPayment.id,
        result.transactionId,
        scannerId,
        scannerWallet.id
      );

      return {
        success: true,
        qrId: qrPayment.id,
        transactionId: result.transactionId,
        amount: paymentAmount,
        currency: qrPayment.currency,
        merchantName: qrOwner.fullName || qrOwner.phoneNumber,
        merchantId: qrPayment.userId,
        description: qrPayment.description,
        reference: result.reference,
        senderBalance: result.senderBalance,
        receiverBalance: result.receiverBalance,
        completedAt: result.completedAt
      };
    } catch (error) {
      throw new Error(`Failed to scan QR code: ${error.message}`);
    }
  }

  // Get QR payment details
  async getQRPayment(qrId, userId) {
    try {
      const qrPayment = await qrRepository.findById(qrId);
      
      if (!qrPayment) {
        throw new Error('QR payment not found');
      }

      // Check if user is authorized (owner or scanner)
      if (qrPayment.userId !== userId && qrPayment.scannerId !== userId) {
        throw new Error('Unauthorized to view this QR payment');
      }

      return qrPayment;
    } catch (error) {
      throw new Error(`Failed to get QR payment: ${error.message}`);
    }
  }

  // Get user's QR payment history
  async getQRHistory(userId, limit = 20) {
    try {
      return await qrRepository.findByUserId(userId, limit);
    } catch (error) {
      throw new Error(`Failed to get QR history: ${error.message}`);
    }
  }

  // Cancel QR payment
  async cancelQR(qrId, userId) {
    try {
      const qrPayment = await qrRepository.findById(qrId);
      
      if (!qrPayment) {
        throw new Error('QR payment not found');
      }

      // Check if user is owner
      if (qrPayment.userId !== userId) {
        throw new Error('Unauthorized to cancel this QR payment');
      }

      // Check if QR is still pending
      if (qrPayment.status !== 'pending') {
        throw new Error(`Cannot cancel QR payment with status: ${qrPayment.status}`);
      }

      await qrRepository.updateStatus(qrId, 'cancelled');
      return { success: true, message: 'QR payment cancelled successfully' };
    } catch (error) {
      throw new Error(`Failed to cancel QR payment: ${error.message}`);
    }
  }

  // Generate unique QR code
  generateQrCode() {
    const prefix = 'QR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    const checksum = crypto.createHash('md5').update(prefix + timestamp + random).digest('hex').substring(0, 4).toUpperCase();
    return `${prefix}${timestamp}${random}${checksum}`;
  }
}

module.exports = new QRService();
