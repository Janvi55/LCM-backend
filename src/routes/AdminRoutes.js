const routes = require("express").Router();

const adminController = require('../contollers/AdminController');

routes.get("/adminDashBoard",adminController.getAdminStats);
routes.get("/chart-data",adminController.getChartData);
routes.get("/lawyerAppointments",adminController.getLawyerAppointmentsStats)
routes.get('/userSignupStats', adminController.getUserSignupStats);
routes.get('/appointmentStatusStats', adminController.getAppointmentStatusStats);
routes.get('/appointmentsCalendar',adminController.getAppointmentsForCalendars);
routes.get("/calendarAppointments",adminController.getAppointmentsForCalendar);
routes.get("/admin/getAllUsers",adminController.getAllUsers)
routes.delete("/admin/deleteUser/:id",adminController.deleteUser)
routes.patch("/admin/toggleUserBlock/:id",adminController.toggleUserBlock)
routes.get("/admin/getAllLawyers",adminController.getAllLawyers)
routes.delete("/admin/deleteLawyer/:id",adminController.deleteLawyer)
routes.patch("/admin/getAllPayments",adminController.toggleLawyerBlock)
routes.get("/admin/getAllPayments",adminController.getAllPayments)
routes.post("/admin/adminSignup",adminController.adminSignup)
routes.post("/admin/adminLogin",adminController.adminLogin)
routes.get("/admin/getAllReviews",adminController.getAllReviews)
routes.delete("/admin/deleteReview/:id",adminController.deleteReview)
routes.get("/admin/userRetentionStats",adminController.getUserRetentionStats)
routes.get("/admin/lawyerRatingStats",adminController.getLawyerRatingStats)
module.exports = routes;



















//------------------------------------------------------------------------------
// const express = require('express');
// const routes = express.Router();
// const adminController = require('../contollers/AdminController');
// const legalCategoryController = require('../contollers/LegalCategoryController')
// const protect = require('../middleware/AuthMiddleware')
// const isAdmin = require('../middleware/AuthMiddleware')
// const authMiddleware = require('../middleware/AuthMiddleware');
// const adminMiddleware = require('../middleware/AdminMiddleware');

// const multer = require('multer');


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// });

// // Create the upload middleware
// const uploadSingle = multer({ storage: storage }).single('icon'); // Changed from 'document' to 'icon'

// routes.use(protect);
// routes.use(isAdmin);

// // Protect routes with BOTH auth and admin checks
// routes.get('/analytics', authMiddleware, adminMiddleware, adminController.getSystemAnalytics);
// routes.patch('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
// // const { isSuperAdmin } = require('../middleware/RoleMiddleware'); // Optional: For tiered permissions

// // Protect all routes with admin-level auth


// routes.post('/categories', authMiddleware,uploadSingle, legalCategoryController.createCategory);
// routes.put('/categories/:id', authMiddleware,uploadSingle, legalCategoryController.updateCategory);
// routes.delete('/categories/:id',authMiddleware, legalCategoryController.deleteCategory);
// //   routes.get('/categories', legalCategoryController.getAllCategoriesAdmin);

// // Admin management
// routes.post('/', adminController.createAdmin); // Only superadmins should access this
// routes.get('/', adminController.getAllAdmins);
// routes.patch('/:id/permissions', adminController.updateAdminPermissions);

// // Analytics


// // Category management
// routes.post('/categories', uploadSingle, legalCategoryController.createCategory);
// routes.put('/categories/:id', uploadSingle, legalCategoryController.updateCategory);
// routes.delete('/categories/:id', legalCategoryController.deleteCategory);
// routes.get('/categories/analytics', legalCategoryController.getCategoryAnalytics);
// routes.patch('/categories/:id/status', legalCategoryController.updateCategoryStatus);


// routes.get('/services/pending', legalServiceController.getPendingServices);
// routes.put('/services/:id/status', legalServiceController.updateServiceStatus);
// routes.get('/services/reported', legalServiceController.getReportedServices);

// // Optional: User management overrides (e.g., force-delete users)
// routes.delete('/users/:id', adminController.forceDeleteUser);

// module.exports = routes;