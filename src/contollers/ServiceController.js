const Service = require('../models/ServiceModel');
const Lawyer = require('../models/LawyerModel');

// Create a new service
const createService = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    const service = new Service({
      name,
      description,
      category
    });

    await service.save();

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

// Get all services
 const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    
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

// Add specialization to lawyer
const addSpecialization = async (req, res) => {
  try {
    const { lawyerId, serviceId } = req.body;

    const lawyer = await Lawyer.findByIdAndUpdate(
      lawyerId,
      { $addToSet: { specializations: serviceId } },
      { new: true, runValidators: true }
    ).populate('specializations');

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      data: lawyer.specializations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Remove specialization from lawyer
const removeSpecialization = async (req, res) => {
  try {
    const { lawyerId, serviceId } = req.body;

    const lawyer = await Lawyer.findByIdAndUpdate(
      lawyerId,
      { $pull: { specializations: serviceId } },
      { new: true }
    ).populate('specializations');

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      data: lawyer.specializations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get lawyers by specialization
const getLawyersBySpecialization = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const lawyers = await Lawyer.find({ 
      specializations: serviceId,
      status: 'active'
    }).populate('userId', 'firstName lastName profilePicture');

    res.json({
      success: true,
      count: lawyers.length,
      data: lawyers
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
    getAllServices,
    addSpecialization,
    removeSpecialization,
    getLawyersBySpecialization,

  };