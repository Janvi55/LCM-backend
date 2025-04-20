
const routes = require("express").Router();

const appointmentController = require("../contollers/AppointmentController");

routes.get("/appointments",appointmentController.getAllAppointment);
routes.post("/appointment",appointmentController.addAppointment);
routes.delete("/deleteAppointment/:id",appointmentController.deleteAppointment);
routes.get("/appointmentByUserId/:userId",appointmentController.getAllAppointmentsByUserId);
routes.put("/updateAppointment/:id",appointmentController.updateAppointment);
routes.get("/getAppointmentById/:id",appointmentController.getAppointmentById);
routes.get("/appointmentByLawyerId/:lawyerId",appointmentController.getAllAppointmentsByLawyerId);
routes.put("/updateAppointmentStatus/:id",appointmentController.updateAppointmentStatus);
routes.get("/appointment/payments/:userId",appointmentController.getPaymentsByUserId)
routes.put("/appointment/confirmPayment",appointmentController.updateAfterPayment);



module.exports = routes






















//------------------------------------------------------------------------------------------
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



// const express = require("express");
// const routes = express.Router();
// const AppointmentController = require("../contollers/AppointmentController");

// // Route to create an appointment
// routes.post("/addappointments", AppointmentController.createAppointment);

// // Route to get all appointments
// routes.get("/getappointments", AppointmentController.getAppointments);

// //route to get appointment by Id
// routes.get("/getappoimtmentby/:id", AppointmentController.getAppointmentById);

// //route to update appointment
// routes.put("/updateappointment/:id",AppointmentController.updateAppointment)

// // Route to delete an appointment by ID
// routes.delete("/deleteappointments/:id", AppointmentController.deleteAppointment);

// module.exports = routes;





// routes/appointmentRoutes.js
// const express = require("express");
// const routes = express.Router();
// const appointmentController = require("../contollers/AppointmentController");
// const  protect = require("../middleware/AuthMiddleware")
// const  isLawyer  = require('../middleware/AuthMiddleware');

// // Public routes
// routes.post("/", appointmentController.createAppointment);

// routes.use(protect);

// // Lawyer-specific routes
// routes.get("/lawyer/myappointments",  isLawyer, appointmentController.getLawyerAppointments);
// routes.get("/lawyer/:id",  isLawyer, appointmentController.getAppointmentById);
// routes.patch("/lawyer/:id/status",  isLawyer, appointmentController.updateAppointmentStatus);

// // Admin routes
// routes.get("/",  appointmentController.getAppointments);

// module.exports = routes;