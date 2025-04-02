const express = require("express");
const ServiceController = require("../contollers/ServiceController");

const router = express.Router();

router.get("/getservice", ServiceController.getAllServices);
router.post("/addservice", ServiceController.addService);
router.delete("/deleteserviceby/:id", ServiceController.deleteServiceById);

module.exports = router;
