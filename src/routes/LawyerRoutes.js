const routes = require('express').Router()

const lawyerController= require('../contollers/LawyerController');



routes.get("/lawyers",lawyerController.getLawyerData)
routes.post("/lawyer",lawyerController.signupLawyer)
routes.post("/lawyerWithFile",lawyerController.signupLawyerWithFile)
routes.post("/lawyerLogin",lawyerController.lawyerLogin)   
routes.delete("/lawyer/:id",lawyerController.deleteLawyer)
routes.get("/lawyer/topRated",lawyerController.getTopRatedLawyers)
routes.get("/lawyer/:id",lawyerController.getLawyerById)
routes.get("/lawyers/:specialization",lawyerController.getLawyersBySpecialization)
routes.post("/lawyer/forgotPassword",lawyerController.forgotPassword)
routes.post("/lawyer/resetPassword",lawyerController.resetPassword)



module.exports = routes 



//------------------------------------------------------------------------------------------------

// routes.use(authMiddleware)

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + path.extname(file.originalname))
//     }
//   });
  
//   const uploadSingle = multer({ storage: storage }).single('document');
//   const uploadMultiple = multer({ storage: storage }).array('documents', 5);
// // ✅ Add a new lawyer
// routes.post("/addlawyer", lawyerController.addLawyer);

// // ✅ Get all lawyers
// routes.get("/", lawyerController.getAllLawyers);

// // ✅ Get a lawyer by ID
// routes.get("/getlawyerby/:id", lawyerController.getLawyerById);

// routes.get("/toprated", lawyerController.getTopRatedLawyers);

// // routes.get("/:city", lawyerController.getLawyersByCity); 
// // Lawyer Profile Routes
// routes.get('/profile', protect, isLawyer, lawyerController.getLawyerProfile);
// routes.put('/profile', protect, isLawyer, lawyerController.updateLawyerProfile);

// // routes.get('/specialization', lawyerController.getLawyersBySpecialization); // Public
// // routes.post('/complete-profile', protect, isLawyer, lawyerController.completeProfile);
// // routes.post('/verify', protect, isLawyer, uploadSingle('document'), lawyerController.uploadVerificationDoc);

// // Dashboard Routes
// routes.get('/dashboard/stats', protect, isLawyer, lawyerController.getDashboardStats);
// routes.get('/dashboard/analytics', protect, isLawyer, lawyerController.getAnalytics);
// routes.put('/practice-areas' ,protect, isLawyer,lawyerController.updatePracticeAreas); // Update practice areas

// // Dashboard Routes
// routes.put('/dashboard/overview' ,protect, isLawyer,lawyerController.updatePracticeAreas); 

// // Legal Service Routes
// routes.post('/services', 
//     protect, 
//     isLawyer, 
//     uploadSingle,
//     lawyerController.createService
//   );

//   routes.get(
//     '/services/category/:categoryId',
//     protect,
//     isLawyer,
//     lawyerController.getLawyerServicesByCategory
//   );
  
//   // Update practice areas
//   routes.put(
//     '/practice-areas',
//     protect,
//     isLawyer,
//     lawyerController.updatePracticeAreas
//   );
  
//   routes.get('/services', protect, isLawyer, lawyerController.getLawyerServices);

// // Appointment Routes
// routes.get('/appointments', protect, isLawyer, lawyerController.getAppointments);
// routes.patch('/appointments/:id/status', protect, isLawyer, lawyerController.updateAppointmentStatus);

// // Consultation Routes
// routes.get('/consultations', protect, isLawyer, lawyerController.getConsultations);
// routes.post('/consultations/:id/notes', protect, isLawyer, lawyerController.addConsultationNote);

// // Verification Routes
// routes.post('/verification', 
//   protect, 
//   isLawyer, 
//   uploadMultiple,
//   lawyerController.submitVerification
// );

// // Availability Routes
// routes.put('/availability', protect, isLawyer, lawyerController.updateAvailability);

// // ✅ Update a lawyer's details
// routes.put("/update/:id", lawyerController.updateLawyer);

// // ✅ Delete a lawyer
// routes.delete("/delete/:id", lawyerController.deleteLawyer);

// // ✅ Update available slots for a lawyer
// routes.patch("/:id/available-slots", lawyerController.updateAvailableSlots);


// // ➡️ Dashboard APIs (New)
// routes.get("/:id/dashboard", lawyerController.getDashboardStats); // Dashboard metrics
// routes.get("/:id/appointments" ,lawyerController.getAppointments); // Filtered appointments
// routes.patch("/appointments/:id", lawyerController.updateAppointmentStatus); // Update status

// // Add to your existing routes
// routes.get('/lawyer/mycases', 
//     protect,
//     isLawyer,
//     lawyerController.getLawyerCases
//   );
  
//   routes.get('/lawyer/case-stats', 
//     protect,
//     isLawyer,
//     lawyerController.getCaseStats
//   );

// // ➡️ Verification (New)
// routes.post("/:id/verify",  lawyerController.submitVerification); // Submit docs
// routes.patch("/:id/verify",lawyerController.approveVerification); // Admin approval

// routes.post('/:id/verify', handleVerificationUpload,lawyerController.submitVerification
//   );

// module.exports = routes