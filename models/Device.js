/**
 * Device Model - Firestore Schema
 * Collection: devices
 */
class Device {
  constructor(data) {
    this.deviceId = data.deviceId || null;
    this.userId = data.userId || null;
    this.deviceName = data.deviceName || null;
    this.deviceType = data.deviceType || null; // android | ios | web
    this.deviceModel = data.deviceModel || null;
    this.osVersion = data.osVersion || null;
    this.appVersion = data.appVersion || null;
    this.fcmToken = data.fcmToken || null;
    this.isTrusted = data.isTrusted || false;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastUsedAt = data.lastUsedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      userId: this.userId,
      deviceName: this.deviceName,
      deviceType: this.deviceType,
      deviceModel: this.deviceModel,
      osVersion: this.osVersion,
      appVersion: this.appVersion,
      fcmToken: this.fcmToken,
      isTrusted: this.isTrusted,
      isActive: this.isActive,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Device({ ...data, deviceId: doc.id });
  }
}

module.exports = Device;
