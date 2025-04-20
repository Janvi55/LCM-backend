const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const reviewSchema = new Schema({

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
    rating:{
        type:Number,
        required:true
    },
    comment:{
        type:String,
        required:true
    }

},{timestamps:true})

module.exports =mongoose.model("reviews",reviewSchema)