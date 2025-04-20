
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:'users',
        required: true
    },

    lawyerId:{
        type:Schema.Types.ObjectId,
        ref:'lawyers',
        required:true
    },
    problemCategory:{
        enum:["Civil", "Criminal", "Corporate", "Family", "Real Estate", "Intellectual Property", "Tax", "Employment"],
        type:String,
        required:true
    },

    appointmentDate:{
        type:Date,
        required:true
    },
    appointmentTime:{
        type:String,
        required:true   
    },
    consultationType:{
        enum :['Video', 'Voice', 'Chat'],
        type:String,
        required:true
    },
    paymentStatus:{
        enum:['Pending', 'Completed','Failed'],
        type:String,
        required:true,
        default:"Pending"
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Rejected"],
        default: "Pending",
      },

    amount: {
        type: Number,
        default: 0,
      },
    
    razorpay_order_id: {
        type: String,
      },
    
    razorpay_payment_id: {
        type: String,
      },  

    payment_verified: {
         type: Boolean, 
         default: false 
      },  

},{timestamps: true});

module.exports = mongoose.model('appointments',appointmentSchema)














//-------------------------------------------------------------
// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//   },
//   date: {
//     type: Date,
//     required: true,
//   },
// });

// const Appointment = mongoose.model("Appointment", appointmentSchema);
// module.exports = Appointment;



// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Lawyer", required: true },
//   date: { type: Date, required: true },
//   time: { type: String, required: true },
//   reason: { type: String, required: true },
//   status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' } // Default status for appointments
// });

// const Appointment = mongoose.model("Appointment", appointmentSchema);
// module.exports = Appointment;
