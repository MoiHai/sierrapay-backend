const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All security routes require authentication
router.use(authMiddleware);

// ============================================
// DEVICE MANAGEMENT
// ============================================

// Get all devices
router.get('/devices', securityController.getDevices.bind(securityController));

// Register device
router.post('/devices/register', securityController.registerDevice.bind(securityController));

// Get device details
router.get('/devices/:deviceId', securityController.getDeviceDetails.bind(securityController));

// Trust device
router.put('/devices/:deviceId/trust', securityController.trustDevice.bind(securityController));

// Untrust device
router.put('/devices/:deviceId/untrust', securityController.untrustDevice.bind(securityController));

// Revoke device
router.delete('/devices/:deviceId', securityController.revokeDevice.bind(securityController));

// Update device name
router.put('/devices/:deviceId/name', securityController.updateDeviceName.bind(securityController));

// Get trusted devices
router.get('/trusted', securityController.getTrustedDevices.bind(securityController));

// ============================================
// BIOMETRIC AUTHENTICATION
// ============================================

// Enable biometric
router.post('/biometric/enable', securityController.enableBiometric.bind(securityController));

// Disable biometric
router.post('/biometric/disable', securityController.disableBiometric.bind(securityController));

// Verify biometric
router.post('/biometric/verify', securityController.verifyBiometric.bind(securityController));

// ============================================
// SESSIONS
// ============================================

// Get active sessions
router.get('/sessions', securityController.getSessions.bind(securityController));

// Terminate session
router.delete('/sessions/:sessionId', securityController.terminateSession.bind(securityController));

// Terminate all sessions
router.delete('/sessions/all', securityController.terminateAllSessions.bind(securityController));

// ============================================
// TWO-FACTOR AUTHENTICATION
// ============================================

// Enable 2FA
router.post('/2fa/enable', securityController.enable2FA.bind(securityController));

// Disable 2FA
router.post('/2fa/disable', securityController.disable2FA.bind(securityController));

// Verify 2FA
router.post('/2fa/verify', securityController.verify2FA.bind(securityController));

module.exports = router;
