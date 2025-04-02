// const express = require("express");
// const router = express.Router();
// const AppointmentController = require("../contollers/AppointmentController");

// // Route to create an appointment
// router.post("/addappointments", AppointmentController.createAppointment);

// // Route to get all appointments
// router.get("/getappointments", AppointmentController.getAppointments);

// // Route to delete an appointment by ID
// router.delete("/deleteappointments/:id", AppointmentController.deleteAppointment);

// module.exports = router;



const express = require("express");
const router = express.Router();
const AppointmentController = require("../contollers/AppointmentController");

// Route to create an appointment
router.post("/addappointments", AppointmentController.createAppointment);

// Route to get all appointments
router.get("/getappointments", AppointmentController.getAppointments);

//route to get appointment by Id
router.get("/getappoimtmentby/:id", AppointmentController.getAppointmentById);

//route to update appointment
router.put("/updateappointment/:id",AppointmentController.updateAppointment)

// Route to delete an appointment by ID
router.delete("/deleteappointments/:id", AppointmentController.deleteAppointment);

module.exports = router;
