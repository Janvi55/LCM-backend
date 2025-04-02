// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//   },
//   date: {
//     type: Date,
//     required: true,
//   },
// });

// const Appointment = mongoose.model("Appointment", appointmentSchema);
// module.exports = Appointment;



const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Lawyer", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' } // Default status for appointments
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
