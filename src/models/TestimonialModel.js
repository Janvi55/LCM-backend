const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  feedback: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
