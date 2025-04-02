const express = require("express");
const FAQ = require("../contollers/FaqController");

const router = express.Router();

router.get("/getfaq", FAQ.getAllFAQs);
router.post("/addfaq", FAQ.addFAQ);
router.delete("/deletefaq/:id", FAQ.deleteFAQById);

module.exports = router;
