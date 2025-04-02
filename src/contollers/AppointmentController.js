// const Appointment = require("../models/AppointmentModel");

// // Create a new appointment
// exports.createAppointment = async (req, res) => {
//   try {
//     const { name, email, date } = req.body;
//     const newAppointment = new Appointment({ name, email, date });
//     await newAppointment.save();
//     res.status(201).json({ message: "Appointment booked successfully", newAppointment });
//   } catch (error) {
//     res.status(500).json({ message: "Error booking appointment", error });
//   }
// };

// // Get all appointments
// exports.getAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find();
//     res.status(200).json(appointments);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching appointments", error });
//   }
// };

// // Delete an appointment
// exports.deleteAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Appointment.findByIdAndDelete(id);
//     res.status(200).json({ message: "Appointment deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting appointment", error });
//   }
// };




const Appointment = require("../models/AppointmentModel");

// Create a new appointment
// @route POST /api/appointments
// @access Private (User only)
exports.createAppointment = async (req, res) => {
  try {
    const { name, email, lawyerId, date, time, reason } = req.body;
    const newAppointment = new Appointment({ name, email, lawyerId, date, time, reason });
    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully", newAppointment });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error });
  }
};

// Get all appointments
// @route GET /api/appointments
// @access Private (Admin only)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("lawyerId", "userId","name specialization");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error });
  }
};

// @route GET /api/appointments/:id
// @access Private (User & Admin)
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate("user lawyer", "name email");
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @route PUT /api/appointments/:id
// @access Private (User & Admin)
exports.updateAppointment = async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete an appointment
// @route DELETE /api/appointments/:id
// @access Private (Admin only)
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error });
  }
};
