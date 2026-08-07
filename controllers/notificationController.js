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
