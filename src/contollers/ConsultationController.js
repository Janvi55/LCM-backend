// const Consultation = require('../models/ConsultationModel');
// const LegalService = require('../models/LegalServicesModel');
// const userModel = require('../models/UserModel');
// const { mailUtil} = require('../utils/MailUtil');
// const LawyerModel = require('../models/LawyerModel');


// // Book a new consultation
// exports.bookConsultation = async (req, res) => {
//   try {
//     const { legalServiceId, date, startTime, endTime, notes } = req.body;
    
//     // Get service and verify it exists
//     const service = await LegalService.findById(legalServiceId);
//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: 'Service not found'
//       });
//     }

//     // Verify time slot is available
//     const isSlotAvailable = service.timeSlots.some(slot => 
//       slot.date.toISOString() === new Date(date).toISOString() &&
//       slot.startTime === startTime &&
//       slot.endTime === endTime
//     );

//     if (!isSlotAvailable) {
//       return res.status(400).json({
//         success: false,
//         error: 'Selected time slot is not available'
//       });
//     }

//     // Create consultation
//     const consultation = new Consultation({
//         legalServiceId,
//       lawyerId: service.lawyerId,
//       clientId: req.user._id || req.user.id,
//       date,
//       startTime,
//       endTime,
//       consultationType: service.timeSlots.find(slot => 
//         slot.date.toISOString() === new Date(date).toISOString() &&
//         slot.startTime === startTime &&
//         slot.endTime === endTime
//       ).consultationType,
//       price: service.price,
//       notes
//     });

//     await consultation.save();

//     // Add to lawyer's consultations
//     const lawyer = await LawyerModel.findById(service.lawyerId);
//     lawyer.consultations.push(consultation._id);
//     await lawyer.save();

//     // Send confirmation emails
//     const lawyerUser = await userModel.findById(lawyer.userId);
//     const clientUser = await userModel.findById(req.user._id || req.user.id);

//     await mailUtil({
//       email: clientUser.mailUtil,
//       subject: 'Consultation Booked',
//       message: `Your consultation with ${lawyerUser.firstName} ${lawyerUser.lastName} has been booked for ${date} at ${startTime}.`
//     });

//     await mailUtil({
//       email: lawyerUser.mailUtil,
//       subject: 'New Consultation Booking',
//       message: `You have a new consultation with ${clientUser.firstName} ${clientUser.lastName} on ${date} at ${startTime}.`
//     });

//     res.status(201).json({
//       success: true,
//       data: consultation
//     });

//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Get all consultations for a user (client or lawyer)
// exports.getConsultations = async (req, res) => {
//   try {
//     const { role } = req.user;
//     let consultations;

//     if (role === 'lawyer') {
//       const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//       consultations = await Consultation.find({ lawyerId: lawyer._id })
//         .populate('serviceId', 'title')
//         .populate('clientId', 'firstName lastName email')
//         .sort({ date: -1 });
//     } else {
//       consultations = await Consultation.find({ clientId: req.user._id || req.user.id})
//         .populate('serviceId', 'title')
//         .populate({
//           path: 'lawyerId',
//           select: 'userId',
//           populate: {
//             path: 'userId',
//             select: 'firstName lastName'
//           }
//         })
//         .sort({ date: -1 });
//     }

//     res.json({
//       success: true,
//       count: consultations.length,
//       data: consultations
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Get single consultation
// exports.getConsultation = async (req, res) => {
//   try {
//     const consultation = await Consultation.findById(req.params.id)
//       .populate('serviceId', 'title description')
//       .populate({
//         path: 'lawyerId',
//         select: 'userId',
//         populate: {
//           path: 'userId',
//           select: 'firstName lastName email phone'
//         }
//       })
//       .populate('clientId', 'firstName lastName email phone');

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found'
//       });
//     }

//     // Verify user is either the client or lawyer
//     const isClient = consultation.clientId.equals(req.user._id || req.user.id);
//     let isLawyer = false;
    
//     if (req.user.role === 'lawyer') {
//       const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//       isLawyer = consultation.lawyerId.equals(lawyer._id);
//     }

//     if (!isClient && !isLawyer) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to view this consultation'
//       });
//     }

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Update consultation status
// exports.updateConsultationStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const consultation = await Consultation.findById(req.params.id);

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found'
//       });
//     }

//     // Verify user is the lawyer
//     if (req.user.role === 'lawyer') {
//       const lawyer = await LawyerModel.findOne({userId: req.user._id  || req.user.id });
//       if (!consultation.lawyerId.equals(lawyer._id)) {
//         return res.status(401).json({
//           success: false,
//           error: 'Not authorized to update this consultation'
//         });
//       }
//     } else {
//       // Clients can only cancel
//       if (status !== 'cancelled' || !consultation.clientId.equals(req.user._id)) {
//         return res.status(401).json({
//           success: false,
//           error: 'Not authorized to update this consultation'
//         });
//       }
//     }

//     consultation.status = status;
//     await consultation.save();

//     // Notify both parties
//     const lawyer = await LawyerModel.findById(consultation.lawyerId)
//       .populate('userId', 'email firstName lastName');
//     const client = await User.findById(consultation.clientId);

//     await mailUtil({
//       email: client.mailUtil,
//       subject: `Consultation ${status}`,
//       message: `Your consultation with ${lawyer.userId.firstName} ${lawyer.userId.lastName} has been ${status}.`
//     });

//     await mailUtil({
//       email: lawyer.userId.mailUtil,
//       subject: `Consultation ${status}`,
//       message: `Your consultation with ${client.firstName} ${client.lastName} has been ${status}.`
//     });

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Add consultation note
// exports.addConsultationNote = async (req, res) => {
//   try {
//     const { note } = req.body;
//     const consultation = await Consultation.findById(req.params.id);

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found'
//       });
//     }

//     // Verify user is the lawyer
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//     if (!lawyer || !consultation.lawyerId.equals(lawyer._id)) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to add notes to this consultation'
//       });
//     }

//     consultation.notes.push(note);
//     await consultation.save();

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Update meeting link (for virtual consultations)
// exports.updateMeetingLink = async (req, res) => {
//   try {
//     const { meetingLink } = req.body;
//     const consultation = await Consultation.findById(req.params.id);

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found'
//       });
//     }

//     // Verify user is the lawyer
//     const lawyer = await LawyerModel.findOne({userId: req.user._id  || req.user.id });
//     if (!lawyer || !consultation.lawyerId.equals(lawyer._id)) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to update this consultation'
//       });
//     }

//     consultation.meetingLink = meetingLink;
//     await consultation.save();

//     // Notify client
//     const client = await userModel.findById(consultation.clientId);

//     await mailUtil({
//       email: client.mailUtil,
//       subject: 'Meeting Link Updated',
//       message: `The meeting link for your consultation has been updated: ${meetingLink}`
//     });

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };






// controllers/ConsultationController.js



//2
// const Consultation = require('../models/ConsultationModel');
// const LegalService = require('../models/LegalServicesModel');
// const userModel = require('../models/UserModel');
// const mailUtil  = require('../utils/MailUtil');
// const LawyerModel = require('../models/LawyerModel');

// // Book a new consultation (client can book)
// exports.bookConsultation = async (req, res) => {
//   try {
//     const { legalServiceId, date, startTime, endTime, notes } = req.body;
    
//     const service = await LegalService.findById(legalServiceId);
//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: 'Service not found'
//       });
//     }

//     const isSlotAvailable = service.timeSlots.some(slot => 
//       slot.date.toISOString() === new Date(date).toISOString() &&
//       slot.startTime === startTime &&
//       slot.endTime === endTime
//     );

//     if (!isSlotAvailable) {
//       return res.status(400).json({
//         success: false,
//         error: 'Selected time slot is not available'
//       });
//     }

//     const consultation = new Consultation({
//       legalServiceId,
//       lawyerId: service.lawyerId,
//       clientId: req.user._id || req.user.id,
//       date,
//       startTime,
//       endTime,
//       consultationType: service.timeSlots.find(slot => 
//         slot.date.toISOString() === new Date(date).toISOString() &&
//         slot.startTime === startTime &&
//         slot.endTime === endTime
//       ).consultationType,
//       price: service.price,
//       notes
//     });

//     await consultation.save();

//     const lawyer = await LawyerModel.findById(service.lawyerId);
//     lawyer.consultations.push(consultation._id);
//     await lawyer.save();

//     const lawyerUser = await userModel.findById(lawyer.userId);
//     const clientUser = await userModel.findById(req.user._id || req.user.id);

//     await mailUtil.sendingMail({
//       email: clientUser.email,
//       subject: 'Consultation Booked',
//       message: `Your consultation with ${lawyerUser.firstName} ${lawyerUser.lastName} has been booked for ${date} at ${startTime}.`
//     });

//     await mailUtil.sendingMail({
//       email: lawyerUser.email,
//       subject: 'New Consultation Booking',
//       message: `You have a new consultation with ${clientUser.firstName} ${clientUser.lastName} on ${date} at ${startTime}.`
//     });

//     res.status(201).json({
//       success: true,
//       data: consultation
//     });

//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Get lawyer's own consultations
// exports.getLawyerConsultations = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const consultations = await Consultation.find({ lawyerId: lawyer._id })
//       .populate('legalServiceId', 'title')
//       .populate('clientId', 'firstName lastName email')
//       .sort({ date: -1 });

//     res.json({
//       success: true,
//       count: consultations.length,
//       data: consultations
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Get single consultation (lawyer can view their own)
// exports.getConsultationById = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
//     const consultation = await Consultation.findOne({
//       _id: req.params.id,
//       lawyerId: lawyer._id
//     })
//     .populate('legalServiceId', 'title description')
//     .populate({
//       path: 'clientId',
//       select: 'firstName lastName email phone'
//     });

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found or unauthorized'
//       });
//     }

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Update consultation status (lawyer can update)
// exports.updateConsultationStatus = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
//     const consultation = await Consultation.findOneAndUpdate(
//       { 
//         _id: req.params.id,
//         lawyerId: lawyer._id 
//       },
//       { status: req.body.status },
//       { new: true }
//     )
//     .populate('legalServiceId', 'title')
//     .populate('clientId', 'firstName lastName email');

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found or unauthorized'
//       });
//     }

//     // Notify both parties
//     const lawyerUser = await userModel.findById(lawyer.userId);
//     const clientUser = await userModel.findById(consultation.clientId);

//     await mailUtil.sendingMail({
//       email: clientUser.email,
//       subject: `Consultation ${req.body.status}`,
//       message: `Your consultation with ${lawyerUser.firstName} ${lawyerUser.lastName} has been ${req.body.status}.`
//     });

//     await mailUtil.sendingMail({
//       email: lawyerUser.email,
//       subject: `Consultation ${req.body.status}`,
//       message: `Your consultation with ${clientUser.firstName} ${clientUser.lastName} has been ${req.body.status}.`
//     });

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Add note to consultation (lawyer only)
// exports.addConsultationNote = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
//     const consultation = await Consultation.findOneAndUpdate(
//       { 
//         _id: req.params.id,
//         lawyerId: lawyer._id 
//       },
//       { $push: { notes: req.body.note } },
//       { new: true }
//     );

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found or unauthorized'
//       });
//     }

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Update meeting link (lawyer only)
// exports.updateMeetingLink = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
//     const consultation = await Consultation.findOneAndUpdate(
//       { 
//         _id: req.params.id,
//         lawyerId: lawyer._id 
//       },
//       { meetingLink: req.body.meetingLink },
//       { new: true }
//     );

//     if (!consultation) {
//       return res.status(404).json({
//         success: false,
//         error: 'Consultation not found or unauthorized'
//       });
//     }

//     // Notify client
//     const clientUser = await userModel.findById(consultation.clientId);

//     await mailUtil.sendingMail({
//       email: clientUser.email,
//       subject: 'Meeting Link Updated',
//       message: `The meeting link for your consultation has been updated: ${req.body.meetingLink}`
//     });

//     res.json({
//       success: true,
//       data: consultation
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };



//3



const Consultation = require('../models/ConsultationModel');
const LegalService = require('../models/LegalServicesModel');
const userModel = require('../models/UserModel');
const mailUtil = require('../utils/MailUtil');
const LawyerModel = require('../models/LawyerModel');

// Helper function to validate and send emails
const sendEmailSafely = async (recipientEmail, subject, message) => {
  if (!recipientEmail) {
    console.error('Email not sent - missing recipient:', { subject });
    return;
  }

  try {
    await mailUtil.sendingMail({
      email: recipientEmail,
      subject,
      message
    });
  } catch (emailError) {
    console.error('Email sending failed:', {
      error: emailError.message,
      recipient: recipientEmail,
      subject
    });
  }
};

// Book a new consultation (client can book)
exports.bookConsultation = async (req, res) => {
  try {
    const { legalServiceId, date, startTime, endTime, notes } = req.body;
    
    const service = await LegalService.findById(legalServiceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    const isSlotAvailable = service.timeSlots.some(slot => {
      const slotDate = new Date(slot.date).toISOString().split('T')[0];
      const reqDate = new Date(date).toISOString().split('T')[0];
      return (
        slotDate === reqDate &&
        slot.startTime === startTime &&
        slot.endTime === endTime
      );
    });

    if (!isSlotAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }

    const consultation = new Consultation({
      legalServiceId,
      lawyerId: service.lawyerId,
      clientId: req.user._id || req.user.id,
      date,
      startTime,
      endTime,
      consultationType: service.timeSlots.find(slot => {
        const slotDate = new Date(slot.date).toISOString().split('T')[0];
        const reqDate = new Date(date).toISOString().split('T')[0];
        return (
          slotDate === reqDate &&
          slot.startTime === startTime &&
          slot.endTime === endTime
        );
      }).consultationType,
      price: service.price,
      notes,
      status: 'pending'
    });

    await consultation.save();

    const lawyer = await LawyerModel.findById(service.lawyerId);
    if (lawyer) {
      lawyer.consultations.push(consultation._id);
      await lawyer.save();
    }

    const lawyerUser = await userModel.findById(lawyer?.userId);
    const clientUser = await userModel.findById(req.user._id || req.user.id);

    // Debug logs
    console.log('Email recipients:', {
      lawyerEmail: lawyerUser?.email,
      clientEmail: clientUser?.email
    });

    // Send emails (won't throw errors if fails)
    if (clientUser?.email) {
      await sendEmailSafely(
        clientUser.email,
        'Consultation Booked',
        `Your consultation with ${lawyerUser?.firstName || 'the lawyer'} has been booked for ${date} at ${startTime}.`
      );
    }

    if (lawyerUser?.email) {
      await sendEmailSafely(
        lawyerUser.email,
        'New Consultation Booking',
        `You have a new consultation with ${clientUser?.firstName || 'a client'} on ${date} at ${startTime}.`
      );
    }

    res.status(201).json({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get lawyer's own consultations
exports.getLawyerConsultations = async (req, res) => {
    try {
      const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
      if (!lawyer) {
        return res.status(404).json({
          success: false,
          error: "Lawyer profile not found"
        });
      }
  
      // Base query
      let query = { lawyerId: lawyer._id };
      
      // Handle filter parameter
      if (req.query.filter === 'upcoming') {
        query.date = { $gte: new Date() }; // Only future dates
        query.status = { $in: ['pending', 'confirmed'] }; // Only active statuses
      } else if (req.query.filter === 'past') {
        query.date = { $lt: new Date() }; // Only past dates
      } else if (req.query.filter === 'cancelled') {
        query.status = 'cancelled';
      }
  
      const consultations = await Consultation.find(query)
        .populate('legalServiceId', 'title')
        .populate('clientId', 'firstName lastName email')
        .sort({ date: 1 }); // Sort ascending for upcoming
  
      res.json({
        success: true,
        count: consultations.length,
        data: consultations
      });
    } catch (error) {
      console.error('Get consultations error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
// Get single consultation (lawyer can view their own)
exports.getConsultationById = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      lawyerId: lawyer._id
    })
    .populate('legalServiceId', 'title description')
    .populate({
      path: 'clientId',
      select: 'firstName lastName email phone'
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update consultation status (lawyer can update)
exports.updateConsultationStatus = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const consultation = await Consultation.findOneAndUpdate(
      { 
        _id: req.params.id,
        lawyerId: lawyer._id 
      },
      { status: req.body.status },
      { new: true }
    )
    .populate('legalServiceId', 'title')
    .populate('clientId', 'firstName lastName email');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found or unauthorized'
      });
    }

    const lawyerUser = await userModel.findById(lawyer.userId);
    const clientUser = await userModel.findById(consultation.clientId);

    // Send status update emails
    if (clientUser?.email) {
      await sendEmailSafely(
        clientUser.email,
        `Consultation ${req.body.status}`,
        `Your consultation status has been updated to ${req.body.status}.`
      );
    }

    if (lawyerUser?.email) {
      await sendEmailSafely(
        lawyerUser.email,
        `Consultation Status Update`,
        `You've updated consultation ID ${consultation._id} to ${req.body.status}.`
      );
    }

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Add note to consultation (lawyer only)
exports.addConsultationNote = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const consultation = await Consultation.findOneAndUpdate(
      { 
        _id: req.params.id,
        lawyerId: lawyer._id 
      },
      { $push: { notes: req.body.note } },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update meeting link (lawyer only)
exports.updateMeetingLink = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const consultation = await Consultation.findOneAndUpdate(
      { 
        _id: req.params.id,
        lawyerId: lawyer._id 
      },
      { meetingLink: req.body.meetingLink },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found or unauthorized'
      });
    }

    const clientUser = await userModel.findById(consultation.clientId);

    if (clientUser?.email) {
      await sendEmailSafely(
        clientUser.email,
        'Meeting Link Updated',
        `The meeting link for your consultation has been updated: ${req.body.meetingLink}`
      );
    }

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Update meeting link error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};