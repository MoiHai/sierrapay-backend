const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  authMiddleware,
  sessionAuthMiddleware
} = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  otpRequestValidation,
  refreshTokenValidation,
  logoutValidation,
  trustDeviceValidation
} = require('../validators/authValidator');

// Public routes
router.post('/otp/send', otpRequestValidation, authController.sendOTP.bind(authController));
router.post('/register', registerValidation, authController.register.bind(authController));
router.post('/login', loginValidation, authController.login.bind(authController));
router.post('/refresh', refreshTokenValidation, authController.refreshToken.bind(authController));

// Protected routes - just use authMiddleware, skip session check
router.post('/logout', authMiddleware, logoutValidation, authController.logout.bind(authController));
router.post('/logout-all', authMiddleware, authController.logoutAll.bind(authController));
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));
router.get('/devices', authMiddleware, authController.getDevices.bind(authController));

// Routes that require trusted device - skip for now
router.post('/devices/trust', authMiddleware, trustDeviceValidation, authController.trustDevice.bind(authController));
router.delete('/devices/:deviceId', authMiddleware, authController.revokeDevice.bind(authController));

module.exports = router;
