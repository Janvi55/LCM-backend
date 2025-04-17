const express = require('express');
const routes = express.Router();
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/AuthMiddleware');
const adminMiddleware = require('../middleware/AdminMiddleware');

// Protect routes with BOTH auth and admin checks
routes.get('/analytics', authMiddleware, adminMiddleware, adminController.getSystemAnalytics);
routes.patch('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
const { isSuperAdmin } = require('../middleware/RoleMiddleware'); // Optional: For tiered permissions

// Protect all routes with admin-level auth
routes.use(authMiddleware);

// Admin management
routes.post('/', adminController.createAdmin); // Only superadmins should access this
routes.get('/', adminController.getAllAdmins);
routes.patch('/:id/permissions', adminController.updateAdminPermissions);

// Analytics


// Optional: User management overrides (e.g., force-delete users)
routes.delete('/users/:id', adminController.forceDeleteUser);

module.exports = routes;