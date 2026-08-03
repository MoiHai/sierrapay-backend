// Admin Routes
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User management
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUser);
router.put('/users/:id/suspend', AdminController.suspendUser);
router.put('/users/:id/activate', AdminController.activateUser);

// Transaction management
router.get('/transactions', AdminController.getTransactions);
router.get('/transactions/:id', AdminController.getTransaction);
router.post('/transactions/:id/reverse', AdminController.reverseTransaction);

// System health
router.get('/health', AdminController.getHealth);

// Statistics
router.get('/statistics', AdminController.getStatistics);

module.exports = router;
