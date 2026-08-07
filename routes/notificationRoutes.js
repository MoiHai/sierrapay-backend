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
