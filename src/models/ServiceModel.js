const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'Family Law', 
      'Criminal Law', 
      'Corporate Law',
      'Divorce',
      'Immigration',
      'Personal Injury',
      'Real Estate',
      'Tax Law',
      'Employment Law'
    ]
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);