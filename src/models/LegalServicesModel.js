const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const legalServiceSchema = new Schema({
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  practiceArea: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  timeSlots: [{
    date: Date,
    startTime: String,
    endTime: String,
    consultationType: {
      type: String,
      enum: ['virtual', 'in-person']
    }
  }],
  documents: [{
    name: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LegalService', legalServiceSchema);

//2

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const legalServiceSchema = new Schema({
//   // Basic Information
//   lawyerId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Lawyer',
//     required: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100
//   },
//   slug: {
//     type: String,
//     unique: true,
//     lowercase: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   highlights: [{  // Key highlights like LawRato's service cards
//     type: String,
//     maxlength: 100
//   }],
//   benefits: [{  // What clients will get from this service
//     type: String,
//     maxlength: 150
//   }],

//   // Legal Categories (like LawRato's practice areas)
//   practiceArea: {
//     type: String,
//     enum: [
//       'Divorce & Family', 'Criminal', 'Corporate', 'Property', 
//       'Employment', 'Immigration', 'Tax', 'Intellectual Property',
//       'Banking & Finance', 'Consumer Protection', 'Cyber Crime', 'Civil',
//       'Motor Accident', 'Cheque Bounce', 'GST', 'Startup', 'Marriage',
//       'Child Custody', 'Domestic Violence', 'Cyber Crime', 'Medical Negligence'
//     ],
//     required: true
//   },
//   subPracticeArea: String, // More specific categorization

//   // Service Details
//   serviceType: {
//     type: String,
//     enum: [
//       'Legal Advice', 'Document Review', 'Notice Drafting', 
//       'Case Evaluation', 'Court Appearance', 'Full Case Handling',
//       'Document Drafting', 'Legal Opinion', 'Online Consultation',
//       'Property Registration', 'Agreement Drafting', 'Will Drafting'
//     ],
//     required: true
//   },
//   serviceImage: String, // Like LawRato's service images
//   serviceBanner: String, // For detailed service pages

//   // Pricing (matching LawRato's pricing display)
//   pricing: {
//     type: {
//       type: String,
//       enum: ['Fixed', 'Hourly', 'Custom', 'Free', 'Starting From'],
//       default: 'Fixed'
//     },
//     amount: Number,
//     displayAmount: String, // For showing "₹1,500" format
//     originalAmount: Number, // For showing strikethrough pricing if discounted
//     currency: {
//       type: String,
//       default: 'INR'
//     },
//     includes: [String], // What's included in this price
//     excludes: [String] // What's not included
//   },

//   // Availability (like LawRato's booking system)
//   availability: {
//     type: {
//       type: String,
//       enum: ['Instant', 'Scheduled', 'Both'],
//       default: 'Scheduled'
//     },
//     responseTime: String, // e.g., "Typically replies within 24 hours"
//     availableDays: [{
//       type: String,
//       enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//     }],
//     timeSlots: [{
//       startTime: String,
//       endTime: String,
//       isAvailable: Boolean
//     }]
//   },

//   // Service Delivery Options
//   serviceMode: {
//     type: [String],
//     enum: ['Video Call', 'Phone Call', 'In-Person', 'Chat', 'Email'],
//     default: ['Video Call']
//   },
//   locations: [{  // For in-person services
//     city: String,
//     address: String,
//     landmark: String,
//     googleMapsLink: String
//   }],

//   // Documents (like LawRato's document samples)
//   documents: [{
//     name: String,
//     url: String,
//     previewImage: String,
//     type: {
//       type: String,
//       enum: ['Sample', 'Template', 'Certificate', 'Guideline']
//     }
//   }],

//   // FAQ Section (like LawRato's service FAQs)
//   faqs: [{
//     question: String,
//     answer: String
//   }],

//   // Reviews & Ratings (like LawRato's review system)
//   rating: {
//     average: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5
//     },
//     totalReviews: Number,
//     reviews: [{
//       clientId: {
//         type: Schema.Types.ObjectId,
//         ref: 'User'
//       },
//       clientName: String,
//       rating: Number,
//       comment: String,
//       date: {
//         type: Date,
//         default: Date.now
//       },
//       lawyerReply: {
//         text: String,
//         date: Date
//       }
//     }]
//   },

//   // Service Status & Visibility
//   status: {
//     type: String,
//     enum: ['Draft', 'Pending', 'Active', 'Inactive', 'Rejected'],
//     default: 'Pending'
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   isFeatured: {
//     type: Boolean,
//     default: false
//   },
//   featuredExpiry: Date,

//   // Statistics
//   views: Number,
//   enquiries: Number,
//   bookings: Number,

//   // Metadata
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: Date,
//   lastBooked: Date
// }, {
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Add virtuals and pre-save hooks as needed
// legalServiceSchema.pre('save', function(next) {
//   if (!this.displayAmount && this.pricing.amount) {
//     this.pricing.displayAmount = `₹${this.pricing.amount.toLocaleString('en-IN')}`;
//   }
//   next();
// });

// module.exports = mongoose.model('LegalService', legalServiceSchema);

