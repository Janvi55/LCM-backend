const userModel = require('../models/UserModel');
const lawyerModel = require('../models/LawyerModel');
const appointmentModel = require('../models/AppointmentModel');
const adminModel =require('../models/AdminModel')
const bcrypt = require("bcrypt")
const mailUtil = require("../utils/MailUtil");
const reviewModel = require("../models/ReviewModel")
const queryModel = require("../models/QueriesModel")



const adminSignup = async(req,res)=>{
     
  try{
     
     const salt = bcrypt.genSaltSync(10);
     const hashedPassword = bcrypt.hashSync(req.body.password, salt);
     req.body.password = hashedPassword;
     
     const createdAdmin = await adminModel.create(req.body)
     await mailUtil.sendingMail(createdAdmin.email,"welcome to Legal Consultant MarketPlace","this is welcome mail")
     res.status(201).json({
         message:"Admin created..",
         data:createdAdmin


     })

  }catch(err){

     


     res.status(500).json({
         message:"error",
         data:err.message
     })

  }

}

const adminLogin = async (req,res) =>{


 const email = req.body.email;
 const password = req.body.password;

 const foundAdminFromEmail = await adminModel.findOne({email: email}).populate("roleId");
 console.log(foundAdminFromEmail);

 if(foundAdminFromEmail != null){
     
     const isMatch = bcrypt.compareSync(password,foundAdminFromEmail.password);

     if(isMatch == true){
         res.status(200).json({
             message:"login successfully",
             data:foundAdminFromEmail
         });

     }else{
         res.status(401).json({
             message:"invalid cred....",
         });
     }
 }else{
     res.status(404).json({
         message:"Email not found..."
     });
 }
};


const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalLawyers = await lawyerModel.countDocuments();
    const totalAppointments = await appointmentModel.countDocuments();
    const completedPayments = await appointmentModel.find({ paymentStatus: 'Completed' });
    const totalReviews = await reviewModel.countDocuments();
    const totalQueries = await queryModel.countDocuments();

    const totalEarnings = completedPayments.reduce((sum, appt) => {
      return sum + (appt.amount || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalLawyers,
        totalAppointments,
        totalReviews,
        totalEarnings,
        totalQueries
        
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};


// Controller for chart data
const getChartData = async (req, res) => {
    try {
      // You might need to adjust according to your DB schema
      const payments = await appointmentModel.aggregate([
        {
          $match: { paymentStatus: "Completed" },
        },
        {
          $group: {
            _id: { $month: "$appointmentDate" },
            totalPayments: { $sum: "$amount" },
            totalAppointments: { $sum: 1 },
          },
        },
        {
          $sort: { "_id": 1 }
        }
      ]);
  
      // Format for frontend chart
      const monthNames = [
        "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
  
      const chartData = payments.map(item => ({
        name: monthNames[item._id],
        payments: item.totalPayments,
        appointments: item.totalAppointments,
      }));
  
      res.status(200).json({ success: true, data: chartData });
    } catch (error) {
      console.error("Error generating chart data:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };



  const getLawyerAppointmentsStats = async (req, res) => {
    try {
      const data = await appointmentModel.aggregate([
        {
          $group: {
            _id: "$lawyerId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "lawyers",
            localField: "_id",
            foreignField: "_id",
            as: "lawyer",
          },
        },
        {
          $unwind: "$lawyer",
        },
        {
          $project: {
            lawyerName: "$lawyer.name",
            count: 1,
          },
        },
      ]);
  
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.error("Error getting lawyer appointment stats:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  


const getUserSignupStats = async (req, res) => {
  try {
    const monthlyStats = await userModel.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: monthlyStats
    });
  } catch (error) {
    console.error("User signup stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

  

  const getAppointmentStatusStats = async (req, res) => {
    try {
      const statusData = await appointmentModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);
  
      const chartData = statusData.map(item => ({
        status: item._id,
        count: item.count
      }));
  
      res.status(200).json({ success: true, data: chartData });
    } catch (error) {
      console.error("Error fetching appointment status stats:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  const getAppointmentsForCalendars = async (req, res) => {
    try {
      const appointments = await appointmentModel.find()
        .populate('userId', 'name')
        .populate('lawyerId', 'name');
  
      const calendarData = appointments.map(appt => ({
        title: `${appt.userId?.name} & ${appt.lawyerId?.name}`,
        start: appt.appointmentDate,
        end: appt.appointmentDate,
        status: appt.status.toLowerCase(),
      }));
  
      res.status(200).json({ success: true, data: calendarData });
    } catch (err) {
      console.error("Calendar fetch error:", err);
      res.status(500).json({ success: false, message: "Failed to load appointments" });
    }
  };
  
  const getAppointmentsForCalendar = async (req, res) => {
    try {
      const appointments = await appointmentModel.find()
        .populate('userId', 'firstName')
        .populate('lawyerId', 'name');
  
      const calendarData = appointments.map(appt => ({
        id: appt._id,
        title: `${appt.userId?.firstName} & ${appt.lawyerId?.name}`,
        start: appt.appointmentDate,
        end: appt.appointmentDate,
        status: appt.status
      }));
  
      res.status(200).json(calendarData); // returning array directly for easier frontend use
    } catch (err) {
      console.error("Calendar fetch error:", err);
      res.status(500).json({ message: "Failed to load appointments for calendar" });
    }
  };
  

  const getAllUsers = async (req, res) => {
    try {
      const users = await userModel.find({}, "-password"); // exclude password
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
  };

  const toggleUserBlock = async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
      user.isBlocked = !user.isBlocked;
      await user.save();
  
      res.status(200).json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (error) {
      console.error("Failed to update user block status:", error);
      res.status(500).json({ success: false, message: "Failed to update user status" });
    }
  };

  
  const deleteUser = async (req, res) => {
    try {
      const result = await userModel.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ success: false, message: "User not found" });
  
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  // Get all lawyers
const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await lawyerModel.find().select("-password");
    res.status(200).json({ success: true, data: lawyers });
  } catch (err) {
    console.error("Error fetching lawyers:", err);
    res.status(500).json({ success: false, message: "Failed to fetch lawyers" });
  }
};

// Toggle block/unblock lawyer
const toggleLawyerBlock = async (req, res) => {
  try {
    const lawyer = await lawyerModel.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }
    lawyer.isBlocked = !lawyer.isBlocked;
    await lawyer.save();
    res.status(200).json({ success: true, message: `Lawyer ${lawyer.isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    console.error("Error toggling lawyer status:", err);
    res.status(500).json({ success: false, message: "Failed to update lawyer status" });
  }
};

// Optional: Delete lawyer
const deleteLawyer = async (req, res) => {
  try {
    const result = await lawyerModel.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }
    res.status(200).json({ success: true, message: "Lawyer deleted successfully" });
  } catch (err) {
    console.error("Error deleting lawyer:", err);
    res.status(500).json({ success: false, message: "Failed to delete lawyer" });
  }
};


// const deleteLawyer = async (req, res) => {
//   try {
//     const lawyerId = req.params.id;

//     // Delete all appointments related to this lawyer
//     await appointmentModel.deleteMany({ lawyerId });

//     // Delete all reviews for this lawyer
//     await reviewModel.deleteMany({ lawyerId });

//     // Delete all legal queries for this lawyer
//     await queryModel.deleteMany({ lawyerId });

//     // Now delete the lawyer
//     await lawyerModel.findByIdAndDelete(lawyerId);

//     res.status(200).json({ message: "Lawyer and all associated data deleted successfully." });
//   } catch (err) {
//     console.error("Error deleting lawyer and data:", err);
//     res.status(500).json({ message: "Server error while deleting lawyer data." });
//   }
// };




const getAllPayments = async (req, res) => {
  try {
    // Fetch all appointments (which include payment details)
    const appointments = await appointmentModel.find()
      .populate("userId")  // Populate user details to show user names
      .populate("lawyerId") // Populate lawyer details if needed
      .exec();

    res.status(200).json({
      message: "Fetched all payments successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find()
      .populate('userId', 'firstName lastName')
      .populate('lawyerId', 'name specialization');

    res.status(200).json({
      message: "All reviews fetched successfully",
      data: reviews
    });
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message
    });
  }
};

// Delete a review by ID
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await reviewModel.findByIdAndDelete(id);
    res.status(200).json({
      message: "Review deleted successfully"
    });
  } catch (err) {
    console.error("Delete Review Error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message
    });
  }
};


getUserRetentionStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const usersWithBookings = await appointmentModel.distinct("userId");
    const completedUsers = await appointmentModel.find({ status: "Confirmed" }).distinct("userId");

    const stats = [
      { stage: "Signed Up", count: totalUsers },
      { stage: "Booked Appointment", count: usersWithBookings.length },
      { stage: "Confirm Appointment", count: completedUsers.length },
    ];

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("User Retention Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

getLawyerRatingStats = async (req, res) => {
  try {
    const ratings = await reviewModel.aggregate([
      {
        $group: {
          _id: "$lawyerId",
          avgRating: { $avg: "$rating" }
        }
      },
      {
        $lookup: {
          from: "lawyers",
          localField: "_id",
          foreignField: "_id",
          as: "lawyer"
        }
      },
      { $unwind: "$lawyer" },
      {
        $project: {
          lawyerName: "$lawyer.name",
          rating: { $round: ["$avgRating", 1] }
        }
      }
    ]);

    res.status(200).json({ success: true, data: ratings });
  } catch (err) {
    console.error("Lawyer Rating Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  getAdminStats,getChartData,getLawyerAppointmentsStats,getUserSignupStats,getAppointmentStatusStats,getAppointmentsForCalendars,getAppointmentsForCalendar, getAllUsers,toggleUserBlock,deleteUser,deleteLawyer,toggleLawyerBlock,getAllLawyers,getAllPayments,adminSignup,adminLogin,getAllReviews,deleteReview,getUserRetentionStats,getLawyerRatingStats
};






















//--------------------------------------------------------------

// const AdminModel = require('../models/AdminModel');
// const UserModel = require('../models/UserModel');
// const CaseModel = require('../models/CaseModel');
// // const BillingModel = require('../models/BillingModel');

// // Grant admin privileges to a user
// const createAdmin = async (req, res) => {
//   try {
//     const { userId, permissions } = req.body;
    
//     const admin = new AdminModel({
//       userId,
//       permissions: permissions || ['view_analytics'] // Default permissions
//     });

//     await admin.save();
//     res.status(201).json(admin);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get system-wide analytics


// // Get all admins
// const getAllAdmins = async (req, res) => {
//   try {
//     const admins = await AdminModel.find().populate('userId', 'firstName lastName email');
//     res.json(admins);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update admin permissions
// const updateAdminPermissions = async (req, res) => {
//   try {
//     const { permissions } = req.body;
//     const admin = await AdminModel.findByIdAndUpdate(
//       req.params.id,
//       { permissions },
//       { new: true }
//     );
//     res.json(admin);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


// const getSystemAnalytics = async (req, res) => {
//   try {
//     const [
//       totalUsers,
//       activeUsers,
//       totalLawyers,
//       verifiedLawyers,
//       totalCases,
//       activeCases,
//       totalServices,
//       activeServices,
//       totalCategories,
//       revenueStats,
//       recentSignups,
//       popularCategories
//     ] = await Promise.all([
//       // User statistics
//       UserModel.countDocuments(),
//       UserModel.countDocuments({ isActive: true }),
      
//       // Lawyer statistics
//       LawyerModel.countDocuments(),
//       LawyerModel.countDocuments({ 'verification.isVerified': true }),
      
//       // Case statistics
//       CaseModel.countDocuments(),
//       CaseModel.countDocuments({ status: 'active' }),
      
//       // Service statistics
//       LegalServiceModel.countDocuments(),
//       LegalServiceModel.countDocuments({ status: 'active' }),
      
//       // Category statistics
//       LegalCategoryModel.countDocuments(),
      
//       // Revenue statistics (last 30 days and total)
//       BillingModel.aggregate([
//         {
//           $facet: {
//             last30Days: [
//               { 
//                 $match: { 
//                   createdAt: { 
//                     $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) 
//                   } 
//                 } 
//               },
//               { $group: { _id: null, amount: { $sum: '$amount' } } }
//             ],
//             allTime: [
//               { $group: { _id: null, amount: { $sum: '$amount' } } }
//             ]
//           }
//         }
//       ]),
      
//       // Recent signups (last 7 days)
//       UserModel.find()
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select('firstName lastName email createdAt'),
      
//       // Popular categories
//       LegalCategoryModel.aggregate([
//         {
//           $lookup: {
//             from: 'legalservices',
//             localField: '_id',
//             foreignField: 'practiceArea',
//             as: 'services'
//           }
//         },
//         {
//           $project: {
//             name: '$displayName',
//             serviceCount: { $size: '$services' }
//           }
//         },
//         { $sort: { serviceCount: -1 } },
//         { $limit: 5 }
//       ])
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         users: {
//           total: totalUsers,
//           active: activeUsers,
//           recentSignups
//         },
//         lawyers: {
//           total: totalLawyers,
//           verified: verifiedLawyers
//         },
//         cases: {
//           total: totalCases,
//           active: activeCases
//         },
//         services: {
//           total: totalServices,
//           active: activeServices
//         },
//         categories: {
//           total: totalCategories,
//           popular: popularCategories
//         },
//         revenue: {
//           last30Days: revenueStats[0].last30Days[0]?.amount || 0,
//           allTime: revenueStats[0].allTime[0]?.amount || 0
//         }
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Update user information (admin only)
// // @route   PATCH /api/admin/users/:id
// // @access  Private/Admin
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // Prevent role escalation
//     if (updates.role === 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Cannot grant admin privileges through this endpoint'
//       });
//     }

//     const allowedUpdates = {
//       isActive: updates.isActive,
//       isVerified: updates.isVerified,
//       isSuspended: updates.isSuspended,
//       suspensionReason: updates.suspensionReason
//     };

//     // Remove undefined values
//     Object.keys(allowedUpdates).forEach(key => 
//       allowedUpdates[key] === undefined && delete allowedUpdates[key]
//     );

//     const user = await UserModel.findByIdAndUpdate(
//       id,
//       allowedUpdates,
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };
// // @desc    Force delete a user (admin only)
// // @route   DELETE /api/admin/users/:id
// // @access  Private/Admin
// const forceDeleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Verify the user exists
//     const user = await UserModel.findById(id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }

//     // Prevent deletion of other admins (unless super admin)
//     if (user.role === 'admin' && req.user.role !== 'superadmin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Only superadmins can delete other admins'
//       });
//     }

//     // Perform cascading deletions (optional)
//     await Promise.all([
//       // Delete related cases
//       CaseModel.deleteMany({ clientId: id }),
      
//       // Delete related appointments
//       AppointmentModel.deleteMany({ userId: id }),
      
//       // If user is a lawyer, delete their services
//       user.role === 'lawyer' && 
//         LegalServiceModel.deleteMany({ lawyerId: id }),
      
//       // Delete the user
//       UserModel.findByIdAndDelete(id)
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         message: `User ${user.email} and all related data deleted successfully`
//       }
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// module.exports={
//   createAdmin,
//   getSystemAnalytics,
//   getAllAdmins,
//   updateAdminPermissions,
//   getSystemAnalytics,
//   updateUser,
//   forceDeleteUser,
  
  
  

// }