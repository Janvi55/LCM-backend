const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const caseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Case title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  caseNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'CASE-' + Math.floor(100000 + Math.random() * 900000);
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'archived'],
    default: 'draft'
  },
  practiceArea: {
    type: String,
    enum: ['criminal', 'family', 'corporate', 'property', 'employment'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  hearings: [{
    date: Date,
    location: String,
    purpose: String,
    outcome: String
  }],
  timeline: [{
    eventType: String,
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  billing: {
    feeStructure: { type: String, enum: ['hourly', 'fixed', 'contingency'] },
    hourlyRate: Number,
    totalAmount: Number,
    paidAmount: { type: Number, default: 0 }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Add indexes for better performance
caseSchema.index({ lawyerId: 1, status: 1 });
caseSchema.index({ clientId: 1 });
caseSchema.index({ caseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Case', caseSchema);