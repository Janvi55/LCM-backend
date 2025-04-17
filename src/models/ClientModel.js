const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyers: [{
    type: Schema.Types.ObjectId,
    ref: 'Lawyer'
  }],
  cases: [{
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['active', 'closed', 'pending'],
      default: 'active'
    },
    openedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  billingInfo: {
    paymentMethod: String,
    billingAddress: String
  },
  contactHistory: [{
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ['email', 'call', 'meeting'] },
    summary: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  importantDates: {
    nextFollowUp: Date,
    birthday: Date
  },
  preferences: {
    contactMethod: { type: String, enum: ['email', 'phone', 'sms'], default: 'email' },
    language: String
  },
  billingHistory: [{
    date: Date,
    amount: Number,
    description: String,
    status: { type: String, enum: ['paid', 'pending', 'overdue'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);