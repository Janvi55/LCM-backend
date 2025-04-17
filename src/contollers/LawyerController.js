

const Appointment = require("../models/AppointmentModel");
const ConsultationModel = require("../models/ConsultationModel");
const LawyerModel = require("../models/LawyerModel");
const LegalServicesModel = require("../models/LegalServicesModel");
const { uploadFileToCloudinary } = require("../utils/CloudinaryUtil");

// ✅ Add Lawyer
const addLawyer = async (req, res) => {
  try {
    const savedLawyer = await LawyerModel.create(req.body);

    res.status(201).json({
      message: "Lawyer added successfully",
      data: savedLawyer,
    });
  } catch (error) {
    console.error("Error adding lawyer:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get All Lawyers
const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await LawyerModel.find()
      .populate("userId", "firstName lastName email") // Populates lawyer's user details
      .select("specialization experienceYears rating availableSlots consultationFee location");

    res.status(200).json({
      message: "All lawyers retrieved successfully",
      data: lawyers,
    });
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
const getLawyerProfile = async (req, res) => {
  try {
    // Use req.user._id to match what the middleware sets
    const lawyer = await LawyerModel.findOne({ userId:req.user.id || req.user._id  })
      .populate('userId', 'firstName lastName email phone')
      .populate({
        path: 'userId',
        select: 'firstName lastName email phone',
        model: 'users' // Explicit model name
      })
      .populate({
        path: 'specializations',
        model: 'Service' // Match your Service model name
      })
      .populate({
        path: 'services',
        model: 'LegalService' // Match your LegalService model name
      })
      .populate({
        path: 'clients',
        select: 'firstName lastName email',
        model: 'users' // Match your User model name
      })
      
    if (!lawyer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lawyer profile not found' 
      });
    }

    res.json({ 
      success: true, 
      data: lawyer 
    });
  } catch (error) {
    console.error('Error in getLawyerProfile:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
const updateLawyerProfile = async (req, res) => {
  try {
    const updates = req.body;
    const lawyer = await LawyerModel.findOneAndUpdate(
      { userId: req.user.id || req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone');

    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
    }

    res.json({ success: true, data: lawyer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ Get Lawyer By ID
const getLawyerById = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Following the format like in Service Controller
    console.log("Fetching lawyer with ID:", lawyerId);

    const lawyer = await LawyerModel.findById(lawyerId).populate("userId", "firstName lastName email");

    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Lawyer profile retrieved successfully",
      data: lawyer,
    });
  } catch (error) {
    console.error("Error fetching lawyer profile:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// Get top-rated lawyers
const getTopRatedLawyers = async (req, res) => {
  try {
    const lawyerId = req.params.id;
      const topLawyers = await LawyerModel.find().sort({ rating: -1 }).limit(5); // Fetch top 5 highest-rated lawyers

      const lawyer = await LawyerModel.findById(lawyerId).populate("userId", "firstName lastName email");
      res.status(200).json({ success: true, data: topLawyers });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching top-rated lawyers", error });
  }
};

// ✅ Update Lawyer Details
const updateLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Following consistent format
    const updatedLawyer = await LawyerModel.findByIdAndUpdate(lawyerId, req.body, { new: true });

    if (!updatedLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Lawyer details updated successfully",
      data: updatedLawyer,
    });
  } catch (error) {
    console.error("Error updating lawyer details:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Delete Lawyer
const deleteLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Consistent with other controllers
    const deletedLawyer = await LawyerModel.findByIdAndDelete(lawyerId);

    if (!deletedLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Lawyer deleted successfully",
      data: deletedLawyer,
    });
  } catch (error) {
    console.error("Error deleting lawyer:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Update Available Slots
const updateAvailableSlots = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Consistent ID format
    const { availableSlots } = req.body;

    const updatedLawyer = await LawyerModel.findByIdAndUpdate(
      lawyerId,
      { availableSlots },
      { new: true }
    );

    if (!updatedLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Available slots updated successfully",
      data: updatedLawyer,
    });
  } catch (error) {
    console.error("Error updating available slots:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// // Add to LawyerController.js
// const getDashboardStats = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user.id });
//     if (!lawyer) {
//       return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     // Current month calculations
//     const currentDate = new Date();
//     const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//     const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

//     const [
//       upcomingAppointments,
//       completedAppointments,
//       pendingConsultations,
//       totalEarnings,
//       monthlyEarnings,
//       clientCount,
//       serviceCount,
//       messages
//     ] = await Promise.all([
//       Appointment.countDocuments({
//         lawyerId: lawyer._id,
//         date: { 
//           $gte: new Date(),
//           $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//         },
//         status: 'confirmed'
//       }),
//       Appointment.countDocuments({
//         lawyerId: lawyer._id,
//         status: 'completed',
//         date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
//       }),
//       Consultation.countDocuments({
//         lawyerId: lawyer._id,
//         status: 'pending'
//       }),
//       Payment.aggregate([
//         { $match: { lawyerId: lawyer._id } },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]),
//       Payment.aggregate([
//         { 
//           $match: { 
//             lawyerId: lawyer._id,
//             createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
//           } 
//         },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]),
//       Appointment.distinct('clientId', { lawyerId: lawyer._id }),
//       LegalService.countDocuments({ 
//         lawyerId: lawyer._id,
//         status: 'active' 
//       }),
//       Message.countDocuments({
//         receiver: lawyer._id,
//         isRead: false
//       })
//     ]);

//     res.json({
//       success: true,
//       data: {
//         upcomingAppointments,
//         completedAppointments,
//         pendingConsultations,
//         totalEarnings: totalEarnings[0]?.total || 0,
//         monthlyEarnings: monthlyEarnings[0]?.total || 0,
//         clientCount: clientCount.length,
//         activeServices: serviceCount,
//         unreadMessages: messages,
//         rating: lawyer.rating,
//         verificationStatus: lawyer.verification.status
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
//2

// const getDashboardStats = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id })
//       .select('_id rating verification.services');
    
//     if (!lawyer) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Lawyer profile not found' 
//       });
//     }

//     // Current month calculations
//     const currentDate = new Date();
//     const firstDayOfMonth = new Date(
//       currentDate.getFullYear(), 
//       currentDate.getMonth(), 
//       1
//     );
//     const lastDayOfMonth = new Date(
//       currentDate.getFullYear(), 
//       currentDate.getMonth() + 1, 
//       0
//     );

//     // Only query the data we need (no payments or messages)
//     const [upcomingAppointments, completedAppointments, pendingConsultations, activeServices] = await Promise.all([
//       // Upcoming appointments (next 7 days)
//       Appointment.countDocuments({
//         lawyerId: lawyer._id,
//         date: { 
//           $gte: new Date(),
//           $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//         },
//         status: 'confirmed'
//       }),
      
//       // Completed appointments this month
//       Appointment.countDocuments({
//         lawyerId: lawyer._id,
//         status: 'completed',
//         date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
//       }),
      
//       // Pending consultations
//       ConsultationModel.countDocuments({
//         lawyerId: lawyer._id,
//         status: 'pending'
//       }),
      
//       // Active services
//       LegalServicesModel.countDocuments({ 
//         lawyerId: lawyer._id,
//         status: 'active' 
//       })
//     ]);

//     res.json({
//       success: true,
//       data: {
//         upcomingAppointments,
//         completedAppointments,
//         pendingConsultations,
//         activeServices,
//         rating: lawyer.rating || 0,
//         verificationStatus: lawyer.verification?.status || 'pending'
//       }
//     });

//   } catch (error) {
//     console.error('Dashboard stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to load dashboard stats'
//     });
//   }
// };

// Add to LawyerController.js

//3

const getDashboardStats = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user.id || req.user._id })
      .select('_id rating verification.status')
      .lean();

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found'
      });
    }

    // Set default values including case stats
    const defaultStats = {
      upcomingAppointments: 0,
      completedAppointments: 0,
      pendingConsultations: 0,
      activeCases: 0,
      closedCases: 0,
      activeServices: 0,
      rating: lawyer.rating || 0,
      verificationStatus: lawyer.verification?.status || 'pending'
    };

    try {
      const results = await Promise.all([
        // Existing queries...
        Appointment.countDocuments({
          lawyerId: lawyer._id,
          date: { $gte: new Date() },
          status: 'confirmed'
        }),
        
        Appointment.countDocuments({
          lawyerId: lawyer._id,
          status: 'completed'
        }),
        
        ConsultationModel.countDocuments({
          lawyerId: lawyer._id,
          status: 'pending'
        }),

        // NEW: Case statistics
        CaseModel.countDocuments({
          lawyerId: lawyer._id,
          status: 'active'
        }),
        
        CaseModel.countDocuments({
          lawyerId: lawyer._id,
          status: 'closed'
        }),

        LegalServicesModel.countDocuments({
          lawyerId: lawyer._id,
          status: 'active'
        })
      ]);

      const [
        upcomingAppointments, 
        completedAppointments, 
        pendingConsultations,
        activeCases,
        closedCases,
        activeServices
      ] = results;

      res.json({
        success: true,
        data: {
          ...defaultStats,
          upcomingAppointments,
          completedAppointments,
          pendingConsultations,
          activeCases,
          closedCases,
          activeServices
        }
      });

    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.json({
        success: true,
        data: defaultStats
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all cases for the lawyer
const getLawyerCases = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id })
      .populate('cases')
      .populate({
        path: 'cases',
        populate: [
          { path: 'clientId', select: 'firstName lastName' },
          { path: 'documents', select: 'name url' }
        ]
      });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    res.json({
      success: true,
      count: lawyer.cases.length,
      data: lawyer.cases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get case statistics
const getCaseStats = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const stats = await CaseModel.aggregate([
      { $match: { lawyerId: lawyer._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDurationDays: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert ms to days
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
const getAppointments = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id  });
    if (!lawyer) {
      return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
    }

    const { status } = req.query;
    const query = { lawyerId: lawyer._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('clientId', 'firstName lastName email phone')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
    if (!lawyer) {
      return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, lawyerId: lawyer._id },
      { status: req.body.status },
      { new: true }
    ).populate('clientId', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOneAndUpdate(
      {userId: req.user._id  || req.user.id  },
      { availableSlots: req.body.availableSlots },
      { new: true }
    );

    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
    }

    res.json({ success: true, data: lawyer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// 3. Legal Services Management
const createLegalService = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id  });
    if (!lawyer) {
      return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
    }

    // Handle file uploads
    const documents = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadFileToCloudinary(file.path, 'legal-services');
        documents.push({
          name: file.originalname,
          url: result.secure_url
        });
      }
    }

    const serviceData = {
      lawyerId: lawyer._id,
      ...req.body,
      documents
    };

    const service = await LegalService.create(serviceData);
    
    // Add service to lawyer's services
    lawyer.services.push(service._id);
    await lawyer.save();

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getLawyerServices = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id  });
    if (!lawyer) {
      return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
    }

    const services = await LegalService.find({ lawyerId: lawyer._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// 5. Consultation Management
const getConsultations = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id  });
    if (!lawyer) {
      return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
    }

    const { filter } = req.query;
    let query = { lawyerId: lawyer._id };

    if (filter === 'upcoming') {
      query.date = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    } else if (filter === 'past') {
      query.date = { $lt: new Date() };
    }

    const consultations = await ConsultationModel.find(query)
      .populate('serviceId', 'title description')
      .populate('clientId', 'firstName lastName email phone')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addConsultationNote = async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id  || req.user.id  });
    if (!lawyer) {
      return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
    }

    const consultation = await ConsultationModel.findOneAndUpdate(
      { _id: req.params.id, lawyerId: lawyer._id },
      { $push: { notes: req.body.note } },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



// ➡️ Verification APIs
const submitVerification = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findByIdAndUpdate(
      req.params.id,
      { 
        'verification.documents': req.body.documents,
        'verification.status': 'pending'
      },
      { new: true }
    );
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveVerification = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findByIdAndUpdate(
      req.params.id,
      { 'verification.isVerified': true },
      { new: true }
    );
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAnalytics = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({userId: req.user._id  || req.user.id });
    if (!lawyer) {
      return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
    }

    // Last 6 months earnings
    const monthlyEarnings = await Payment.aggregate([
      { 
        $match: { 
          lawyerId: lawyer._id,
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Appointment status distribution
    const appointmentStats = await Appointment.aggregate([
      { $match: { lawyerId: lawyer._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Client demographics
    const clientDemographics = await Appointment.aggregate([
      { $match: { lawyerId: lawyer._id } },
      { $group: { _id: "$clientId" } },
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      { 
        $group: {
          _id: null,
          locations: { $push: "$client.location" },
          genders: { $push: "$client.gender" },
          ageGroups: {
            $push: {
              $divide: [
                { $subtract: [new Date(), "$client.dateOfBirth"] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        monthlyEarnings,
        appointmentStats,
        clientDemographics: clientDemographics[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ➡️ Analytics Update (Call this periodically)
const updateAnalytics = async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      { $match: { lawyerId: req.params.id } },
      { 
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          avgResponseTime: { $avg: "$responseTime" }
        }
      }
    ]);
    
    await LawyerModel.findByIdAndUpdate(
      req.params.id,
      { 
        'analytics.avgRating': stats[0]?.avgRating || 0,
        'analytics.responseTime': stats[0]?.avgResponseTime || 0 
      }
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addLawyer,
  getAllLawyers,
  getLawyerProfile,
  updateLawyerProfile,
  getLawyerById,
  getTopRatedLawyers,
  updateLawyer,
  deleteLawyer,
  updateAvailableSlots,
  updateAvailability,
  getConsultations,
  addConsultationNote,
  createLegalService,
  getLawyerServices,
  getDashboardStats,
  getLawyerCases,
  getCaseStats,
  getAppointments,
  updateAppointmentStatus,
  submitVerification,
  approveVerification,
  getAnalytics,
  updateAnalytics
 
};