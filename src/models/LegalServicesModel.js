const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Subcategory mappings based on LegalCategory
const SERVICE_SUBCATEGORIES = {
  'divorce-lawyers': ['Mutual Divorce', 'Contested Divorce', 'Child Custody'],
  'criminal-lawyers': ['Bail Applications', 'FIR Quashing', 'Anticipatory Bail'],
  'family-lawyers': ['In-Law Problems', 'Marital Finance', 'Alimony'],
  'property-lawyers': ['Sale Deeds', 'Title Verification', 'Partition Suits'],
  'cheque-bounce-lawyers': ['Section 138 NI Act', 'Compounding Offences', 'Notice Drafting'],
  'gst-lawyers': ['GST Registration', 'Returns Filing', 'Appeals'],
  'employment-lawyers': ['Termination Disputes', 'Salary Recovery', 'POSH Cases'],
};

const legalServiceSchema = new Schema({
  // Core Identification
  lawyer: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/
  },
  description: {
    type: String,
    required: true,
    minlength: 100
  },

  // Categorization System
  practiceArea: {
    type: Schema.Types.ObjectId,
    ref: 'LegalCategory',
    required: true
  },
  subCategory: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Get the parent document (this) and check if practiceArea is populated
        if (!this.practiceArea) return false;
        
        // If practiceArea is an ObjectId, we can't validate synchronously
        if (this.practiceArea instanceof mongoose.Types.ObjectId) {
          return true; // Defer validation to pre-save hook
        }
        
        // If practiceArea is populated, we can validate
        const categorySlug = this.practiceArea.slug;
        return SERVICE_SUBCATEGORIES[categorySlug]?.includes(v) || false;
      },
      message: props => `"${props.value}" is not a valid subcategory for this practice area`
    }
  },

  // Service Content
  highlights: {
    type: [{
      icon: String,
      text: {
        type: String,
        maxlength: 100
      },
      _id: false
    }],
    validate: {
      validator: function(val) {
        return val.length <= 3;
      },
      message: 'Maximum 3 highlights allowed'
    }
  },
  processFlow: [{
    step: Number,
    title: String,
    duration: String,
    costComponent: String,
    _id: false
  }],

  // Pricing Structure
  pricing: {
    type: {
      type: String,
      enum: ['Fixed', 'Hourly', 'Package'],
      required: true
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0
    },
    displayAmount: String,
    includes: [String],
    excludes: [String]
  },

  // Availability
  availability: {
    bookingType: {
      type: String,
      enum: ['Instant', 'Scheduled'],
      default: 'Scheduled'
    },
    responseTime: String,
    timeSlots: [{
      day: String,
      startTime: String,
      endTime: String,
      _id: false
    }]
  },

  // Service Delivery
  serviceModes: {
    type: [String],
    enum: ['Video', 'Phone', 'In-Person', 'Chat'],
    default: ['Video']
  },

  // Documents
  requiredDocuments: [{
    name: String,
    description: String,
    sampleUrl: String
  }],

  // Stats & Visibility
  stats: {
    views: { type: Number, default: 0 },
    enquiries: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Inactive'],
    default: 'Draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
legalServiceSchema.index({ slug: 1 });
legalServiceSchema.index({ lawyer: 1 });
legalServiceSchema.index({ practiceArea: 1, subCategory: 1 });

// Virtuals
legalServiceSchema.virtual('subCategoryOptions').get(function() {
  if (!this.practiceArea || !this.practiceArea.slug) return [];
  return SERVICE_SUBCATEGORIES[this.practiceArea.slug] || [];
});

// Pre-save hook for validation and defaults
legalServiceSchema.pre('save', async function(next) {
  // Auto-generate slug
  if (!this.slug) {
    this.slug = this.title.toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Format display amount
  if (!this.pricing.displayAmount) {
    this.pricing.displayAmount = `₹${this.pricing.baseAmount.toLocaleString('en-IN')}`;
    if (this.pricing.type === 'Hourly') this.pricing.displayAmount += '/hour';
  }

  // Validate subcategory if practiceArea is an ObjectId
  if (this.practiceArea instanceof mongoose.Types.ObjectId && this.isModified('subCategory')) {
    const category = await mongoose.model('LegalCategory').findById(this.practiceArea);
    if (category && !SERVICE_SUBCATEGORIES[category.slug]?.includes(this.subCategory)) {
      throw new Error(`"${this.subCategory}" is not a valid subcategory for this practice area`);
    }
  }
  
  next();
});

// Update lawyer's service count
legalServiceSchema.post('save', async function(doc) {
  if (doc.isNew) {
    await mongoose.model('Lawyer').updateOne(
      { _id: doc.lawyer },
      { $inc: { 'stats.serviceCount': 1 } }
    );
  }
});

legalServiceSchema.post('remove', async function(doc) {
  await mongoose.model('Lawyer').updateOne(
    { _id: doc.lawyer },
    { $inc: { 'stats.serviceCount': -1 } }
  );
});

module.exports = mongoose.model('LegalService', legalServiceSchema);

//1
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const legalServiceSchema = new Schema({
//   lawyerId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Lawyer',
//     required: true
//   },
//   title: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   practiceArea: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   isRecurring: {
//     type: Boolean,
//     default: false
//   },
//   timeSlots: [{
//     date: Date,
//     startTime: String,
//     endTime: String,
//     consultationType: {
//       type: String,
//       enum: ['virtual', 'in-person']
//     }
//   }],
//   documents: [{
//     name: String,
//     url: String
//   }],
//   status: {
//     type: String,
//     enum: ['active', 'inactive', 'pending'],
//     default: 'pending'
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('LegalService', legalServiceSchema);

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
