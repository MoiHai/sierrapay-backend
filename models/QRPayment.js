/**
 * QR Payment Model - Firestore Schema
 * Collection: qr_payments
 */
class QRPayment {
  constructor(data) {
    this.qrId = data.qrId || null;
    this.userId = data.userId || null;
    this.walletId = data.walletId || null;
    this.qrCode = data.qrCode || null;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'SLL';
    this.type = data.type || 'generate'; // generate | scan
    this.status = data.status || 'pending'; // pending | paid | cancelled | expired
    this.description = data.description || '';
    this.scannerId = data.scannerId || null;
    this.scannerWalletId = data.scannerWalletId || null;
    this.transactionId = data.transactionId || null;
    this.expiresAt = data.expiresAt || null;
    this.scannedAt = data.scannedAt || null;
    this.completedAt = data.completedAt || null;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  isPending() {
    return this.status === 'pending';
  }

  isPaid() {
    return this.status === 'paid';
  }

  toFirestore() {
    return {
      userId: this.userId,
      walletId: this.walletId,
      qrCode: this.qrCode,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      description: this.description,
      scannerId: this.scannerId,
      scannerWalletId: this.scannerWalletId,
      transactionId: this.transactionId,
      expiresAt: this.expiresAt,
      scannedAt: this.scannedAt,
      completedAt: this.completedAt,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new QRPayment({ ...data, qrId: doc.id });
  }
}

module.exports = QRPayment;
