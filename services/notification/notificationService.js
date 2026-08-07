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
