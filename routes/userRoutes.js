const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', userController.getProfile.bind(userController));

// Update user profile
router.put('/profile', userController.updateProfile.bind(userController));

// Update settings
router.put('/settings', userController.updateSettings.bind(userController));

// Change phone number
router.put('/phone', userController.changePhoneNumber.bind(userController));

// Upload profile picture
router.post('/profile/picture', userController.uploadProfilePicture.bind(userController));

// Get user activity
router.get('/activity', userController.getActivity.bind(userController));

// Get KYC status
router.get('/kyc', userController.getKYCStatus.bind(userController));

// Get user devices
router.get('/devices', userController.getDevices.bind(userController));

// Get user stats
router.get('/stats', userController.getStats.bind(userController));

module.exports = router;
