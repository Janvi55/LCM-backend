const express = require('express');
const routes = express.Router();
const serviceController = require('../contollers/ServiceController');
const  protect = require("../middleware/AuthMiddleware")
const  isLawyer  = require('../middleware/AuthMiddleware');
const isAdmin = require('../middleware/AuthMiddleware')


// Public routes
routes.get('/', serviceController.getAllServices);
routes.get('/:serviceId/lawyers', serviceController.getLawyersBySpecialization);

routes.use(protect)
// Admin routes
routes.post('/', isAdmin, serviceController.createService);

// Lawyer routes
routes.post('/specializations',  isLawyer, serviceController.addSpecialization);
routes.delete('/specializations',  isLawyer, serviceController.removeSpecialization);

module.exports = routes;