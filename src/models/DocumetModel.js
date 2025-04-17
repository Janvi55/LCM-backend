const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'jpg', 'png', 'txt', 'jpeg'],
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer'
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  caseId: String, // Optional case reference
  description: String,
  metadata: {
    size: Number, // File size in bytes
    pages: Number // For PDFs
  },
  accessList: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'download', 'edit'],
      default: 'view'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);