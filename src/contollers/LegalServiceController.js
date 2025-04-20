const LegalService = require('../models/LegalServicesModel');
const Lawyer = require('../models/LawyerModel');
const LegalCategory = require('../models/LegalCategory');
const { uploadToCloudinary } = require('../utils/CloudinaryUtil');
const { paginate } = require('../utils/pagination');
const LawyerModel = require('../models/LawyerModel');

// @desc    Create new legal service
// @route   POST /api/services
// @access  Private/Lawyer
const createService = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "Lawyer profile not found. Please create a lawyer profile first."
      });
    }

    const { title, description, practiceArea, subCategory, price, isRecurring, timeSlots } = req.body;

    // Validate subcategory against practice area
    const category = await LegalCategory.findById(practiceArea);
    if (!category || !SERVICE_SUBCATEGORIES[category.slug].includes(subCategory)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subcategory for selected practice area"
      });
    }

    // Handle timeSlots
    const parsedTimeSlots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
    if (!Array.isArray(parsedTimeSlots)) {
      return res.status(400).json({
        success: false,
        error: "timeSlots must be an array"
      });
    }

    // Handle file uploads
    const documents = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, 'legal-services');
        documents.push({
          name: file.originalname,
          url: result.secure_url
        });
      }
    }

    // Auto-generate slug
    const slug = title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');

    const service = new LegalService({
      lawyerId: lawyer._id,
      title,
      slug,
      description,
      practiceArea,
      subCategory,
      pricing: {
        type: 'Fixed',
        baseAmount: price,
        displayAmount: `₹${price.toLocaleString('en-IN')}`
      },
      isRecurring,
      timeSlots: parsedTimeSlots,
      documents,
      status: lawyer.isVerified ? 'active' : 'pending'
    });

    await service.save();
    
    // Add service to lawyer's services array
    lawyer.services.push(service._id);
    await lawyer.save();

    res.status(201).json({
      success: true,
      data: service
    });

  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get services for directory (LawRato-style)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { 
      category, 
      subCategory,
      minPrice, 
      maxPrice,
      city,
      page = 1,
      limit = 10,
      sort = 'rating'
    } = req.query;

    // Build filters
    const filters = { status: 'active' };
    if (category) {
      const cat = await LegalCategory.findOne({ slug: category });
      if (cat) filters.practiceArea = cat._id;
    }
    if (subCategory) filters.subCategory = subCategory;
    if (minPrice || maxPrice) {
      filters['pricing.baseAmount'] = {};
      if (minPrice) filters['pricing.baseAmount'].$gte = Number(minPrice);
      if (maxPrice) filters['pricing.baseAmount'].$lte = Number(maxPrice);
    }
    if (city) filters['lawyer.address.city'] = new RegExp(city, 'i');

    // Sorting options
    const sortOptions = {
      rating: { 'lawyer.rating.average': -1 },
      price_asc: { 'pricing.baseAmount': 1 },
      price_desc: { 'pricing.baseAmount': -1 },
      newest: { createdAt: -1 }
    };

    // Get paginated services with lawyer details
    const result = await paginate(
      LegalService,
      filters,
      sortOptions[sort],
      page,
      limit,
      [
        'title',
        'slug',
        'description',
        'subCategory',
        'pricing',
        'lawyer',
        'processFlow'
      ],
      [
        {
          path: 'lawyer',
          select: 'name rating experience consultationFee profilePicture address'
        },
        {
          path: 'practiceArea',
          select: 'displayName slug'
        }
      ]
    );

    res.status(200).json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single service details
// @route   GET /api/services/:slug
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await LegalService.findOne({ slug: req.params.slug })
      .populate({
        path: 'lawyerId',
        select: 'name rating experience consultationFee profilePicture address about languages',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('practiceArea', 'displayName slug');

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Increment view count
    service.stats.views += 1;
    await service.save();

    // Get similar services
    const similarServices = await LegalService.find({
      subCategory: service.subCategory,
      _id: { $ne: service._id },
      status: 'active'
    })
      .limit(4)
      .select('title slug pricing lawyerId')
      .populate('lawyerId', 'name rating profilePicture');

    res.status(200).json({
      success: true,
      data: {
        service,
        similarServices,
        lawyer: service.lawyerId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get services by lawyer
// @route   GET /api/lawyers/:id/services
// @access  Public
const getLawyerServices = async (req, res) => {
  try {
    const services = await LegalService.find({
      lawyerId: req.params.id,
      status: 'active'
    })
      .select('title slug description pricing processFlow')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Lawyer
const updateService = async (req, res) => {
  try {
    const { title, description, practiceArea, price, isRecurring, timeSlots } = req.body;
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });

    let service = await LegalService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Verify lawyer owns the service
    if (!service.lawyerId.equals(lawyer._id)) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this service'
      });
    }

    // Handle file uploads
    const documents = [...service.documents];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, 'legal-services');
        documents.push({
          name: file.originalname,
          url: result.secure_url
        });
      }
    }

    // Update fields
    const updates = {
      title,
      description,
      practiceArea,
      'pricing.baseAmount': price,
      'pricing.displayAmount': `₹${price.toLocaleString('en-IN')}`,
      isRecurring,
      timeSlots: typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots,
      documents
    };

    service = await LegalService.findByIdAndUpdate(req.params.id, updates, { 
      new: true, 
      runValidators: true 
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Lawyer
const deleteService = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    const service = await LegalService.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Verify lawyer owns the service
    if (!service.lawyerId.equals(lawyer._id)) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this service'
      });
    }

    await service.remove();
    
    // Remove service from lawyer's services array
    lawyer.services.pull(service._id);
    await lawyer.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get pending services (Admin)
// @route   GET /api/admin/services/pending
// @access  Private/Admin
// const getPendingServices = async (req, res) => {
//   try {
//     const services = await LegalService.find({ status: 'pending' })
//       .populate('lawyerId', 'name')
//       .populate('practiceArea', 'displayName');

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


const getServicesByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      page = 1, 
      limit = 10,
      minPrice,
      maxPrice,
      city,
      sort = 'rating' 
    } = req.query;

    // Find the category first
    const category = await LegalCategory.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Build filters
    const filters = { 
      practiceArea: category._id,
      status: 'active'
    };

    if (minPrice || maxPrice) {
      filters['pricing.baseAmount'] = {};
      if (minPrice) filters['pricing.baseAmount'].$gte = Number(minPrice);
      if (maxPrice) filters['pricing.baseAmount'].$lte = Number(maxPrice);
    }

    if (city) {
      filters['lawyer.address.city'] = new RegExp(city, 'i');
    }

    // Sorting options
    const sortOptions = {
      rating: { 'lawyer.rating.average': -1 },
      price_asc: { 'pricing.baseAmount': 1 },
      price_desc: { 'pricing.baseAmount': -1 },
      newest: { createdAt: -1 }
    };

    // Get paginated results
    const result = await paginate(
      LegalService,
      filters,
      sortOptions[sort] || sortOptions.rating,
      page,
      limit,
      [
        'title',
        'slug',
        'description',
        'subCategory',
        'pricing',
        'lawyer',
        'processFlow'
      ],
      [
        {
          path: 'lawyer',
          select: 'name rating experience consultationFee profilePicture address'
        },
        {
          path: 'practiceArea',
          select: 'displayName slug'
        }
      ]
    );

    res.status(200).json({
      success: true,
      category: {
        _id: category._id,
        name: category.displayName,
        description: category.description
      },
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve/reject service (Admin)
// @route   PUT /api/admin/services/:id/status
// @access  Private/Admin
// const updateServiceStatus = async (req, res) => {
//   try {
//     const { status, rejectionReason } = req.body;

//     const service = await LegalService.findByIdAndUpdate(
//       req.params.id,
//       { 
//         status,
//         ...(status === 'rejected' && { rejectionReason }) 
//       },
//       { new: true }
//     );

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: 'Service not found'
//       });
//     }

//     // If approved, update lawyer's service count
//     if (status === 'active') {
//       await Lawyer.findByIdAndUpdate(service.lawyerId, {
//         $inc: { 'stats.serviceCount': 1 }
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: service
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// @desc    Get popular services for homepage
// @route   GET /api/services/popular
// @access  Public
const getPopularServices = async (req, res) => {
  try {
    const services = await LegalService.find({ status: 'active' })
      .sort({ 'stats.views': -1 })
      .limit(8)
      .select('title slug pricing lawyerId')
      .populate('lawyerId', 'name rating profilePicture');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const unifiedSearch = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    const results = {};
    
    // Search categories if requested
    if (type === 'all' || type === 'categories') {
      results.categories = await LegalCategory.find({
        $or: [
          { displayName: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') }
        ]
      })
      .select('slug displayName description icon')
      .limit(5);
    }
    
    // Search lawyers if requested
    if (type === 'all' || type === 'lawyers') {
      results.lawyers = await Lawyer.find({
        name: new RegExp(q, 'i'),
        isVerified: true
      })
      .select('name rating experience consultationFee profilePicture address')
      .limit(5);
    }
    
    // Search services if requested
    if (type === 'all' || type === 'services') {
      results.services = await LegalService.find({
        $or: [
          { title: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') }
        ],
        status: 'active'
      })
      .populate('lawyerId', 'name rating profilePicture')
      .select('title slug pricing lawyerId')
      .limit(5);
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get platform statistics for homepage
// @route   GET /api/v1/public/home/stats
// @access  Public
const getPlatformStats = async (req, res) => {
  try {
    const [lawyerCount, serviceCount, categoryCount] = await Promise.all([
      Lawyer.countDocuments({ isVerified: true }),
      LegalService.countDocuments({ status: 'active' }),
      LegalCategory.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        lawyerCount,
        serviceCount,
        categoryCount,
        consultationCount: 0 // You can implement this if you track consultations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all pending services for admin review
// @route   GET /api/services/pending
// @access  Private/Admin
const getPendingServices = async (req, res) => {
  try {
    const services = await LegalService.find({ status: 'pending' })
      .populate({
        path: 'lawyer',
        select: 'name email',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('practiceArea', 'displayName slug')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// @desc    Approve/reject service (admin only)
// @route   PUT /api/services/:id/status
// @access  Private/Admin
const updateServiceStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['approved', 'rejected', 'active', 'inactive'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }

    const updateData = { 
      status: status === 'approved' ? 'active' : status,
      ...(status === 'rejected' && { rejectionReason })
    };

    const service = await LegalService.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('lawyer', 'name')
      .populate('practiceArea', 'displayName');

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Notify lawyer if service was approved/rejected
    if (['approved', 'rejected'].includes(status)) {
      await Notification.create({
        user: service.lawyer.userId,
        title: `Service ${status}`,
        message: `Your service "${service.title}" has been ${status}`,
        type: 'service-status',
        relatedEntity: service._id
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all reported services for admin review
// @route   GET /api/services/reported
// @access  Private/Admin
const getReportedServices = async (req, res) => {
  try {
    const services = await LegalService.find({ 
      'reports.0': { $exists: true } // Services with at least one report
    })
      .populate({
        path: 'reports.reportedBy',
        select: 'firstName lastName'
      })
      .populate('lawyer', 'name')
      .populate('practiceArea', 'displayName')
      .sort({ 'reports.createdAt': -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services.map(service => ({
        ...service.toObject(),
        reportCount: service.reports.length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createService,
  getService,
  getServices,
  getLawyerServices,
  updateService,
  deleteService,
  getPendingServices,
  getServicesByCategory,
  updateServiceStatus,
  getPopularServices,
  getPlatformStats,
  unifiedSearch,
  getPendingServices,
  updateServiceStatus,
  getReportedServices
}






// const LegalService = require('../models/LegalServicesModel');

// const { uploadToCloudinary } = require('../utils/CloudinaryUtil');
// const LawyerModel = require('../models/LawyerModel');

// // Create a new legal service
// exports.createService = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//     if (!lawyer) {
//         return res.status(404).json({
//           success: false,
//           error: "Lawyer profile not found. Please create a lawyer profile first."
//         });
//       }
  
//     const { title, description, practiceArea, price, isRecurring, timeSlots } = req.body;
   
//     const parsedTimeSlots = typeof timeSlots === 'string' 
//     ? JSON.parse(timeSlots) 
//     : timeSlots;

//   // Validate timeSlots is an array
//   if (!Array.isArray(parsedTimeSlots)) {
//     return res.status(400).json({
//       success: false,
//       error: "timeSlots must be an array."
//     });
//   }


//     // Handle file uploads
//     const documents = [];
//     if (req.files) {
//       for (const file of req.files) {
//         const result = await uploadToCloudinary(file.path, 'legal-services');
//         documents.push({
//           name: file.originalname,
//           url: result.secure_url
//         });
//       }
//     }

//     const service = new LegalService({
//       lawyerId: lawyer._id,
//       title,
//       description,
//       practiceArea,
//       price,
//       isRecurring,
//       timeSlots: parsedTimeSlots ,
//       documents,
//       status: 'pending'
//     });

//     await service.save();
    
//     // Add service to lawyer's services array
//     lawyer.services.push(service._id);
//     await lawyer.save();

//     res.status(201).json({
//       success: true,
//       data: service
//     });

//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // Get all services for a lawyer
// exports.getLawyerServices = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//     const services = await LegalService.find({ lawyerId: lawyer._id })
//       .sort({ createdAt: -1 });

//     res.json({
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

// // Get a single service
// exports.getService = async (req, res) => {
//   try {
//     const service = await LegalService.findById(req.params.id)
//       .populate('lawyerId', 'userId')
//       .populate({
//         path: 'lawyerId',
//         populate: {
//           path: 'userId',
//           select: 'firstName lastName'
//         }
//       });

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: 'Service not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: service
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Update a service
// exports.updateService = async (req, res) => {
//   try {
//     const { title, description, practiceArea, price, isRecurring, timeSlots } = req.body;
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id});

//     let service = await LegalService.findById(req.params.id);
//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: 'Service not found'
//       });
//     }

//     // Verify lawyer owns the service
//     if (!service.lawyerId.equals(lawyer._id)) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to update this service'
//       });
//     }

//     // Handle file uploads
//     const documents = [...service.documents];
//     if (req.files) {
//       for (const file of req.files) {
//         const result = await uploadToCloudinary(file.path, 'legal-services');
//         documents.push({
//           name: file.originalname,
//           url: result.secure_url
//         });
//       }
//     }

//     service = await LegalService.findByIdAndUpdate(req.params.id, {
//       title,
//       description,
//       practiceArea,
//       price,
//       isRecurring,
//       timeSlots: JSON.parse(timeSlots),
//       documents
//     }, { new: true, runValidators: true });

//     res.json({
//       success: true,
//       data: service
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Delete a service
// exports.deleteService = async (req, res) => {
//   try {
//     const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
//     const service = await LegalService.findById(req.params.id);

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         error: 'Service not found'
//       });
//     }

//     // Verify lawyer owns the service
//     if (!service.lawyerId.equals(lawyer._id)) {
//       return res.status(401).json({
//         success: false,
//         error: 'Not authorized to delete this service'
//       });
//     }

//     await service.remove();
    
//     // Remove service from lawyer's services array
//     lawyer.services.pull(service._id);
//     await lawyer.save();

//     res.json({
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

// // Get all services (public)
// exports.getServices = async (req, res) => {
//   try {
//     const { practiceArea, minPrice, maxPrice, lawyerId } = req.query;
//     const query = { status: 'active' };

//     if (practiceArea) query.practiceArea = practiceArea;
//     if (minPrice || maxPrice) {
//       query.price = {};
//       if (minPrice) query.price.$gte = Number(minPrice);
//       if (maxPrice) query.price.$lte = Number(maxPrice);
//     }
//     if (lawyerId) query.lawyerId = lawyerId;

//     const services = await LegalService.find(query)
//       .populate({
//         path: 'lawyerId',
//         select: 'userId',
//         populate: {
//           path: 'userId',
//           select: 'firstName lastName'
//         }
//       })
//       .sort({ createdAt: -1 });

//     res.json({
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






