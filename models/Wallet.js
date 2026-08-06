/**
 * Wallet Model - Firestore Schema
 * Collection: wallets
 */
class Wallet {
  constructor(data) {
    this.walletId = data.walletId || null;
    this.userId = data.userId || null;
    this.balance = data.balance || 0;
    this.currency = data.currency || 'SLL';
    this.walletNumber = data.walletNumber || null;
    this.transactions = data.transactions || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastTransactionAt = data.lastTransactionAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      userId: this.userId,
      balance: this.balance,
      currency: this.currency,
      walletNumber: this.walletNumber,
      transactions: this.transactions,
      isActive: this.isActive,
      lastTransactionAt: this.lastTransactionAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Wallet({ ...data, walletId: doc.id });
  }
}

module.exports = Wallet;
