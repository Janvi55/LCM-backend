const routes = require('express').Router()
const lawyerController= require('../contollers/LawyerController')
// ✅ Add a new lawyer
routes.post("/addlawyer", lawyerController.addLawyer);

// ✅ Get all lawyers
routes.get("/", lawyerController.getAllLawyers);

// ✅ Get a lawyer by ID
routes.get("/getlawyerby/:id", lawyerController.getLawyerById);

routes.get("/", lawyerController.getTopRatedLawyers);


// ✅ Update a lawyer's details
routes.put("/update/:id", lawyerController.updateLawyer);

// ✅ Delete a lawyer
routes.delete("/delete/:id", lawyerController.deleteLawyer);

// ✅ Update available slots for a lawyer
routes.patch("/:id/available-slots", lawyerController.updateAvailableSlots);
module.exports = routes