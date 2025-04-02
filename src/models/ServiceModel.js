const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String }, // Store icon URL
});

module.exports = mongoose.model("Service", serviceSchema);
