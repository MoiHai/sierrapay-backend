/**
 * Notification Model - Firestore Schema
 * Collection: notifications
 */
class Notification {
  constructor(data) {
    this.notificationId = data.notificationId || null;
    this.userId = data.userId || null;
    this.type = data.type || 'system'; // transaction | payment | kyc | promotional | system | security
    this.title = data.title || null;
    this.body = data.body || null;
    this.data = data.data || {};
    this.priority = data.priority || 'normal'; // low | normal | high
    this.status = data.status || 'sent'; // sent | delivered | read | failed
    this.channel = data.channel || 'in_app'; // in_app | push | sms | email
    this.readAt = data.readAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.sentAt = data.sentAt || new Date().toISOString();
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isRead() {
    return this.status === 'read';
  }

  isDelivered() {
    return this.status === 'delivered';
  }

  toFirestore() {
    return {
      userId: this.userId,
      type: this.type,
      title: this.title,
      body: this.body,
      data: this.data,
      priority: this.priority,
      status: this.status,
      channel: this.channel,
      readAt: this.readAt,
      deliveredAt: this.deliveredAt,
      sentAt: this.sentAt,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Notification({ ...data, notificationId: doc.id });
  }
}

module.exports = Notification;
