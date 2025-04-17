const CaseModel = require('../models/CaseModel');
const DocumentModel = require('../models/DocumetModel');
const LawyerModel = require('../models/LawyerModel');

// Create new case (Lawyer only)
exports.createCase = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const newCase = new CaseModel({
      ...req.body,
      lawyerId: lawyer._id
    });

    await newCase.save();

    res.status(201).json({
      success: true,
      data: newCase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all cases for authenticated lawyer
exports.getLawyerCases = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const { status, practiceArea, clientId } = req.query;
    const filter = { lawyerId: lawyer._id };

    if (status) filter.status = status;
    if (practiceArea) filter.practiceArea = practiceArea;
    if (clientId) filter.clientId = clientId;

    const cases = await CaseModel.find(filter)
      .populate('clientId', 'firstName lastName email')
      .populate('documents', 'name url')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single case with details (Lawyer must own the case)
exports.getLawyerCase = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const caseDoc = await CaseModel.findOne({
      _id: req.params.id,
      lawyerId: lawyer._id
    })
      .populate('clientId', 'firstName lastName email phone')
      .populate('documents')
      .populate({
        path: 'lawyerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      });

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        error: 'Case not found or access denied'
      });
    }

    res.json({
      success: true,
      data: caseDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update case (Lawyer only)
exports.updateCase = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const updatedCase = await CaseModel.findOneAndUpdate(
      { _id: req.params.id, lawyerId: lawyer._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found or access denied'
      });
    }

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Add hearing to case
exports.addHearing = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    const updatedCase = await CaseModel.findOneAndUpdate(
      { _id: req.params.id, lawyerId: lawyer._id },
      { $push: { hearings: req.body } },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found or access denied'
      });
    }

    res.json({
      success: true,
      data: updatedCase.hearings.slice(-1)[0] // Return the newly added hearing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Link document to case
exports.linkDocument = async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({ userId: req.user._id || req.user.id });
    if (!lawyer) {
      return res.status(403).json({
        success: false,
        error: "Lawyer profile not found"
      });
    }

    // Verify document exists and belongs to lawyer
    const document = await DocumentModel.findOne({
      _id: req.body.documentId,
      lawyerId: lawyer._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    const updatedCase = await CaseModel.findOneAndUpdate(
      { _id: req.params.id, lawyerId: lawyer._id },
      { $addToSet: { documents: req.body.documentId } },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};