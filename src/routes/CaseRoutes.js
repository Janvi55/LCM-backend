const express = require('express');
const routes = express.Router();
const caseController = require('../contollers/CaseController');
const protect = require('../middleware/AuthMiddleware');
const isLawyer = require('../middleware/AuthMiddleware');

// Public routes (if needed)
// routes.get('/', caseController.getPublicCases);
// routes.get('/:id', caseController.getPublicCase);

// Protected routes
routes.use(protect);

// Lawyer-specific case routes
routes.post('/', 
  isLawyer,
  caseController.createCase
);

routes.get('/lawyer/mycases', 
  isLawyer,
  caseController.getLawyerCases
);

routes.get('/lawyer/mycases/:id', 
  isLawyer,
  caseController.getLawyerCase
);

routes.put('/:id', 
  isLawyer,
  caseController.updateCase
);

// Case management sub-routes
routes.post('/:id/hearings', 
  isLawyer,
  caseController.addHearing
);

routes.post('/:id/documents', 
  isLawyer,
  caseController.linkDocument
);

module.exports = routes;