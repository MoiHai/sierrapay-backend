/**
 * Session Model - Firestore Schema
 * Collection: sessions
 */
class Session {
  constructor(data) {
    this.sessionId = data.sessionId || null;
    this.userId = data.userId || null;
    this.deviceId = data.deviceId || null;
    this.refreshToken = data.refreshToken || null;
    this.accessToken = data.accessToken || null;
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.expiresAt = data.expiresAt || null;
    this.lastActivityAt = data.lastActivityAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  toFirestore() {
    return {
      userId: this.userId,
      deviceId: this.deviceId,
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      isActive: this.isActive,
      expiresAt: this.expiresAt,
      lastActivityAt: this.lastActivityAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Session({ ...data, sessionId: doc.id });
  }
}

module.exports = Session;
