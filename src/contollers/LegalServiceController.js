const LegalService = require('../models/LegalServicesModel');

const { uploadToCloudinary } = require('../utils/CloudinaryUtil');
const LawyerModel = require('../models/LawyerModel');

// Create a new legal service
exports.createService = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
    if (!lawyer) {
        return res.status(404).json({
          success: false,
          error: "Lawyer profile not found. Please create a lawyer profile first."
        });
      }
  
    const { title, description, practiceArea, price, isRecurring, timeSlots } = req.body;
   
    const parsedTimeSlots = typeof timeSlots === 'string' 
    ? JSON.parse(timeSlots) 
    : timeSlots;

  // Validate timeSlots is an array
  if (!Array.isArray(parsedTimeSlots)) {
    return res.status(400).json({
      success: false,
      error: "timeSlots must be an array."
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

    const service = new LegalService({
      lawyerId: lawyer._id,
      title,
      description,
      practiceArea,
      price,
      isRecurring,
      timeSlots: parsedTimeSlots ,
      documents,
      status: 'pending'
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
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all services for a lawyer
exports.getLawyerServices = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
    const services = await LegalService.find({ lawyerId: lawyer._id })
      .sort({ createdAt: -1 });

    res.json({
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

// Get a single service
exports.getService = async (req, res) => {
  try {
    const service = await LegalService.findById(req.params.id)
      .populate('lawyerId', 'userId')
      .populate({
        path: 'lawyerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const { title, description, practiceArea, price, isRecurring, timeSlots } = req.body;
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id});

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

    service = await LegalService.findByIdAndUpdate(req.params.id, {
      title,
      description,
      practiceArea,
      price,
      isRecurring,
      timeSlots: JSON.parse(timeSlots),
      documents
    }, { new: true, runValidators: true });

    res.json({
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

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id  || req.user.id });
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

    res.json({
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

// Get all services (public)
exports.getServices = async (req, res) => {
  try {
    const { practiceArea, minPrice, maxPrice, lawyerId } = req.query;
    const query = { status: 'active' };

    if (practiceArea) query.practiceArea = practiceArea;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (lawyerId) query.lawyerId = lawyerId;

    const services = await LegalService.find(query)
      .populate({
        path: 'lawyerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
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