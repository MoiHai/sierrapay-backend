// Settings Routes
const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get app settings
router.get('/app', SettingsController.getAppSettings);

// Update app settings (admin only)
router.put('/app', SettingsController.updateAppSettings);

// Get notification settings
router.get('/notifications', SettingsController.getNotificationSettings);

// Update notification settings
router.put('/notifications', SettingsController.updateNotificationSettings);

// Get privacy settings
router.get('/privacy', SettingsController.getPrivacySettings);

// Update privacy settings
router.put('/privacy', SettingsController.updatePrivacySettings);

module.exports = router;
