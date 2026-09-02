const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Dashboard statistics
router.get('/dashboard/stats', auth, authorize('admin'), adminController.getDashboardStats);

// Manage users
router.get('/users', auth, authorize('admin'), adminController.getAllUsers);
router.put('/users/:id/status', auth, authorize('admin'), adminController.updateUserStatus);

// Reports
router.get('/reports/appointments', auth, authorize('admin'), adminController.getAppointmentReport);
router.get('/reports/revenue', auth, authorize('admin'), adminController.getRevenueReport);

module.exports = router;