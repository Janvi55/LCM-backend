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
    ]

},{
    timestamps: true
})
module.exports = mongoose.model('Lawyer',lawyerSchema)