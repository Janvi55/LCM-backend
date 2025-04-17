const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const consultationSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'LegalService',
    required: true
  },
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    enum: ['virtual', 'in-person'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  meetingLink: String,
  notes: [String],
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);