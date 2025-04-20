const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const querySchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:'users',
        required: true
    },
    queryText:{
        type:String,
        required:true
   },
    response:{
        type:String,
        default:null
   },
   priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
   },
   status: {
    type: String,
    enum: ["Pending", "Answered", "Closed"],
    default: "Pending"
   },
   isPublic: { 
    type: Boolean, 
    default: false 
   },




},{timestamps:true})

module.exports =mongoose.model("queries",querySchema)