// routes/consultationRoutes.js
const express = require('express');
const routes = express.Router();
const consultationController = require('../contollers/ConsultationController');
const  protect = require("../middleware/AuthMiddleware")
const  isLawyer  = require('../middleware/AuthMiddleware');


routes.use(protect);
// Public routes
routes.post('/',  consultationController.bookConsultation);

// Lawyer-specific routes
routes.get('/lawyer/myconsultations',  isLawyer, consultationController.getLawyerConsultations);
routes.get('/lawyer/:id',  isLawyer, consultationController.getConsultationById);
routes.patch('/lawyer/:id/status', isLawyer, consultationController.updateConsultationStatus);
routes.post('/lawyer/:id/notes',  isLawyer, consultationController.addConsultationNote);
routes.put('/lawyer/:id/meeting-link',  isLawyer, consultationController.updateMeetingLink);

module.exports = routes;