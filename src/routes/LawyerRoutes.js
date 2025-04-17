const routes = require('express').Router()
const multer = require('multer');
const lawyerController= require('../contollers/LawyerController');
const  isLawyer = require('../middleware/AuthMiddleware');
const protect = require('../middleware/AuthMiddleware')
const { handleVerificationUpload   } = require('../middleware/Documentmiddleware');


// routes.use(authMiddleware)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  });
  
  const uploadSingle = multer({ storage: storage }).single('document');
  const uploadMultiple = multer({ storage: storage }).array('documents', 5);
// ✅ Add a new lawyer
routes.post("/addlawyer", lawyerController.addLawyer);

// ✅ Get all lawyers
routes.get("/", lawyerController.getAllLawyers);

// ✅ Get a lawyer by ID
routes.get("/getlawyerby/:id", lawyerController.getLawyerById);

routes.get("/", lawyerController.getTopRatedLawyers);

// routes.get("/:city", lawyerController.getLawyersByCity); 
// Lawyer Profile Routes
routes.get('/profile', protect, isLawyer, lawyerController.getLawyerProfile);
routes.put('/profile', protect, isLawyer, lawyerController.updateLawyerProfile);

// routes.get('/specialization', lawyerController.getLawyersBySpecialization); // Public
// routes.post('/complete-profile', protect, isLawyer, lawyerController.completeProfile);
// routes.post('/verify', protect, isLawyer, uploadSingle('document'), lawyerController.uploadVerificationDoc);

// Dashboard Routes
routes.get('/dashboard/stats', protect, isLawyer, lawyerController.getDashboardStats);
routes.get('/dashboard/analytics', protect, isLawyer, lawyerController.getAnalytics);

// Legal Service Routes
routes.post('/services', 
    protect, 
    isLawyer, 
    uploadSingle,
    lawyerController.createLegalService
  );
  
  routes.get('/services', protect, isLawyer, lawyerController.getLawyerServices);

// Appointment Routes
routes.get('/appointments', protect, isLawyer, lawyerController.getAppointments);
routes.patch('/appointments/:id/status', protect, isLawyer, lawyerController.updateAppointmentStatus);

// Consultation Routes
routes.get('/consultations', protect, isLawyer, lawyerController.getConsultations);
routes.post('/consultations/:id/notes', protect, isLawyer, lawyerController.addConsultationNote);

// Verification Routes
routes.post('/verification', 
  protect, 
  isLawyer, 
  uploadMultiple,
  lawyerController.submitVerification
);

// Availability Routes
routes.put('/availability', protect, isLawyer, lawyerController.updateAvailability);

// ✅ Update a lawyer's details
routes.put("/update/:id", lawyerController.updateLawyer);

// ✅ Delete a lawyer
routes.delete("/delete/:id", lawyerController.deleteLawyer);

// ✅ Update available slots for a lawyer
routes.patch("/:id/available-slots", lawyerController.updateAvailableSlots);


// ➡️ Dashboard APIs (New)
routes.get("/:id/dashboard", lawyerController.getDashboardStats); // Dashboard metrics
routes.get("/:id/appointments" ,lawyerController.getAppointments); // Filtered appointments
routes.patch("/appointments/:id", lawyerController.updateAppointmentStatus); // Update status

// Add to your existing routes
routes.get('/lawyer/mycases', 
    protect,
    isLawyer,
    lawyerController.getLawyerCases
  );
  
  routes.get('/lawyer/case-stats', 
    protect,
    isLawyer,
    lawyerController.getCaseStats
  );

// ➡️ Verification (New)
routes.post("/:id/verify",  lawyerController.submitVerification); // Submit docs
routes.patch("/:id/verify",lawyerController.approveVerification); // Admin approval

routes.post('/:id/verify', handleVerificationUpload,lawyerController.submitVerification
  );

module.exports = routes