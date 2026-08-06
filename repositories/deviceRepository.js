let db = null;

const setDb = (database) => {
  db = database;
};

class DeviceRepository {
  constructor() {}

  async create(deviceData) {
    try {
      if (!db) throw new Error('Database not initialized');
      const docRef = db.collection('devices').doc();
      const data = {
        ...deviceData,
        deviceId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return data;
    } catch (error) {
      throw new Error(`Failed to create device: ${error.message}`);
    }
  }

  async findByDeviceId(deviceId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('devices').doc(deviceId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find device: ${error.message}`);
    }
  }

  async findActiveByUserId(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const snapshot = await db.collection('devices')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find devices: ${error.message}`);
    }
  }

  async updateTrusted(deviceId, isTrusted) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('devices').doc(deviceId).update({
        isTrusted: isTrusted,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update trusted status: ${error.message}`);
    }
  }

  async updateFCMToken(deviceId, fcmToken) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('devices').doc(deviceId).update({
        fcmToken: fcmToken,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update FCM token: ${error.message}`);
    }
  }

  async updateLastUsed(deviceId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('devices').doc(deviceId).update({
        lastUsedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update last used: ${error.message}`);
    }
  }

  async revoke(deviceId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('devices').doc(deviceId).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to revoke device: ${error.message}`);
    }
  }

  async findOrCreate(deviceData) {
    try {
      if (!db) throw new Error('Database not initialized');
      let device = await this.findByDeviceId(deviceData.deviceId);
      if (device) {
        await db.collection('devices').doc(deviceData.deviceId).update({
          ...deviceData,
          lastUsedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return await this.findByDeviceId(deviceData.deviceId);
      }
      return await this.create(deviceData);
    } catch (error) {
      throw new Error(`Failed to find or create device: ${error.message}`);
    }
  }
}

module.exports = new DeviceRepository();
module.exports.setDb = setDb;
