const routes = require("express").Router();
const contactController = require("../contollers/ContactController");

routes.post("/contact", contactController.submitContactForm);
routes.get("/contacts", contactController.getAllMessages);

module.exports = routes;
