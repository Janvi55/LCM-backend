// models/LegalCategory.js
const mongoose = require('mongoose');
const Schema= mongoose.Schema
const LegalCategorySchema = new Schema({
  slug: { 
    type: String, 
    unique: true, 
    required: true,  // e.g., 'divorce-lawyers', 'gst-lawyers'
    enum: [
      'divorce-lawyers',
      'criminal-lawyers',
      'family-lawyers',
      'property-lawyers',
      'cheque-bounce',
      'gst-lawyers',
      'employment-lawyers'
    ]
  },
  displayName: { 
    type: String, 
    required: true  // e.g., 'Divorce Lawyers - Family Law Specialists'
  },
  description: { 
    type: String   // SEO meta description
  }
});

module.exports = mongoose.model('LegalCategory', LegalCategorySchema);