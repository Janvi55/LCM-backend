const multer = require("multer");
const path = require("path");

// ========================
// 1. FILE UPLOAD MIDDLEWARE
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents/"); // Save to 'uploads/documents/'
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName); // Unique filename (e.g., '123456789-123456789.pdf')
  },
});


const fileSizeLimit = 10 * 1024 * 1024; // 10MB
const verificationSizeLimit = 5 * 1024 * 1024; // 5MB

const allowedDocumentTypes = [".pdf", ".docx", ".txt", ".jpeg", ".jpg", ".png"];
const allowedVerificationTypes = [".pdf", ".jpg", ".jpeg", ".png"];

// ========================
// 2. STORAGE CONFIGURATIONS
// ========================
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/verifications/");
  },
  filename: (req, file, cb) => {
    cb(null, `verify-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// ========================
// 3. MULTER INSTANCES
// ========================
const uploadSingle = multer({
  storage: documentStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    allowedDocumentTypes.includes(ext) 
      ? cb(null, true)
      : cb(new Error(`Only ${allowedDocumentTypes.join(", ")} files are allowed!`), false);
  }
});

const uploadMultiple = multer({
  storage: verificationStorage,
  limits: { fileSize: verificationSizeLimit },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    allowedVerificationTypes.includes(ext)
      ? cb(null, true)
      : cb(new Error(`Only ${allowedVerificationTypes.join(", ")} files are allowed!`), false);
  }
});

// const uploadSingle = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [".pdf", ".docx", ".txt", ".jpeg"]; // Allowed extensions
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowedTypes.includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only PDF, DOCX, and TXT files are allowed!"), false);
//     }
//   },
// }).single("document"); // Field name: 'document'

// Wrapper for Multer (to handle errors cleanly)
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(); // Proceed if upload succeeds
  });
};

// ========================
// 2. DOCUMENT PERMISSION CHECK
// ========================
const checkDocumentPermission = (req, res, next) => {
  const { userId } = req.user; // From authMiddleware
  const documentId = req.params.id;

  // Replace with your DB check (example: MongoDB)
  Document.findOne({ _id: documentId, owner: userId })
    .then((doc) => {
      if (!doc) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access this document.",
        });
      }
      req.document = doc; // Attach document to request
      next();
    })
    .catch((err) => res.status(500).json({ success: false, message: "Server error" }));
};

// In your existing Documentmiddleware.js
const lawyerVerificationStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/verifications/'); // Different folder for lawyer docs
    },
    filename: (req, file, cb) => {
      cb(null, `verify-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
  });
  
  // Add this to your exports
  const handleVerificationUpload = multer({
    storage: lawyerVerificationStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
      const ext = path.extname(file.originalname).toLowerCase();
      allowedTypes.includes(ext) ? cb(null, true) : cb(new Error('Only PDF/JPEG/PNG allowed'));
    }
  }).array('documents', 5); // Max 5 files






module.exports = {
  handleUpload,       // For uploading files
  checkDocumentPermission,
  handleVerificationUpload,
  uploadSingle,
  uploadMultiple,
};