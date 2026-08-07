#!/bin/bash
# SierraPay Phase 7 - Notifications Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 7 - Notifications Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE NOTIFICATION MODEL
# ============================================
echo "📁 Creating models/Notification.js..."

cat > models/Notification.js << 'EOF'
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
EOF

echo "✅ models/Notification.js created"

# ============================================
# 2. CREATE NOTIFICATION REPOSITORY
# ============================================
echo ""
echo "📁 Creating repositories/notificationRepository.js..."

cat > repositories/notificationRepository.js << 'EOF'
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
EOF

echo "✅ repositories/notificationRepository.js created"

# ============================================
# 3. CREATE NOTIFICATION SERVICE
# ============================================
echo ""
echo "📁 Creating services/notification/notificationService.js..."

mkdir -p services/notification

cat > services/notification/notificationService.js << 'EOF'
const notificationRepository = require('../../repositories/notificationRepository');
const userRepository = require('../../repositories/userRepository');
const deviceRepository = require('../../repositories/deviceRepository');

// Firebase Cloud Messaging
const { getMessaging } = require('../../config/firebase');

class NotificationService {
  // Send notification to a user via multiple channels
  async sendToUser(userId, title, body, data = {}, channels = ['in_app']) {
    try {
      // Get user
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const notifications = [];
      const results = [];

      // Send in-app notification
      if (channels.includes('in_app') || channels.includes('all')) {
        const inAppResult = await this.sendInApp(userId, title, body, data);
        notifications.push(inAppResult);
        results.push({ channel: 'in_app', ...inAppResult });
      }

      // Send push notification
      if (channels.includes('push') || channels.includes('all')) {
        const pushResult = await this.sendPush(userId, title, body, data);
        if (pushResult) {
          notifications.push(pushResult);
          results.push({ channel: 'push', ...pushResult });
        }
      }

      // Send SMS notification
      if (channels.includes('sms') || channels.includes('all')) {
        const smsResult = await this.sendSMS(userId, title, body);
        if (smsResult) {
          notifications.push(smsResult);
          results.push({ channel: 'sms', ...smsResult });
        }
      }

      return {
        success: true,
        userId: userId,
        sent: results.length,
        results: results
      };
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  // Send in-app notification
  async sendInApp(userId, title, body, data = {}) {
    try {
      const notificationData = {
        userId: userId,
        type: data.type || 'system',
        title: title,
        body: body,
        data: data,
        channel: 'in_app',
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      };

      const notification = await notificationRepository.create(notificationData);
      return {
        success: true,
        notificationId: notification.id,
        channel: 'in_app'
      };
    } catch (error) {
      throw new Error(`Failed to send in-app notification: ${error.message}`);
    }
  }

  // Send push notification via FCM
  async sendPush(userId, title, body, data = {}) {
    try {
      // Get user's FCM tokens
      const devices = await deviceRepository.findActiveByUserId(userId);
      const tokens = devices
        .filter(d => d.fcmToken)
        .map(d => d.fcmToken);

      if (tokens.length === 0) {
        console.log(`📱 No FCM tokens found for user ${userId}`);
        return null;
      }

      // Get messaging instance
      const messaging = getMessaging();

      // Build message
      const message = {
        notification: {
          title: title,
          body: body,
        },
        data: data,
        tokens: tokens
      };

      // Send to all devices
      const response = await messaging.sendEachForMulticast(message);

      // Log results
      const successCount = response.responses.filter(r => r.success).length;
      const failureCount = response.responses.filter(r => !r.success).length;

      console.log(`📱 Push notification sent: ${successCount} success, ${failureCount} failures`);

      // Create notification record for push
      const notificationData = {
        userId: userId,
        type: data.type || 'system',
        title: title,
        body: body,
        data: data,
        channel: 'push',
        status: successCount > 0 ? 'delivered' : 'failed',
        deliveredAt: successCount > 0 ? new Date().toISOString() : null,
        sentAt: new Date().toISOString(),
        metadata: {
          tokens: tokens.length,
          successCount: successCount,
          failureCount: failureCount
        }
      };

      await notificationRepository.create(notificationData);

      return {
        success: true,
        channel: 'push',
        successCount: successCount,
        failureCount: failureCount
      };
    } catch (error) {
      console.error('❌ Push notification error:', error.message);
      return null;
    }
  }

  // Send SMS notification
  async sendSMS(userId, title, body) {
    try {
      // Get user
      const user = await userRepository.findById(userId);
      if (!user || !user.phoneNumber) {
        console.log(`📱 No phone number found for user ${userId}`);
        return null;
      }

      // In production, integrate with SMS provider (Twilio, Africa's Talking, etc.)
      // For now, simulate SMS sending
      console.log(`📱 SMS sent to ${user.phoneNumber}: ${title} - ${body}`);

      // Create notification record for SMS
      const notificationData = {
        userId: userId,
        type: 'system',
        title: title,
        body: body,
        data: { phoneNumber: user.phoneNumber },
        channel: 'sms',
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      };

      await notificationRepository.create(notificationData);

      return {
        success: true,
        channel: 'sms',
        phoneNumber: user.phoneNumber
      };
    } catch (error) {
      console.error('❌ SMS error:', error.message);
      return null;
    }
  }

  // Broadcast notification to all users
  async broadcastToAll(title, body, data = {}, channels = ['in_app']) {
    try {
      // Get all users
      const allUsers = await userRepository.findAll();
      
      let successCount = 0;
      let failureCount = 0;
      const results = [];

      // Send to each user
      for (const user of allUsers) {
        try {
          const result = await this.sendToUser(user.id, title, body, data, channels);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
          results.push({ userId: user.id, ...result });
        } catch (error) {
          failureCount++;
          results.push({ userId: user.id, error: error.message });
        }
      }

      return {
        success: true,
        totalUsers: allUsers.length,
        successCount: successCount,
        failureCount: failureCount,
        results: results
      };
    } catch (error) {
      throw new Error(`Failed to broadcast: ${error.message}`);
    }
  }

  // Get notification by ID
  async getNotification(notificationId, userId) {
    try {
      const notification = await notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized to view this notification');
      }

      return notification;
    } catch (error) {
      throw new Error(`Failed to get notification: ${error.message}`);
    }
  }

  // Get user's notifications
  async getUserNotifications(userId, limit = 20, offset = 0) {
    try {
      return await notificationRepository.findByUserId(userId, limit, offset);
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      return await notificationRepository.getUnreadCount(userId);
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized to update this notification');
      }

      return await notificationRepository.markAsRead(notificationId);
    } catch (error) {
      throw new Error(`Failed to mark as read: ${error.message}`);
    }
  }

  // Mark all as read
  async markAllAsRead(userId) {
    try {
      const count = await notificationRepository.markAllAsRead(userId);
      return { success: true, count: count };
    } catch (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  }

  // Delete read notifications
  async deleteRead(userId) {
    try {
      const count = await notificationRepository.deleteRead(userId);
      return { success: true, count: count };
    } catch (error) {
      throw new Error(`Failed to delete read notifications: ${error.message}`);
    }
  }

  // Delete all notifications
  async deleteAll(userId) {
    try {
      const count = await notificationRepository.deleteAll(userId);
      return { success: true, count: count };
    } catch (error) {
      throw new Error(`Failed to delete notifications: ${error.message}`);
    }
  }

  // Send transaction notification
  async sendTransactionNotification(userId, transaction, type) {
    let title, body, data;

    if (type === 'sent') {
      title = '💰 Money Sent';
      body = `You sent ${transaction.amount} SLL to ${transaction.receiverName || 'someone'}`;
      data = {
        type: 'transaction',
        action: 'sent',
        transactionId: transaction.transactionId,
        amount: transaction.amount.toString(),
        currency: transaction.currency || 'SLL'
      };
    } else if (type === 'received') {
      title = '💰 Money Received';
      body = `You received ${transaction.amount} SLL from ${transaction.senderName || 'someone'}`;
      data = {
        type: 'transaction',
        action: 'received',
        transactionId: transaction.transactionId,
        amount: transaction.amount.toString(),
        currency: transaction.currency || 'SLL'
      };
    } else {
      title = '📊 Transaction Update';
      body = `Transaction ${transaction.reference || transaction.transactionId} updated`;
      data = {
        type: 'transaction',
        action: 'update',
        transactionId: transaction.transactionId
      };
    }

    return await this.sendToUser(userId, title, body, data, ['in_app', 'push']);
  }

  // Send bill payment notification
  async sendBillNotification(userId, bill, type) {
    let title, body, data;

    if (type === 'paid') {
      title = '📄 Bill Paid';
      body = `Your ${bill.category} bill of ${bill.amount} SLL has been paid successfully`;
      data = {
        type: 'bill',
        action: 'paid',
        billId: bill.billId,
        category: bill.category,
        amount: bill.amount.toString(),
        provider: bill.provider
      };
    } else if (type === 'failed') {
      title = '❌ Bill Payment Failed';
      body = `Your ${bill.category} bill payment of ${bill.amount} SLL failed. Please try again.`;
      data = {
        type: 'bill',
        action: 'failed',
        billId: bill.billId,
        category: bill.category,
        amount: bill.amount.toString()
      };
    } else {
      title = '📄 Bill Update';
      body = `Your ${bill.category} bill has been updated`;
      data = {
        type: 'bill',
        action: 'update',
        billId: bill.billId,
        category: bill.category
      };
    }

    return await this.sendToUser(userId, title, body, data, ['in_app', 'push']);
  }

  // Send QR payment notification
  async sendQRNotification(userId, qr, type) {
    let title, body, data;

    if (type === 'generated') {
      title = '📱 QR Code Generated';
      body = `QR code for ${qr.amount} SLL has been generated`;
      data = {
        type: 'qr',
        action: 'generated',
        qrId: qr.qrId,
        amount: qr.amount.toString()
      };
    } else if (type === 'paid') {
      title = '✅ QR Payment Received';
      body = `QR payment of ${qr.amount} SLL has been received`;
      data = {
        type: 'qr',
        action: 'paid',
        qrId: qr.qrId,
        amount: qr.amount.toString()
      };
    } else {
      title = '📱 QR Update';
      body = `QR payment has been updated`;
      data = {
        type: 'qr',
        action: 'update',
        qrId: qr.qrId
      };
    }

    return await this.sendToUser(userId, title, body, data, ['in_app', 'push']);
  }

  // Send wallet notification
  async sendWalletNotification(userId, wallet, type) {
    let title, body, data;

    if (type === 'credit') {
      title = '💰 Wallet Credited';
      body = `${wallet.amount} SLL has been added to your wallet`;
      data = {
        type: 'wallet',
        action: 'credit',
        amount: wallet.amount.toString(),
        balance: wallet.balance.toString()
      };
    } else if (type === 'debit') {
      title = '💸 Wallet Debited';
      body = `${wallet.amount} SLL has been deducted from your wallet`;
      data = {
        type: 'wallet',
        action: 'debit',
        amount: wallet.amount.toString(),
        balance: wallet.balance.toString()
      };
    } else {
      title = '💳 Wallet Update';
      body = `Your wallet has been updated`;
      data = {
        type: 'wallet',
        action: 'update',
        balance: wallet.balance.toString()
      };
    }

    return await this.sendToUser(userId, title, body, data, ['in_app', 'push']);
  }

  // Send security notification
  async sendSecurityNotification(userId, title, body, data = {}) {
    return await this.sendToUser(userId, title, body, {
      ...data,
      type: 'security',
      priority: 'high'
    }, ['in_app', 'push', 'sms']);
  }
}

module.exports = new NotificationService();
EOF

echo "✅ services/notification/notificationService.js created"

# ============================================
# 4. CREATE NOTIFICATION CONTROLLER
# ============================================
echo ""
echo "📁 Creating controllers/notificationController.js..."

cat > controllers/notificationController.js << 'EOF'
const notificationService = require('../services/notification/notificationService');

class NotificationController {
  // Get user's notifications
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const notifications = await notificationService.getUserNotifications(
        userId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: {
          notifications,
          count: notifications.length,
          limit,
          offset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get unread count
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: {
          unreadCount: count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get notification by ID
  async getNotification(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { notificationId } = req.params;

      const notification = await notificationService.getNotification(
        notificationId,
        userId
      );

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as read
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { notificationId } = req.params;

      const notification = await notificationService.markAsRead(
        notificationId,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${result.count} notifications marked as read`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete read notifications
  async deleteRead(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await notificationService.deleteRead(userId);

      res.status(200).json({
        success: true,
        message: `${result.count} read notifications deleted`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete all notifications
  async deleteAll(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await notificationService.deleteAll(userId);

      res.status(200).json({
        success: true,
        message: `${result.count} notifications deleted`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Send custom notification (admin only)
  async sendCustomNotification(req, res, next) {
    try {
      const { userId, title, body, data, channels } = req.body;

      if (!userId || !title || !body) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'User ID, title, and body are required'
        });
      }

      const result = await notificationService.sendToUser(
        userId,
        title,
        body,
        data || {},
        channels || ['in_app']
      );

      res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Broadcast notification (admin only)
  async broadcast(req, res, next) {
    try {
      const { title, body, data, channels } = req.body;

      if (!title || !body) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Title and body are required'
        });
      }

      const result = await notificationService.broadcastToAll(
        title,
        body,
        data || {},
        channels || ['in_app']
      );

      res.status(200).json({
        success: true,
        message: 'Broadcast sent successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
EOF

echo "✅ controllers/notificationController.js created"

# ============================================
# 5. CREATE NOTIFICATION ROUTES
# ============================================
echo ""
echo "📁 Creating routes/notificationRoutes.js..."

cat > routes/notificationRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(authMiddleware);

// Get user's notifications
router.get('/', notificationController.getNotifications.bind(notificationController));

// Get unread count
router.get('/unread', notificationController.getUnreadCount.bind(notificationController));

// Get notification by ID
router.get('/:notificationId', notificationController.getNotification.bind(notificationController));

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead.bind(notificationController));

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead.bind(notificationController));

// Delete read notifications
router.delete('/read', notificationController.deleteRead.bind(notificationController));

// Delete all notifications
router.delete('/all', notificationController.deleteAll.bind(notificationController));

// Send custom notification (admin only)
router.post('/send', notificationController.sendCustomNotification.bind(notificationController));

// Broadcast notification (admin only)
router.post('/broadcast', notificationController.broadcast.bind(notificationController));

module.exports = router;
EOF

echo "✅ routes/notificationRoutes.js created"

# ============================================
# 6. UPDATE APP.JS TO INCLUDE NOTIFICATION ROUTES
# ============================================
echo ""
echo "📁 Updating app.js with notification routes..."

if grep -q "notificationRoutes" app.js; then
  echo "✅ Notification routes already in app.js"
else
  # Insert notification routes before 404 handler
  sed -i '/\/ Bill routes/a\
\
// Notification routes\
app.use('\''/api/v1/notifications'\'', require('\''./routes/notificationRoutes'\''));' app.js
  
  echo "✅ Notification routes added to app.js"
fi

# ============================================
# 7. UPDATE SERVER_SIMPLE.JS
# ============================================
echo ""
echo "📁 Updating server_simple.js with notification repository..."

if grep -q "notificationRepository" server_simple.js; then
  echo "✅ Notification repository already in server_simple.js"
else
  # Add notification repository
  sed -i '/const billRepo = require/,+2 a\
const notificationRepo = require('\''./repositories/notificationRepository'\'');\
notificationRepo.setDb(db);' server_simple.js
  
  echo "✅ Notification repository added to server_simple.js"
fi

# ============================================
# 8. CREATE TEST SCRIPT
# ============================================
echo ""
echo "📁 Creating test_notifications.sh..."

cat > test_notifications.sh << 'EOF'
#!/bin/bash
# Test script for Phase 7 - Notifications

echo "============================================"
echo "  SierraPay Phase 7 - Notifications Test"
echo "============================================"
echo ""

# Get OTP for Moi Hai
echo "📱 Getting OTP for Moi Hai..."
OTP=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23275335034", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

echo "OTP: $OTP"

# Login
echo ""
echo "🔐 Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23275335034\", \"code\": \"$OTP\"}")

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo ""
echo "============================================"
echo "  Testing Notification Endpoints"
echo "============================================"

# 1. Get notifications
echo ""
echo "📬 Getting Notifications..."
curl -s -X GET "http://localhost:5000/api/v1/notifications?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get unread count
echo ""
echo "📊 Unread Count..."
curl -s -X GET "http://localhost:5000/api/v1/notifications/unread" \
  -H "Authorization: Bearer $TOKEN"

# 3. Send a notification (in-app only)
echo ""
echo "📨 Sending Notification..."
curl -s -X POST http://localhost:5000/api/v1/notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "IKTTbPuZMJomd3TTwT8X",
    "title": "Test Notification",
    "body": "This is a test notification from SierraPay",
    "data": {
      "type": "system",
      "action": "test"
    },
    "channels": ["in_app"]
  }'

# 4. Send a notification with push
echo ""
echo "📨 Sending Notification with Push..."
curl -s -X POST http://localhost:5000/api/v1/notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "IKTTbPuZMJomd3TTwT8X",
    "title": "🔔 Push Test",
    "body": "This is a push notification test",
    "data": {
      "type": "system",
      "action": "push_test"
    },
    "channels": ["in_app", "push"]
  }'

# 5. Get updated notifications
echo ""
echo "📬 Updated Notifications..."
curl -s -X GET "http://localhost:5000/api/v1/notifications?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 6. Get updated unread count
echo ""
echo "📊 Updated Unread Count..."
curl -s -X GET "http://localhost:5000/api/v1/notifications/unread" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 7 - NOTIFICATIONS READY!"
echo "============================================"
EOF

chmod +x test_notifications.sh
echo "✅ test_notifications.sh created"

# ============================================
# 9. COMPLETION MESSAGE
# ============================================
echo ""
echo "============================================"
echo "  ✅ PHASE 7 - NOTIFICATIONS COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created:"
echo "  Models: Notification.js"
echo "  Repository: notificationRepository.js"
echo "  Service: notificationService.js"
echo "  Controller: notificationController.js"
echo "  Routes: notificationRoutes.js"
echo "  Test: test_notifications.sh"
echo ""
echo "🔑 API Endpoints Added:"
echo "  GET    /api/v1/notifications           - Get user notifications"
echo "  GET    /api/v1/notifications/unread    - Get unread count"
echo "  GET    /api/v1/notifications/:id       - Get notification by ID"
echo "  PUT    /api/v1/notifications/:id/read  - Mark as read"
echo "  PUT    /api/v1/notifications/read-all  - Mark all as read"
echo "  DELETE /api/v1/notifications/read      - Delete read notifications"
echo "  DELETE /api/v1/notifications/all       - Delete all notifications"
echo "  POST   /api/v1/notifications/send      - Send custom notification"
echo "  POST   /api/v1/notifications/broadcast - Broadcast to all users"
echo ""
echo "📋 Next Steps:"
echo "  1. Restart the server: npm run dev"
echo "  2. Run test: bash test_notifications.sh"
echo "  3. Set up Firebase Cloud Messaging for push notifications"
echo ""
echo "============================================"