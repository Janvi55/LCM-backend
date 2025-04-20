const routes = require("express").Router();
const contactController = require("../contollers/ContactController");

routes.get("/contactUs/:id",contactController.getContactById)
routes.post("/contactUs",contactController.addContact)
routes.delete("/contactUs/:id",contactController.deleteContact)

module.exports = routes;
