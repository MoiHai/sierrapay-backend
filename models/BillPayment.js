/**
 * Bill Payment Model - Firestore Schema
 * Collection: bill_payments
 */
class BillPayment {
  constructor(data) {
    this.billId = data.billId || null;
    this.userId = data.userId || null;
    this.walletId = data.walletId || null;
    this.transactionId = data.transactionId || null;
    this.category = data.category || 'other'; // electricity | water | internet | tv | phone | other
    this.provider = data.provider || null;
    this.customerId = data.customerId || null;
    this.customerName = data.customerName || null;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'SLL';
    this.fee = data.fee || 0;
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || 'pending'; // pending | processing | completed | failed
    this.reference = data.reference || null;
    this.paymentDate = data.paymentDate || null;
    this.metadata = data.metadata || {};
    this.billerResponse = data.billerResponse || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isCompleted() {
    return this.status === 'completed';
  }

  isPending() {
    return this.status === 'pending';
  }

  isFailed() {
    return this.status === 'failed';
  }

  toFirestore() {
    return {
      userId: this.userId,
      walletId: this.walletId,
      transactionId: this.transactionId,
      category: this.category,
      provider: this.provider,
      customerId: this.customerId,
      customerName: this.customerName,
      amount: this.amount,
      currency: this.currency,
      fee: this.fee,
      totalAmount: this.totalAmount,
      status: this.status,
      reference: this.reference,
      paymentDate: this.paymentDate,
      metadata: this.metadata,
      billerResponse: this.billerResponse,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new BillPayment({ ...data, billId: doc.id });
  }
}

module.exports = BillPayment;
