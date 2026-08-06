let db = null;

const setDb = (database) => {
  db = database;
};

class UserRepository {
  constructor() {}

  async create(userData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      // Ensure isActive is always true for new users
      const user = {
        userId: null,
        phoneNumber: userData.phoneNumber,
        fullName: userData.fullName || null,
        email: userData.email || null,
        passwordHash: userData.passwordHash || null,
        isVerified: userData.isVerified !== undefined ? userData.isVerified : true,
        isActive: true, // Always active on creation
        kycStatus: userData.kycStatus || 'pending',
        role: userData.role || 'user',
        deviceIds: [],
        settings: {
          biometricEnabled: false,
          twoFactorEnabled: false,
          notificationsEnabled: true
        },
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = db.collection('users').doc();
      user.userId = docRef.id;
      await docRef.set(user);
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findByPhone(phoneNumber) {
    try {
      if (!db) throw new Error('Database not initialized');
      const snapshot = await db.collection('users')
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async findById(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('users').doc(userId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async update(userId, data) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('users').doc(userId).update({
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async addDevice(userId, deviceId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const user = await this.findById(userId);
      if (!user) throw new Error('User not found');
      
      const devices = user.deviceIds || [];
      if (!devices.includes(deviceId)) {
        devices.push(deviceId);
        await db.collection('users').doc(userId).update({
          deviceIds: devices,
          updatedAt: new Date().toISOString()
        });
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to add device: ${error.message}`);
    }
  }

  async updateLastLogin(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('users').doc(userId).update({
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  async reactivate(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('users').doc(userId).update({
        isActive: true,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Failed to reactivate user: ${error.message}`);
    }
  }
}

module.exports = new UserRepository();
module.exports.setDb = setDb;
