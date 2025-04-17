const express = require('express');
const routes = express.Router();
const clientController = require('../contollers/ClientController');
const authMiddleware = require('../middleware/AuthMiddleware');


// Client registration
routes.post('/', clientController.registerClient);

// Client profile
routes.get('/:id', clientController.getClientProfile);

// Lawyer representation
routes.post('/:clientId/lawyers/:lawyerId', clientController.addClientLawyer);

// Case management
routes.post('/:clientId/cases', clientController.createCase);

// Document logging (after actual file upload)
routes.post('/:clientId/documents', clientController.logDocument);

routes.get('/stats/dashboard', clientController.getClientStats);
routes.post('/:clientId/contacts', clientController.addContactRecord);
routes.get('/:clientId/documents/search', clientController.searchClientDocuments);
routes.get('/:clientId/billing', clientController.getBillingHistory);


module.exports = routes;