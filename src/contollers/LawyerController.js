



const LawyerModel = require("../models/LawyerModel");
const  userModel = require("../models/UserModel")
const bcrypt = require("bcrypt")
const multer = require("multer");
const path = require ("path")
const CloudinaryUtil = require("../utils/CloudinaryUtil");
const mailUtil = require("../utils/MailUtil")
const jwt = require("jsonwebtoken")

const secret = "secret";



const storage = multer.diskStorage({
  destination:"./uploads",
  filename:function(req,file,cb){
      cb(null,file.originalname);
  }
});


const upload = multer({
  storage:storage,
}).single("image");

const getLawyerData = async (req, res) => {
  try {
      const lawyers = await LawyerModel.find().populate("roleId");

      if (!lawyers || lawyers.length === 0) {
          return res.status(404).json({
              message: "No lawyers found",
              data: null
          });
      }

      res.status(200).json({
          message: "Lawyer data fetched successfully",
          data: lawyers
      });
  } catch (error) {
      console.error("Error fetching lawyers:", error);
      res.status(500).json({
          message: "Server Error",
          error: error.message
      });
  }
};


// const lawyerLogin = async (req,res) =>{


//     const email = req.body.email;
//     const password = req.body.password;

//     const foundLawyerFromEmail = await LawyerModel.findOne({email: email}).populate("roleId");
//     console.log(foundLawyerFromEmail);

//     if(foundLawyerFromEmail != null){
      
//         const isMatch = bcrypt.compareSync(password,foundLawyerFromEmail.password);

//         if(isMatch == true){
//             res.status(200).json({
//                 message:"login successfully",
//                 data:foundLawyerFromEmail
//             });

//         }else{
//             res.status(404).json({
//                 message:"invalid cred....",
//             });
//         }
//     }else{
//         res.status(404).json({
//             message:"Email not found..."
//         });
//     }
// };



const lawyerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundLawyer = await LawyerModel.findOne({ email }).populate("roleId");

    if (!foundLawyer) {
      return res.status(404).json({
        message: "Email not found...",
      });
    }

    // ✅ Check if the lawyer is blocked
    if (foundLawyer.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin.",
      });
    }

    const isMatch = bcrypt.compareSync(password, foundLawyer.password);

    if (isMatch) {
      return res.status(200).json({
        message: "Login successfully",
        data: foundLawyer,
      });
    } else {
      return res.status(401).json({
        message: "Invalid credentials...",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Something went wrong, please try again later.",
    });
  }
};





const signupLawyer = async(req,res)=>{
   
   try{
      
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);
      req.body.password = hashedPassword;
      
      const createdLawyer = await LawyerModel.create(req.body)
      res.status(201).json({
          message:"lawyer created..",
          data:createdLawyer


      })

   }catch(err){

      


      res.status(500).json({
          message:"error",
          data:err
      })

   }

}



const signupLawyerWithFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      console.log('Uploaded file:', req.file);

      // Upload to Cloudinary
      const cloudinaryResponse = await CloudinaryUtil.uploadFileToCloudinary(req.file);
      console.log('Cloudinary response:', cloudinaryResponse);

      // Prepare lawyer data
      req.body.imageURL = cloudinaryResponse.secure_url;
      const salt = bcrypt.genSaltSync(10);
      req.body.password = bcrypt.hashSync(req.body.password, salt);
      req.body.rating = 0;
      req.body.ratingCount = 0;

      // Create lawyer
      const savedLawyer = await LawyerModel.create(req.body);
      
      // Send welcome email
      await mailUtil.sendingMail(
        savedLawyer.email,
        "Welcome to Legal Consultant MarketPlace",
        "This is welcome mail"
      );

      return res.status(201).json({
        message: "Lawyer added successfully",
        data: savedLawyer
      });

    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({
        message: "Error processing signup",
        error: error.message
      });
    }
  });
};

const deleteLawyer = async(req,res)=>{

  const deletedLawyer = await LawyerModel.findByIdAndDelete(req.params.id)

  res.json({
      message:"lawyer deleted successfully.... ",
      data:deletedLawyer
  })
}

// const getLawyerById = async(req,res)=>{

//     const foundLawyer = await LawyerModel.findById(req.params.id);

//     res.json({
//         message:"lawyer fetched successfully.... ",
//         data:foundLawyer
//     })
// }

const getLawyerById = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Lawyer fetched successfully",
      data: lawyer
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching lawyer",
      error: error.message
    });
  }
};



const getLawyersBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const foundLawyers = await LawyerModel.find({ specialization });

    if (foundLawyers.length === 0) {
      return res.status(404).json({ message: "No lawyers found" });
    }

    res.status(200).json({
      message: "Lawyers fetched successfully",
      data: foundLawyers,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching lawyers", error: err });
  }
};

const forgotPassword = async(req,res) =>{

    const email = req.body.email;
    const foundLawyer  = await LawyerModel.findOne({email : email});

    if(foundLawyer != null) {

       const token = jwt.sign(foundLawyer.toObject(),secret,{ expiresIn: "1h" });
       console.log(token);
       const url = `http://localhost:5173/lawyerResetPassword/${token}`;
       const mailContent = `
      <html>
        <body>
          <p>You requested a password reset. Click the link below:</p>
          <a href="${url}" style="display:inline-block; padding:10px 20px; background-color:#007bff; color:#ffffff; text-decoration:none; border-radius:5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        </body>
      </html>`;
       
       await mailUtil.forgotSendingMail(foundLawyer.email, "reset password" , mailContent);
       res.status(200).json({
        message:"reset password link sent to your mail"
       }); 

    }else {
        res.status(404).json({
            message:"Email not found..."
        });
    }
}


const resetPassword = async(req,res)=>{
    const token = req.body.token;
    const newPassword = req.body.password;

    const lawyerFromToken = jwt.verify(token,secret);


    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword,salt)

    const updateLawyer = await LawyerModel.findByIdAndUpdate(lawyerFromToken._id, {
        password:hashedPassword,
    });
    res.json({
        message:"password updated successfully.."
    });  

}

const getTopRatedLawyers = async (req, res) => {
  try {
      const topLawyers = await LawyerModel.find()
          .sort({ rating: -1, ratingCount: -1 })
          .limit(3);

      if (!topLawyers || topLawyers.length === 0) {
          return res.status(404).json({
              message: "No top-rated lawyers found",
              data: []
          });
      }

      // Only sending relevant info
      const formattedData = topLawyers.map(lawyer => ({
          _id: lawyer._id,
          name: lawyer.name,
          specialization: lawyer.specialization,
          rating: lawyer.rating,
          imageURL: lawyer.imageURL
      }));

      res.json({
          message: "Top-rated lawyers fetched successfully",
          data: formattedData
      });
  } catch (error) {
      console.error("Error fetching top-rated lawyers:", error);
      res.status(500).json({
          message: "Server Error",
          error: error.message
      });
  }
};

module.exports = {
  getLawyerData,deleteLawyer,getLawyerById,lawyerLogin,signupLawyer,signupLawyerWithFile,getLawyersBySpecialization,forgotPassword,resetPassword,getTopRatedLawyers
}   



//----------------------------------------------------------------
// // ✅ Add Lawyer
// const addLawyer = async (req, res) => {
//   try {
//     const savedLawyer = await LawyerModel.create(req.body);

//     res.status(201).json({
//       message: "Lawyer added successfully",
//       data: savedLawyer,
//     });
//   } catch (error) {
//     console.error("Error adding lawyer:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// // ✅ Get All Lawyers
// const getAllLawyers = async (req, res) => {
//   try {
//     const lawyers = await LawyerModel.find()
//       .populate("userId", "firstName lastName email") // Populates lawyer's user details
//       .select("specialization experienceYears rating availableSlots consultationFee location");

//     res.status(200).json({
//       message: "All lawyers retrieved successfully",
//       data: lawyers,
//     });
//   } catch (error) {
//     console.error("Error fetching lawyers:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };
// const getLawyerProfile = async (req, res) => {
//   try {
//     // Use req.user._id to match what the middleware sets
//     const lawyer = await LawyerModel.findOne({ userId:req.user.id || req.user._id  })
//       .populate('userId', 'firstName lastName email phone')
//       .populate('practiceAreas', 'displayName slug icon')
//       .populate({
//         path: 'userId',
//         select: 'firstName lastName email phone',
//         model: 'users' // Explicit model name
//       })
//       .populate({
//         path: 'specializations',
//         model: 'Service' // Match your Service model name
//       })
//       .populate({
//         path: 'services',
//         model: 'LegalService' // Match your LegalService model name
//       })
//       .populate({
//         path: 'clients',
//         select: 'firstName lastName email',
//         model: 'users' // Match your User model name
//       })
      
//     if (!lawyer) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Lawyer profile not found' 
//       });
//     }

//     res.json({ 
//       success: true, 
//       data: lawyer 
//     });
//   } catch (error) {
//     console.error('Error in getLawyerProfile:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };
// const updateLawyerProfile = async (req, res) => {
//   try {
//     const updates = req.body;
//     const lawyer = await LawyerModel.findOneAndUpdate(
//       { userId: req.user.id || req.user._id },
//       updates,
//       { new: true, runValidators: true }
//     ).populate('userId', 'firstName lastName email phone');

//     if (!lawyer) {
//       return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     res.json({ success: true, data: lawyer });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // ✅ Get Lawyer By ID
// const getLawyerById = async (req, res) => {
//   try {
//     const lawyerId = req.params.id; // 👈 Following the format like in Service Controller
//     console.log("Fetching lawyer with ID:", lawyerId);

//     const lawyer = await LawyerModel.findById(lawyerId).populate("userId", "firstName lastName email");

//     if (!lawyer) {
//       return res.status(404).json({ message: "Lawyer not found" });
//     }

//     res.status(200).json({
//       message: "Lawyer profile retrieved successfully",
//       data: lawyer,
//     });
//   } catch (error) {
//     console.error("Error fetching lawyer profile:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };


// // Get top-rated lawyers
// const getTopRatedLawyers = async (req, res) => {
//   try {
//     const lawyerId = req.params.id;
//       const topLawyers = await LawyerModel.find().sort({ rating: -1 }).limit(5); // Fetch top 5 highest-rated lawyers

//       const lawyer = await LawyerModel.findById(lawyerId).populate("userId", "firstName lastName email");
//       res.status(200).json({ success: true, data: topLawyers });
//   } catch (error) {
//       res.status(500).json({ success: false, message: "Error fetching top-rated lawyers", error });
//   }
// };

// const getLawyerServicesByCategory = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user.id });
//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         error: "Lawyer not found"
//       });
//     }

//     const services = await LegalService.find({
//       lawyerId: lawyer._id,
//       practiceArea: req.params.categoryId,
//       status: 'active'
//     }).populate('practiceArea', 'displayName slug');

//     res.status(200).json({
//       success: true,
//       data: services
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };
// // ✅ Update Lawyer Details
// const updateLawyer = async (req, res) => {
//   try {
//     const lawyerId = req.params.id; // 👈 Following consistent format
//     const updatedLawyer = await LawyerModel.findByIdAndUpdate(lawyerId, req.body, { new: true });

//     if (!updatedLawyer) {
//       return res.status(404).json({ message: "Lawyer not found" });
//     }

//     res.status(200).json({
//       message: "Lawyer details updated successfully",
//       data: updatedLawyer,
//     });
//   } catch (error) {
//     console.error("Error updating lawyer details:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// // ✅ Delete Lawyer
// const deleteLawyer = async (req, res) => {
//   try {
//     const lawyerId = req.params.id; // 👈 Consistent with other controllers
//     const deletedLawyer = await LawyerModel.findByIdAndDelete(lawyerId);

//     if (!deletedLawyer) {
//       return res.status(404).json({ message: "Lawyer not found" });
//     }

//     res.status(200).json({
//       message: "Lawyer deleted successfully",
//       data: deletedLawyer,
//     });
//   } catch (error) {
//     console.error("Error deleting lawyer:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// // ✅ Update Available Slots
// const updateAvailableSlots = async (req, res) => {
//   try {
//     const lawyerId = req.params.id; // 👈 Consistent ID format
//     const { availableSlots } = req.body;

//     const updatedLawyer = await LawyerModel.findByIdAndUpdate(
//       lawyerId,
//       { availableSlots },
//       { new: true }
//     );

//     if (!updatedLawyer) {
//       return res.status(404).json({ message: "Lawyer not found" });
//     }

//     res.status(200).json({
//       message: "Available slots updated successfully",
//       data: updatedLawyer,
//     });
//   } catch (error) {
//     console.error("Error updating available slots:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };


// // // Add to LawyerController.js
// // const getDashboardStats = async (req, res) => {
// //   try {
// //     const lawyer = await LawyerModel.findOne({ userId: req.user.id });
// //     if (!lawyer) {
// //       return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
// //     }

// //     // Current month calculations
// //     const currentDate = new Date();
// //     const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
// //     const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

// //     const [
// //       upcomingAppointments,
// //       completedAppointments,
// //       pendingConsultations,
// //       totalEarnings,
// //       monthlyEarnings,
// //       clientCount,
// //       serviceCount,
// //       messages
// //     ] = await Promise.all([
// //       Appointment.countDocuments({
// //         lawyerId: lawyer._id,
// //         date: { 
// //           $gte: new Date(),
// //           $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
// //         },
// //         status: 'confirmed'
// //       }),
// //       Appointment.countDocuments({
// //         lawyerId: lawyer._id,
// //         status: 'completed',
// //         date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
// //       }),
// //       Consultation.countDocuments({
// //         lawyerId: lawyer._id,
// //         status: 'pending'
// //       }),
// //       Payment.aggregate([
// //         { $match: { lawyerId: lawyer._id } },
// //         { $group: { _id: null, total: { $sum: "$amount" } } }
// //       ]),
// //       Payment.aggregate([
// //         { 
// //           $match: { 
// //             lawyerId: lawyer._id,
// //             createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
// //           } 
// //         },
// //         { $group: { _id: null, total: { $sum: "$amount" } } }
// //       ]),
// //       Appointment.distinct('clientId', { lawyerId: lawyer._id }),
// //       LegalService.countDocuments({ 
// //         lawyerId: lawyer._id,
// //         status: 'active' 
// //       }),
// //       Message.countDocuments({
// //         receiver: lawyer._id,
// //         isRead: false
// //       })
// //     ]);

// //     res.json({
// //       success: true,
// //       data: {
// //         upcomingAppointments,
// //         completedAppointments,
// //         pendingConsultations,
// //         totalEarnings: totalEarnings[0]?.total || 0,
// //         monthlyEarnings: monthlyEarnings[0]?.total || 0,
// //         clientCount: clientCount.length,
// //         activeServices: serviceCount,
// //         unreadMessages: messages,
// //         rating: lawyer.rating,
// //         verificationStatus: lawyer.verification.status
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: error.message });
// //   }
// // };
// //2

// // const getDashboardStats = async (req, res) => {
// //   try {
// //     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id })
// //       .select('_id rating verification.services');
    
// //     if (!lawyer) {
// //       return res.status(404).json({ 
// //         success: false, 
// //         message: 'Lawyer profile not found' 
// //       });
// //     }

// //     // Current month calculations
// //     const currentDate = new Date();
// //     const firstDayOfMonth = new Date(
// //       currentDate.getFullYear(), 
// //       currentDate.getMonth(), 
// //       1
// //     );
// //     const lastDayOfMonth = new Date(
// //       currentDate.getFullYear(), 
// //       currentDate.getMonth() + 1, 
// //       0
// //     );

// //     // Only query the data we need (no payments or messages)
// //     const [upcomingAppointments, completedAppointments, pendingConsultations, activeServices] = await Promise.all([
// //       // Upcoming appointments (next 7 days)
// //       Appointment.countDocuments({
// //         lawyerId: lawyer._id,
// //         date: { 
// //           $gte: new Date(),
// //           $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
// //         },
// //         status: 'confirmed'
// //       }),
      
// //       // Completed appointments this month
// //       Appointment.countDocuments({
// //         lawyerId: lawyer._id,
// //         status: 'completed',
// //         date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
// //       }),
      
// //       // Pending consultations
// //       ConsultationModel.countDocuments({
// //         lawyerId: lawyer._id,
// //         status: 'pending'
// //       }),
      
// //       // Active services
// //       LegalServicesModel.countDocuments({ 
// //         lawyerId: lawyer._id,
// //         status: 'active' 
// //       })
// //     ]);

// //     res.json({
// //       success: true,
// //       data: {
// //         upcomingAppointments,
// //         completedAppointments,
// //         pendingConsultations,
// //         activeServices,
// //         rating: lawyer.rating || 0,
// //         verificationStatus: lawyer.verification?.status || 'pending'
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Dashboard stats error:', error);
// //     res.status(500).json({ 
// //       success: false, 
// //       error: 'Failed to load dashboard stats'
// //     });
// //   }
// // };

// // Add to LawyerController.js

// //3

// const getDashboardStats = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user.id || req.user._id })
//       .select('_id rating verification.status')
//       .lean();

//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Lawyer profile not found'
//       });
//     }

//     // Set default values including case stats
//     const defaultStats = {
//       upcomingAppointments: 0,
//       completedAppointments: 0,
//       pendingConsultations: 0,
//       activeCases: 0,
//       closedCases: 0,
//       activeServices: 0,
//       rating: lawyer.rating || 0,
//       verificationStatus: lawyer.verification?.status || 'pending'
//     };

//     try {
//       const results = await Promise.all([
//         // Existing queries...
//         Appointment.countDocuments({
//           lawyerId: lawyer._id,
//           date: { $gte: new Date() },
//           status: 'confirmed'
//         }),
        
//         Appointment.countDocuments({
//           lawyerId: lawyer._id,
//           status: 'completed'
//         }),
        
//         ConsultationModel.countDocuments({
//           lawyerId: lawyer._id,
//           status: 'pending'
//         }),

//         // NEW: Case statistics
//         CaseModel.countDocuments({
//           lawyerId: lawyer._id,
//           status: 'active'
//         }),
        
//         CaseModel.countDocuments({
//           lawyerId: lawyer._id,
//           status: 'closed'
//         }),

//         LegalServicesModel.countDocuments({
//           lawyerId: lawyer._id,
//           status: 'active'
//         })
//       ]);

//       const [
//         upcomingAppointments, 
//         completedAppointments, 
//         pendingConsultations,
//         activeCases,
//         closedCases,
//         activeServices
//       ] = results;

//       res.json({
//         success: true,
//         data: {
//           ...defaultStats,
//           upcomingAppointments,
//           completedAppointments,
//           pendingConsultations,
//           activeCases,
//           closedCases,
//           activeServices
//         }
//       });

//     } catch (dbError) {
//       console.error('Database query error:', dbError);
//       res.json({
//         success: true,
//         data: defaultStats
//       });
//     }

//   } catch (error) {
//     console.error('Server error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     });
//   }
// };

// // Get all cases for the lawyer
// const getLawyerCases = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id })
//       .populate('cases')
//       .populate({
//         path: 'cases',
//         populate: [
//           { path: 'clientId', select: 'firstName lastName' },
//           { path: 'documents', select: 'name url' }
//         ]
//       });

//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     res.json({
//       success: true,
//       count: lawyer.cases.length,
//       data: lawyer.cases
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Get case statistics
// const getCaseStats = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const stats = await CaseModel.aggregate([
//       { $match: { lawyerId: lawyer._id } },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 },
//           avgDurationDays: {
//             $avg: {
//               $divide: [
//                 { $subtract: [new Date(), '$createdAt'] },
//                 1000 * 60 * 60 * 24 // Convert ms to days
//               ]
//             }
//           }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: stats
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };
// const getAppointments = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id  });
//     if (!lawyer) {
//       return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     const { status } = req.query;
//     const query = { lawyerId: lawyer._id };
//     if (status) query.status = status;

//     const appointments = await Appointment.find(query)
//       .populate('clientId', 'firstName lastName email phone')
//       .sort({ date: 1, startTime: 1 });

//     res.json({ success: true, data: appointments });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const updateAppointmentStatus = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//     if (!lawyer) {
//       return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     const appointment = await Appointment.findOneAndUpdate(
//       { _id: req.params.id, lawyerId: lawyer._id },
//       { status: req.body.status },
//       { new: true }
//     ).populate('clientId', 'firstName lastName email');

//     if (!appointment) {
//       return res.status(404).json({ success: false, message: 'Appointment not found' });
//     }

//     res.json({ success: true, data: appointment });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// const updateAvailability = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOneAndUpdate(
//       {userId: req.user._id  || req.user.id  },
//       { availableSlots: req.body.availableSlots },
//       { new: true }
//     );

//     if (!lawyer) {
//       return res.status(404).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     res.json({ success: true, data: lawyer });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };


// // 3. Legal Services Management
// // @desc    Create new legal service
// // @route   POST /api/services
// // @access  Private/Lawyer
// const createService = async (req, res) => {
//   try {
//     const lawyer = await Lawyer.findById(req.user.lawyerId);
//     if (!lawyer) {
//       return res.status(403).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const { 
//       title, 
//       description, 
//       practiceArea, 
//       subCategory, 
//       pricing, 
//       highlights,
//       processFlow,
//       availability,
//       serviceModes,
//       requiredDocuments
//     } = req.body;

//     // Validate subcategory
//     const category = await LegalCategory.findById(practiceArea);
//     if (!category || !SERVICE_SUBCATEGORIES[category.slug]?.includes(subCategory)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid subcategory for selected practice area"
//       });
//     }

//     // Handle file uploads
//     const serviceImage = req.files['serviceImage']?.[0];
//     const docFiles = req.files['documents'] || [];

//     const documents = docFiles.map(file => ({
//       name: file.originalname,
//       url: file.path,
//       type: path.extname(file.originalname).substring(1)
//     }));

//     const service = new LegalService({
//       lawyer: lawyer._id,
//       title,
//       description,
//       practiceArea,
//       subCategory,
//       pricing: {
//         ...pricing,
//         displayAmount: `₹${pricing.baseAmount.toLocaleString('en-IN')}${pricing.type === 'Hourly' ? '/hour' : ''}`
//       },
//       highlights,
//       processFlow,
//       availability,
//       serviceModes,
//       requiredDocuments,
//       serviceImage: serviceImage?.path,
//       documents,
//       status: lawyer.isVerified ? 'active' : 'pending'
//     });

//     await service.save();
    
//     // Update lawyer's services count
//     lawyer.services.push(service._id);
//     await lawyer.save();

//     res.status(201).json({
//       success: true,
//       data: service
//     });

//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error: "Service with this title already exists"
//       });
//     }
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };



// // @desc    Get all services for logged-in lawyer
// // @route   GET /api/services
// // @access  Private/Lawyer
// const getLawyerServices = async (req, res) => {
//   try {
//     const lawyer = await Lawyer.findOne({ userId: req.user._id });
//     if (!lawyer) {
//       return res.status(403).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const services = await LegalService.find({ lawyer: lawyer._id })
//       .populate('practiceArea', 'displayName slug')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: services.length,
//       data: services
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Update legal service
// // @route   PUT /api/services/:id
// // @access  Private/Lawyer
// const updateService = async (req, res) => {
//   try {
//     const lawyer = await Lawyer.findOne({ userId: req.user._id });
//     if (!lawyer) {
//       return res.status(403).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const service = await LegalService.findById(req.params.id);
//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: "Service not found"
//       });
//     }

//     // Verify lawyer owns the service
//     if (!service.lawyer.equals(lawyer._id)) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this service"
//       });
//     }

//     const updates = req.body;
//     const serviceImage = req.files['serviceImage']?.[0];
//     const docFiles = req.files['documents'] || [];

//     // Handle file updates
//     if (serviceImage) {
//       updates.serviceImage = serviceImage.path;
//     }

//     if (docFiles.length > 0) {
//       updates.documents = [
//         ...service.documents,
//         ...docFiles.map(file => ({
//           name: file.originalname,
//           url: file.path,
//           type: path.extname(file.originalname).substring(1)
//         }))
//       ];
//     }

//     // Format pricing display
//     if (updates.pricing?.baseAmount) {
//       updates.pricing.displayAmount = `₹${updates.pricing.baseAmount.toLocaleString('en-IN')}${
//         updates.pricing.type === 'Hourly' ? '/hour' : ''
//       }`;
//     }

//     const updatedService = await LegalService.findByIdAndUpdate(
//       req.params.id,
//       updates,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: updatedService
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Delete legal service
// // @route   DELETE /api/services/:id
// // @access  Private/Lawyer
// const deleteService = async (req, res) => {
//   try {
//     const lawyer = await Lawyer.findOne({ userId: req.user._id });
//     if (!lawyer) {
//       return res.status(403).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const service = await LegalService.findById(req.params.id);
//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: "Service not found"
//       });
//     }

//     // Verify lawyer owns the service
//     if (!service.lawyer.equals(lawyer._id)) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to delete this service"
//       });
//     }

//     await service.remove();
    
//     // Remove from lawyer's services array
//     lawyer.services.pull(service._id);
//     await lawyer.save();

//     res.status(200).json({
//       success: true,
//       data: {}
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get service statistics for lawyer dashboard
// // @route   GET /api/services/stats
// // @access  Private/Lawyer
// const getServiceStats = async (req, res) => {
//   try {
//     const lawyer = await Lawyer.findOne({ userId: req.user._id });
//     if (!lawyer) {
//       return res.status(403).json({
//         success: false,
//         error: "Lawyer profile not found"
//       });
//     }

//     const stats = await LegalService.aggregate([
//       { $match: { lawyer: lawyer._id } },
//       {
//         $group: {
//           _id: null,
//           totalServices: { $sum: 1 },
//           activeServices: {
//             $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
//           },
//           totalViews: { $sum: "$stats.views" },
//           totalEnquiries: { $sum: "$stats.enquiries" },
//           avgRating: { $avg: "$rating" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           totalServices: 1,
//           activeServices: 1,
//           totalViews: 1,
//           totalEnquiries: 1,
//           avgRating: { $round: ["$avgRating", 1] }
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: stats[0] || {
//         totalServices: 0,
//         activeServices: 0,
//         totalViews: 0,
//         totalEnquiries: 0,
//         avgRating: 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // 5. Consultation Management
// const getConsultations = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id  });
//     if (!lawyer) {
//       return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     const { filter } = req.query;
//     let query = { lawyerId: lawyer._id };

//     if (filter === 'upcoming') {
//       query.date = { $gte: new Date() };
//       query.status = { $in: ['pending', 'confirmed'] };
//     } else if (filter === 'past') {
//       query.date = { $lt: new Date() };
//     }

//     const consultations = await ConsultationModel.find(query)
//       .populate('serviceId', 'title description')
//       .populate('clientId', 'firstName lastName email phone')
//       .sort({ date: 1, startTime: 1 });

//     res.json({ success: true, data: consultations });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const addConsultationNote = async (req, res) => {
//   try {
//     const lawyer = await Lawyer.findOne({ userId: req.user._id  || req.user.id  });
//     if (!lawyer) {
//       return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     const consultation = await ConsultationModel.findOneAndUpdate(
//       { _id: req.params.id, lawyerId: lawyer._id },
//       { $push: { notes: req.body.note } },
//       { new: true }
//     );

//     if (!consultation) {
//       return res.status(404).json({ success: false, message: 'Consultation not found' });
//     }

//     res.json({ success: true, data: consultation });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };



// // ➡️ Verification APIs
// const submitVerification = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findByIdAndUpdate(
//       req.params.id,
//       { 
//         'verification.documents': req.body.documents,
//         'verification.status': 'pending'
//       },
//       { new: true }
//     );
//     res.status(200).json(lawyer);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const approveVerification = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findByIdAndUpdate(
//       req.params.id,
//       { 'verification.isVerified': true },
//       { new: true }
//     );
//     res.status(200).json(lawyer);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// const getAnalytics = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({userId: req.user._id  || req.user.id });
//     if (!lawyer) {
//       return res.status(403).json({ success: false, message: 'Lawyer profile not found' });
//     }

//     // Last 6 months earnings
//     const monthlyEarnings = await Payment.aggregate([
//       { 
//         $match: { 
//           lawyerId: lawyer._id,
//           createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
//         } 
//       },
//       {
//         $group: {
//           _id: {
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" }
//           },
//           total: { $sum: "$amount" }
//         }
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } }
//     ]);

//     // Appointment status distribution
//     const appointmentStats = await Appointment.aggregate([
//       { $match: { lawyerId: lawyer._id } },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Client demographics
//     const clientDemographics = await Appointment.aggregate([
//       { $match: { lawyerId: lawyer._id } },
//       { $group: { _id: "$clientId" } },
//       { $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "client"
//         }
//       },
//       { $unwind: "$client" },
//       { 
//         $group: {
//           _id: null,
//           locations: { $push: "$client.location" },
//           genders: { $push: "$client.gender" },
//           ageGroups: {
//             $push: {
//               $divide: [
//                 { $subtract: [new Date(), "$client.dateOfBirth"] },
//                 365 * 24 * 60 * 60 * 1000
//               ]
//             }
//           }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         monthlyEarnings,
//         appointmentStats,
//         clientDemographics: clientDemographics[0] || {}
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// // ➡️ Analytics Update (Call this periodically)
// const updateAnalytics = async (req, res) => {
//   try {
//     const stats = await Appointment.aggregate([
//       { $match: { lawyerId: req.params.id } },
//       { 
//         $group: {
//           _id: null,
//           avgRating: { $avg: "$rating" },
//           avgResponseTime: { $avg: "$responseTime" }
//         }
//       }
//     ]);
    
//     await LawyerModel.findByIdAndUpdate(
//       req.params.id,
//       { 
//         'analytics.avgRating': stats[0]?.avgRating || 0,
//         'analytics.responseTime': stats[0]?.avgResponseTime || 0 
//       }
//     );
    
//     res.status(200).json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update lawyer's practice areas
// const updatePracticeAreas = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOneAndUpdate(
//       { userId: req.user.id },
//       { practiceAreas: req.body.categories },
//       { new: true }
//     ).populate('practiceAreas', 'displayName slug');

//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         error: "Lawyer not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: lawyer.practiceAreas
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Get lawyer's dashboard overview
// const getDashboardOverview = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user.id });
//     if (!lawyer) {
//       return res.status(404).json({
//         success: false,
//         error: "Lawyer not found"
//       });
//     }

//     const [services, appointments, consultations] = await Promise.all([
//       LegalService.countDocuments({ lawyerId: lawyer._id, status: 'active' }),
//       Appointment.countDocuments({ lawyerId: lawyer._id }),
//       Consultation.countDocuments({ lawyerId: lawyer._id })
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         services,
//         appointments,
//         consultations,
//         rating: lawyer.rating,
//         verificationStatus: lawyer.verification.status
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   addLawyer,
//   getAllLawyers,
//   getLawyerProfile,
//   updateLawyerProfile,
//   getLawyerById,
//   getTopRatedLawyers,
//   getLawyerServicesByCategory,
//   updateLawyer,
//   deleteLawyer,
//   updateAvailableSlots,
//   updateAvailability,
//   getConsultations,
//   addConsultationNote,
//   createService,
//   getLawyerServices,
//   updateService,
//   deleteService,
//   getServiceStats,
//   getDashboardStats,
//   getLawyerCases,
//   getCaseStats,
//   getAppointments,
//   updateAppointmentStatus,
//   submitVerification,
//   approveVerification,
//   getAnalytics,
//   updateAnalytics,
//   updatePracticeAreas,
//   getDashboardOverview
 
// };
