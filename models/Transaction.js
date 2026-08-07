/**
 * Transaction Model - Firestore Schema
 * Collection: transactions
 */
class Transaction {
  constructor(data) {
    this.transactionId = data.transactionId || null;
    this.senderId = data.senderId || null;
    this.receiverId = data.receiverId || null;
    this.senderWalletId = data.senderWalletId || null;
    this.receiverWalletId = data.receiverWalletId || null;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'SLL';
    this.type = data.type || 'send'; // send | receive | qr_payment | bill_payment | deposit | withdraw
    this.status = data.status || 'pending'; // pending | processing | completed | failed | refunded
    this.description = data.description || '';
    this.reference = data.reference || null;
    this.metadata = data.metadata || {};
    this.receiptUrl = data.receiptUrl || null;
    this.senderBalanceBefore = data.senderBalanceBefore || null;
    this.senderBalanceAfter = data.senderBalanceAfter || null;
    this.receiverBalanceBefore = data.receiverBalanceBefore || null;
    this.receiverBalanceAfter = data.receiverBalanceAfter || null;
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      senderId: this.senderId,
      receiverId: this.receiverId,
      senderWalletId: this.senderWalletId,
      receiverWalletId: this.receiverWalletId,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      description: this.description,
      reference: this.reference,
      metadata: this.metadata,
      receiptUrl: this.receiptUrl,
      senderBalanceBefore: this.senderBalanceBefore,
      senderBalanceAfter: this.senderBalanceAfter,
      receiverBalanceBefore: this.receiverBalanceBefore,
      receiverBalanceAfter: this.receiverBalanceAfter,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Transaction({ ...data, transactionId: doc.id });
  }

  // Helper methods
  isCompleted() {
    return this.status === 'completed';
  }

  isPending() {
    return this.status === 'pending';
  }

  isFailed() {
    return this.status === 'failed';
  }

  generateReceipt() {
    return {
      transactionId: this.transactionId,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      description: this.description,
      reference: this.reference,
      senderId: this.senderId,
      receiverId: this.receiverId,
      completedAt: this.completedAt || this.createdAt,
      createdAt: this.createdAt
    };
  }
}

module.exports = Transaction;
