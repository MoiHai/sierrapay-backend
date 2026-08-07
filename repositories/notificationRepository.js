let db = null;

const setDb = (database) => {
  db = database;
};

class NotificationRepository {
  constructor() {}

  async create(notificationData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('notifications').doc();
      const data = {
        ...notificationData,
        notificationId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  async findById(notificationId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('notifications').doc(notificationId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find notification: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 20, offset = 0) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      // Fallback without orderBy
      try {
        const snapshot = await db.collection('notifications')
          .where('userId', '==', userId)
          .get();
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results.slice(offset, offset + limit);
      } catch (fallbackError) {
        throw new Error(`Failed to find notifications: ${fallbackError.message}`);
      }
    }
  }

  async findByUserIdAndStatus(userId, status, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find notifications: ${error.message}`);
    }
  }

  async findByUserIdAndType(userId, type, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('type', '==', type)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find notifications: ${error.message}`);
    }
  }

  async markAsRead(notificationId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('notifications').doc(notificationId).update({
        status: 'read',
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return await this.findById(notificationId);
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async markAllAsRead(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('status', '==', 'delivered')
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'read',
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  }

  async markAsDelivered(notificationId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('notifications').doc(notificationId).update({
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return await this.findById(notificationId);
    } catch (error) {
      throw new Error(`Failed to mark notification as delivered: ${error.message}`);
    }
  }

  async getUnreadCount(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('status', '==', 'delivered')
        .get();
      
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  async deleteRead(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('status', '==', 'read')
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to delete read notifications: ${error.message}`);
    }
  }

  async deleteAll(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to delete notifications: ${error.message}`);
    }
  }
}

module.exports = new NotificationRepository();
module.exports.setDb = setDb;
