// Notification Repository - Handles Notification CRUD operations
const { getDb } = require('../config/database');

const COLLECTION = 'notifications';

class NotificationRepository {
  // Create notification
  static async create(notificationData) {
    const db = getDb();
    const notificationRef = db.collection(COLLECTION).doc();
    const id = notificationRef.id;
    
    await notificationRef.set({
      id,
      read: false,
      ...notificationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...notificationData };
  }
  
  // Get notification by ID
  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  }
  
  // Get notifications for user
  static async findByUserId(userId, options = {}) {
    const db = getDb();
    const {
      page = 1,
      limit = 20,
      read,
      type
    } = options;
    
    const offset = (page - 1) * limit;
    
    let query = db.collection(COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit);
    
    if (read !== undefined) {
      query = query.where('read', '==', read);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.get();
    const notifications = [];
    
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    // Get total count
    let countQuery = db.collection(COLLECTION)
      .where('userId', '==', userId);
    
    if (read !== undefined) {
      countQuery = countQuery.where('read', '==', read);
    }
    
    if (type) {
      countQuery = countQuery.where('type', '==', type);
    }
    
    const countSnapshot = await countQuery.get();
    
    return {
      notifications,
      pagination: {
        page,
        limit,
        total: countSnapshot.size,
        pages: Math.ceil(countSnapshot.size / limit)
      }
    };
  }
  
  // Mark notification as read
  static async markAsRead(id) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      read: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return this.findById(id);
  }
  
  // Mark all notifications as read for user
  static async markAllAsRead(userId) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
  }
  
  // Delete notification
  static async delete(id) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).delete();
  }
  
  // Get unread count
  static async getUnreadCount(userId) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    return snapshot.size;
  }
}

module.exports = NotificationRepository;
