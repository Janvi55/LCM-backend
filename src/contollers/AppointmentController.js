
const appointmentModel = require("../models/AppointmentModel");
const LawyerModel = require("../models/LawyerModel");
const mailUtil = require("../utils/MailUtil")


// const addAppointment = async(req,res) =>{

//   try{

//     const savedAppointment = await appointmentModel.create(req.body);
//     res.status(201).json({
//         message:"Appointment Booked",
//         data:savedAppointment
//     });  
    
//   }
//   catch (err){
//     res.status(500).json({
//        message:"error",
//        data:err 
//     });

//   }

// } 

const addAppointment = async (req, res) => {
  try {
    const newAppointment = new appointmentModel({ ...req.body, status: "Pending" });
    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      message: "Appointment Booked and Pending Confirmation",
      data: savedAppointment,
    });
  } catch (err) {
    res.status(500).json({ message: "Error booking appointment", error: err.message });
  }
};

   const getAllAppointment = async(req,res)=>{
      
   try{
 
    const appointments = await appointmentModel.find().populate("lawyerId userId");
    res.status(200).json({
        message:"fetched all appointments successfully",
        data:appointments
    });
     
    }

    catch(err){
        res.status(500).json({
            message:"error",
            data:err
        });

    }

   }

  //  const deleteAppointment = async(req,res)=>{
   
  //      const deletedAppointment = await appointmentModel.findByIdAndDelete(req.params.id)
   
  //      res.json({
  //          message:"Appointment deleted successfully.... ",
  //          data:deletedAppointment
  //      })
  //  }

  const deleteAppointment = async (req, res) => {
    try {
        const appointment = await appointmentModel.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found!" });
        }

        // Delete the appointment
        await appointmentModel.findByIdAndDelete(req.params.id);

        // Remove appointment from lawyer's list
        await LawyerModel.updateOne(
            { _id: appointment.lawyerId },
            { $pull: { appointments: req.params.id } }
        );

        res.json({ message: "Appointment deleted successfully!" });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ message: "Server error!" });
    }
};


   
   const getAllAppointmentsByUserId = async (req, res) => {
  
    try {
      const myAppointments = await appointmentModel
        .find({userId:req.params.userId})
        .populate("userId");
      if (myAppointments.length === 0) {
        res.status(404).json({ message: "No Appointments found" });
      } else {
        res.status(200).json({
          message: "Appointments found successfully",
          data: myAppointments,
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  const getAllAppointmentsByLawyerId = async (req, res) => {
  
    try {
      const myAppointments = await appointmentModel
        .find({lawyerId:req.params.lawyerId})
        .populate("lawyerId");
      if (myAppointments.length === 0) {
        res.status(404).json({ message: "No Appointments found" });
      } else {
        res.status(200).json({
          message: "Appointments found successfully",
          data: myAppointments,
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  //  const updateAppointment = async(req,res) => {
  //    try{

  //     const updatedAppointment = await appointmentModel.findByIdAndUpdate(
  //       req.params.id,
  //       req.body,
  //       { new: true }
  //     );
  //     res.status(200).json({
  //       message: "Appointment updated successfully",
  //       data: updatedAppointment,
  //     });

  //    }catch(err) {
  //     res.status(500).json({
  //     message: "error while update Appointment",
  //     err: err,
  //     });
  //   }
  // }

  const updateAppointment = async (req, res) => {
    try {
        // Fetch the existing appointment
        const appointment = await appointmentModel.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Prevent updates if the appointment is already accepted or rejected
        if (appointment.status !== "Pending") {
            return res.status(400).json({ message: "Cannot update an accepted or rejected appointment." });
        }

        // Prevent changing the lawyer after appointment confirmation
        if (req.body.lawyerId && req.body.lawyerId !== appointment.lawyerId) {
            return res.status(400).json({ message: "Cannot change lawyer after confirmation." });
        }


        // Update appointment
        const { appointmentDate, appointmentTime, consultationType, paymentStatus } = req.body;

        const updatedFields = { appointmentDate, appointmentTime, consultationType, paymentStatus };  

        const updatedAppointment = await appointmentModel.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true }
        );

        res.status(200).json({
            message: "Appointment updated successfully",
            data: updatedAppointment,
        });

    } catch (err) {
        res.status(500).json({
            message: "Error while updating appointment",
            error: err.message,
        });
    }
};

   
  const getAppointmentById= async(req,res)=>{
    try {
      const appointment = await appointmentModel.findById(req.params.id);
      if (!appointment) {
        res.status(404).json({ message: "No Appointment found" });
      } else {
        res.status(200).json({
          message: "Appointment found successfully",
          data: appointment,
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }


  // const updateAppointmentStatus = async (req, res) => {
  //   try {
  //     const { id } = req.params; // Appointment ID
  //     const { status } = req.body; // "Confirmed" or "Rejected"
  
  //     if (!["Confirmed", "Rejected"].includes(status)) {
  //       return res.status(400).json({ message: "Invalid status update" });
  //     }
  
  //     const updatedAppointment = await appointmentModel.findByIdAndUpdate(
  //       id,
  //       { status },
  //       { new: true }
  //     );
  
  //     if (!updatedAppointment) {
  //       return res.status(404).json({ message: "Appointment not found" });
  //     }
  
  //     res.status(200).json({
  //       message: `Appointment ${status} successfully`,
  //       data: updatedAppointment,
  //     });
  //   } catch (err) {
  //     res.status(500).json({ message: "Error updating appointment status", error: err.message });
  //   }
  // };



  const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["Confirmed", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        const appointment = await appointmentModel.findById(id).populate("userId");

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Predefined Zoom Meeting Link
        const zoomLink = "https://us02web.zoom.us/j/8611936318?pwd=cTlFTkRHQjZaLzYzQlRZTzkrSHBaUT09";

        // Update appointment status
        appointment.status = status;
        if (status === "Confirmed") {
            appointment.zoomLink = zoomLink; // Store Zoom link in DB
        } else {
            appointment.zoomLink = ""; // Remove Zoom link if rejected
        }
        await appointment.save();

        // Ensure user exists and has an email
        const user = appointment.userId;
        console.log(user)
        if (!user || !user.email) {
            return res.status(400).json({ message: "User details not found for email notification." });
        }
        

        // Prepare email details
        let subject, message;
        if (status === "Confirmed") {
            subject = "Appointment Confirmed";
            message = `Dear ${user.firstName} ${user.lastName} ,\n\nYour appointment has been confirmed.\nHere is your Zoom link: ${zoomLink}\n\nBest Regards,\nLegal Consultation Marketplace Team`;
        } else {
            subject = "Appointment Rejected";
            message = `Dear ${user.firstName} ${user.lastName} ,\n\nWe regret to inform you that your appointment request has been rejected.\n\nBest Regards,\nLegal Consultation Marketplace Team`;
        }

        // Send Email Notification
        try {
            await mailUtil.sendingMail(user.email, subject, message);
        } catch (emailError) {
            return res.status(500).json({ message: "Appointment updated, but email notification failed.", error: emailError.message });
        }

        res.status(200).json({
            message: `Appointment ${status} successfully updated and email sent.`,
            data: appointment,
        });

    } catch (err) {
        res.status(500).json({ message: "Error updating appointment status", error: err.message });
    }
};




const getPaymentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await appointmentModel.find({ userId })
      .populate("lawyerId", "name specialization")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};



// API to update appointment after successful payment
const updateAfterPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      amount,
    } = req.body;

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        paymentStatus: "Completed",
      },
      { new: true }
    ).populate("lawyerId userId");

    res.json({ success: true, data: updatedAppointment });
  } catch (err) {
    console.error("Payment update error:", err);
    res.status(500).json({ success: false, message: "Failed to update payment" });
  }
};

module.exports = {
  // ... your other functions
  updateAfterPayment,
};

  
module.exports = {
    addAppointment,getAllAppointment,deleteAppointment,getAllAppointmentsByUserId,updateAppointment,getAppointmentById,getAllAppointmentsByLawyerId,updateAppointmentStatus,getPaymentsByUserId,updateAfterPayment
}




















//------------------------------------------------------------------------
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

// const AppointmentModel = require("../models/AppointmentModel");
// const LawyerModel = require("../models/LawyerModel");

// // Create appointment (client can book)
// exports.createAppointment = async (req, res) => {
//   try {
//     const { name, email, lawyerId, date, time, reason } = req.body;
//     const newAppointment = new Appointment({ 
//       name, 
//       email, 
//       lawyerId, 
//       date, 
//       time, 
//       reason 
//     });
//     await newAppointment.save();
//     res.status(201).json({ 
//       success: true,
//       message: "Appointment booked successfully", 
//       data: newAppointment 
//     });
//   } catch (error) {
//     res.status(400).json({ 
//       success: false,
//       error: error.message 
//     });
//   }
// };

// // Get lawyer's own appointments
// exports.getLawyerAppointments = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id});
//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const appointments = await AppointmentModel.find({ lawyerId: lawyer._id })
//       .sort({ date: 1, time: 1 });

//     res.json({
//       success: true,
//       count: appointments.length,
//       data: appointments
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Get single appointment (lawyer can view their own)
// exports.getAppointmentById = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//     const appointment = await AppointmentModel.findOne({
//       _id: req.params.id,
//       lawyerId: lawyer._id
//     });

//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         error: "Appointment not found or unauthorized"
//       });
//     }

//     res.json({
//       success: true,
//       data: appointment
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Update appointment status (lawyer can update)
// exports.updateAppointmentStatus = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id});
//     const appointment = await AppointmentModel.findOneAndUpdate(
//       { 
//         _id: req.params.id,
//         lawyerId: lawyer._id 
//       },
//       { status: req.body.status },
//       { new: true }
//     );

//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         error: "Appointment not found or unauthorized"
//       });
//     }

//     res.json({
//       success: true,
//       data: appointment
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Admin can still get all appointments
// exports.getAppointments = async (req, res) => {
//   try {
//     const appointments = await AppointmentModel.find()
//       .populate("lawyerId", "userId specialization")
//       .sort({ date: -1 });

//     res.json({
//       success: true,
//       count: appointments.length,
//       data: appointments
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };