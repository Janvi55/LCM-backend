const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require("../contollers/DocumentController");
const authMiddleware  = require("../middleware/AuthMiddleware");
const { handleUpload, checkDocumentPermission } = require("../middleware/Documentmiddleware");

// Configure Multer for file uploads (keep your existing configuration)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Document management routes
router.post('/upload', 
  upload.single('document'), // Your existing multer config
  documentController.uploadDocument
);

// New route with permission check
router.get('/:id', 
  checkDocumentPermission, // Added permission middleware
  documentController.getDocument // You'll need to create this controller
);

// Your existing routes (keep them as is)
router.get('/', documentController.getDocuments);
router.get('/:id/download', documentController.downloadDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;