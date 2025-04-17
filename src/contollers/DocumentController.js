const DocumentModel = require("../models/DocumetModel");
const fs = require('fs');
const path = require('path');

// Upload document (with file handling)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = new DocumentModel({
      filename: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).slice(1),
      uploadedBy: req.user.id,
      lawyerId: req.body.lawyerId,
      clientId: req.body.clientId,
      description: req.body.description,
      metadata: {
        size: req.file.size
      }
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get documents with filters
exports.getDocuments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.lawyerId) filter.lawyerId = req.query.lawyerId;
    if (req.query.clientId) filter.clientId = req.query.clientId;
    if (req.query.type) filter.fileType = req.query.type;

    const documents = await DocumentModel.find(filter)
      .populate('uploadedBy', 'firstName lastName')
      .populate('lawyerId', 'firstName specialization')
      .populate('clientId', 'firstName lastName');

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// In DocumentController.js, add this new method:
exports.getDocument = async (req, res) => {
  try {
    // The document is already attached to req by checkDocumentPermission middleware
    if (!req.document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    res.status(200).json({
      success: true,
      document: req.document
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch document: " + error.message
    });
  }
};

// Secure file download
exports.downloadDocument = async (req, res) => {
  try {
    const document = await DocumentModel.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permissions (example - expand as needed)
    const hasAccess = document.accessList.some(access => 
      access.userId.equals(req.user.id)
    );
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', document.fileUrl);
    res.download(filePath, document.filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await DocumentModel.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete physical file
    fs.unlinkSync(path.join(__dirname, '..', document.fileUrl));
    
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};