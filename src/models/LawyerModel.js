const mongoose= require('mongoose')
const Schema= mongoose.Schema

const lawyerSchema= new Schema({

    
    userId:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required: true
        
    },
    specializations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Service" }], // Link to Services

    experienceYears:{
        type:String,
        required: true
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    location: { type: String, required: true },
    rating:{
        type:String,
        required: true
    },
    availableSlots: [
        {
            date: { type : Date, required: true},
            time: { type: String,  required: true},
        }
    ],
    
    verification: {
        isVerified: { type: Boolean, default: false },
        documents: [{
          name: String,
          url: String,  // Path to the uploaded file
          uploadedAt: { type: Date, default: Date.now }
        }],
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
      },
      analytics: {
        responseTime: Number,
        avgRating: Number,
        clientRetention: Number
      },
      subscription: {
        type: {
          type: String,
          enum: ['basic', 'premium'],
          default: 'basic'
        },
        expiresAt: Date
      },
      clients: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      services: [{
        type: Schema.Types.ObjectId,
        ref: 'LegalService'
      }],
      consultations: [{
        type: Schema.Types.ObjectId,
        ref: 'Consultation'
      }]

},{
    timestamps: true
})
module.exports = mongoose.model('Lawyer',lawyerSchema)