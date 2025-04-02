const express = require("express");
const TestimonialController = require("../contollers/TestimonialController");

const router = express.Router();

router.get("/gettestimonails", TestimonialController.getAllTestimonials);
router.post("/addtestimonial", TestimonialController.addTestimonial);
router.delete("/deletetestimonial/:id", TestimonialController.deleteTestimonialById);

module.exports = router;
