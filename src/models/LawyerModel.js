
const mongoose= require('mongoose')
const Schema= mongoose.Schema


const lawyerSchema = new Schema({

  name:{
    type:String
},
number:{
    type:String
},
email:{
    type:String,
    unique:true
},
password:{
    type:String
},
specialization:{
    enum:["Civil", "Criminal", "Corporate", "Family", "Real Estate", "Intellectual Property", "Tax", "Employment"],
    type:String,
    required:true
},
experience:{
    type:Number,
},
rating:{
    type:Number,
    default:0,
},
ratingCount:{
    type: Number,
    default: 0 
}, 
roleId:{
    type:Schema.Types.ObjectId,
    ref:"roles"
},
imageURL:{
    type:String,
    required:true
},
isBlocked: {
    type: Boolean,
    default: false
  },
  
reviews: [
    {
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]

})
module.exports = mongoose.model('lawyers',lawyerSchema)


//-------------------------------------------
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: "users", // Changed from "users" to match typical Mongoose convention
//     required: true
//   },
//   practiceAreas: [{  // Changed from specializations to match LegalService model
//     type: Schema.Types.ObjectId, 
//     ref: "LegalCategory", // Direct reference to categories
//     required: true
//   }],
//   experienceYears: {
//     type: Number, // Changed from String to Number
//     required: true
//   },
//   status: { 
//     type: String, 
//     enum: ['active', 'inactive', 'pending'], // Added pending status
//     default: 'pending' 
//   },
//   location: { 
//     type: String, 
//     required: true 
//   },
//   rating: {
//     average: { type: Number, default: 0 },
//     count: { type: Number, default: 0 }
//   },
//   availableSlots: [{
//     date: { type: Date, required: true },
//     startTime: { type: String, required: true },
//     endTime: { type: String, required: true },
//     isBooked: { type: Boolean, default: false }
//   }],
//   verification: {
//     isVerified: { type: Boolean, default: false },
//     documents: [{
//       name: String,
//       url: String,
//       uploadedAt: { type: Date, default: Date.now }
//     }],
//     status: { 
//       type: String, 
//       enum: ['pending', 'approved', 'rejected'], 
//       default: 'pending' 
//     }
//   },
//   services: [{
//     type: Schema.Types.ObjectId,
//     ref: 'LegalService'
//   }],
//   consultations: [{
//     type: Schema.Types.ObjectId,
//     ref: 'Consultation'
//   }],
//   // Added for better integration
//   consultationFee: {
//     type: Number,
//     default: 0
//   },
//   about: String,
//   languages: [String],
//   education: [{
//     degree: String,
//     university: String,
//     year: Number
//   }]
// }, {
//   timestamps: true
// });





// const mongoose= require('mongoose')
// const Schema= mongoose.Schema

// const lawyerSchema= new Schema({

    
//     userId:{
//         type:Schema.Types.ObjectId,
//         ref:"users",
//         required: true
        
//     },
//     specializations: [{ 
//         type: Schema.Types.ObjectId, 
//         ref: "Service" }], // Link to Services

//     experienceYears:{
//         type:String,
//         required: true
//     },
//     status: { type: String, enum: ['active', 'inactive'], default: 'active' },

//     location: { type: String, required: true },
//     rating:{
//         type:String,
//         required: true
//     },
//     availableSlots: [
//         {
//             date: { type : Date, required: true},
//             time: { type: String,  required: true},
//         }
//     ],
    
//     verification: {
//         isVerified: { type: Boolean, default: false },
//         documents: [{
//           name: String,
//           url: String,  // Path to the uploaded file
//           uploadedAt: { type: Date, default: Date.now }
//         }],
//         status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
//       },
//       analytics: {
//         responseTime: Number,
//         avgRating: Number,
//         clientRetention: Number
//       },
//       subscription: {
//         type: {
//           type: String,
//           enum: ['basic', 'premium'],
//           default: 'basic'
//         },
//         expiresAt: Date
//       },
//       clients: [{
//         type: Schema.Types.ObjectId,
//         ref: 'User'
//       }],
//       services: [{
//         type: Schema.Types.ObjectId,
//         ref: 'LegalService'
//       }],
//       consultations: [{
//         type: Schema.Types.ObjectId,
//         ref: 'Consultation'
//       }]

// },{
//     timestamps: true
// })
// module.exports = mongoose.model('Lawyer',lawyerSchema)



