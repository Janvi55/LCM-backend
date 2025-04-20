// routes/v1/publicRoutes.js
const express = require('express');
const routes = express.Router();
const legalCategoryController = require('../contollers/LegalCategoryController');

// Category directory
routes.get('/categories', legalCategoryController.getAllCategories);
routes.get('/categories/:slug', legalCategoryController.getCategoryDetails);
routes.get('/categories/:slug/lawyers', legalCategoryController.getLawyersByCategory);
routes.get('/categories/:slug/services', legalCategoryController.getServicesByCategory);
routes.get('/categories/:slug/meta', legalCategoryController.getCategoryMetadata);

// Search
routes.get('/search/categories', legalCategoryController.searchCategories);

module.exports = routes;