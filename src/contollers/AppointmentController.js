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




// const Appointment = require("../models/AppointmentModel");

// // Create a new appointment
// // @route POST /api/appointments
// // @access Private (User only)
// exports.createAppointment = async (req, res) => {
//   try {
//     const { name, email, lawyerId, date, time, reason } = req.body;
//     const newAppointment = new Appointment({ name, email, lawyerId, date, time, reason });
//     await newAppointment.save();
//     res.status(201).json({ message: "Appointment booked successfully", newAppointment });
//   } catch (error) {
//     res.status(500).json({ message: "Error booking appointment", error });
//   }
// };

// // Get all appointments
// // @route GET /api/appointments
// // @access Private (Admin only)
// exports.getAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find().populate("lawyerId", "userId","name specialization");
//     res.status(200).json(appointments);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching appointments", error });
//   }
// };

// // @route GET /api/appointments/:id
// // @access Private (User & Admin)
// exports.getAppointmentById = async (req, res) => {
//     try {
//         const appointment = await Appointment.findById(req.params.id).populate("user lawyer", "name email");
//         if (!appointment) {
//             return res.status(404).json({ message: "Appointment not found" });
//         }
//         res.status(200).json(appointment);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// // @route PUT /api/appointments/:id
// // @access Private (User & Admin)
// exports.updateAppointment = async (req, res) => {
//     try {
//         const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedAppointment) {
//             return res.status(404).json({ message: "Appointment not found" });
//         }
//         res.status(200).json(updatedAppointment);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// // Delete an appointment
// // @route DELETE /api/appointments/:id
// // @access Private (Admin only)
// exports.deleteAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Appointment.findByIdAndDelete(id);
//     res.status(200).json({ message: "Appointment deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting appointment", error });
//   }
// };






// controllers/AppointmentController.js

const AppointmentModel = require("../models/AppointmentModel");
const LawyerModel = require("../models/LawyerModel");

// Create appointment (client can book)
exports.createAppointment = async (req, res) => {
  try {
    const { name, email, lawyerId, date, time, reason } = req.body;
    const newAppointment = new Appointment({ 
      name, 
      email, 
      lawyerId, 
      date, 
      time, 
      reason 
    });
    await newAppointment.save();
    res.status(201).json({ 
      success: true,
      message: "Appointment booked successfully", 
      data: newAppointment 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get lawyer's own appointments
exports.getLawyerAppointments = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id});
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const appointments = await AppointmentModel.find({ lawyerId: lawyer._id })
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single appointment (lawyer can view their own)
exports.getAppointmentById = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
    const appointment = await AppointmentModel.findOne({
      _id: req.params.id,
      lawyerId: lawyer._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found or unauthorized"
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update appointment status (lawyer can update)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id});
    const appointment = await AppointmentModel.findOneAndUpdate(
      { 
        _id: req.params.id,
        lawyerId: lawyer._id 
      },
      { status: req.body.status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found or unauthorized"
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Admin can still get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.find()
      .populate("lawyerId", "userId specialization")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};