const express = require('express');
const routes = express.Router();
const legalServiceController = require('../contollers/LegalServiceController');
const consultationController = require('../contollers/ConsultationController');
const  protect = require("../middleware/AuthMiddleware")
const  isLawyer  = require('../middleware/AuthMiddleware');
const { uploadSingle, uploadMultiple } = require('../middleware/Documentmiddleware');

// Public routes (accessible without authentication)
routes.get('/', legalServiceController.getServices);
routes.get('/:id', legalServiceController.getService);

// Protected routes (require authentication)
routes.use(protect);

// Lawyer-only routes (require lawyer role)
routes.post(
    '/', 
    isLawyer,
    uploadMultiple.array('documents', 5), // Properly configured middleware
    legalServiceController.createService
  );

routes.get('/lawyer/myservices', 
  isLawyer, 
  legalServiceController.getLawyerServices
);

routes.put(
    '/:id',
    isLawyer,
    uploadMultiple.array('documents', 5), // Properly configured middleware
    legalServiceController.updateService
  );
  

routes.delete('/:id', 
  isLawyer, 
  legalServiceController.deleteService
);

// Consultation booking (protected but doesn't require lawyer role)
routes.post('/:id/book', 
  protect, // Only authenticated users can book
  consultationController.bookConsultation
);

module.exports = routes;




// const express = require('express');
// const routes = express.Router();
// const legalServiceController = require('../contollers/LegalServiceController');
// const  protect = require("../middleware/AuthMiddleware")
// const  isLawyer  = require('../middleware/AuthMiddleware');
// const { uploadSingle, uploadMultiple } = require('../middleware/Documentmiddleware');

// // ======================================
// // PUBLIC ROUTES (No authentication required)
// // ======================================

// // Get all active services (with filtering)
// // routes.get('/', legalServiceController.getServices);

// // Get featured services (LawRato style)
// // routes.get('/featured', legalServiceController.getFeaturedServices);

// // Get services by practice area (LawRato style)
// // routes.get('/practice-area/:area', legalServiceController.getServicesByPracticeArea);

// // Get single service details
// // routes.get('/:id', legalServiceController.getServices);

// // ======================================
// // PROTECTED ROUTES (Require authentication)
// // ======================================
// routes.use(protect);

// // Add review to a service
// // routes.post('/:id/reviews', legalServiceController.addReview);

// // ======================================
// // LAWYER-ONLY ROUTES (Require lawyer role)
// // ======================================
// routes.use(isLawyer);

// // Service creation with multiple upload support
// routes.post(
//   '/',
//   uploadMultiple([
//     { name: 'serviceImage', maxCount: 1 },
//     { name: 'serviceBanner', maxCount: 1 },
//     { name: 'documents', maxCount: 5 }
//   ]),
//   legalServiceController.createService
// );

// // Get all services for logged-in lawyer
// // routes.get('/lawyer/my-services', legalServiceController.getLawyerServices);

// // Update service with file upload support
// routes.put(
//   '/:id',
//   uploadMultiple([
//     { name: 'serviceImage', maxCount: 1 },
//     { name: 'serviceBanner', maxCount: 1 },
//     { name: 'documents', maxCount: 5 }
//   ]),
//   legalServiceController.updateService
// );

// // Delete or deactivate service
// // routes.delete('/:id', legalServiceController.deleteService);

// // Update service status (active/inactive)
// // routes.patch('/:id/status', legalServiceController.updateServiceStatus);

// // ======================================
// // ADMIN ROUTES (Could add if needed)
// // ======================================
// // router.use(isAdmin);
// // router.patch('/:id/feature', legalServiceController.featureService);
// // router.patch('/:id/approve', legalServiceController.approveService);

// module.exports = routes;