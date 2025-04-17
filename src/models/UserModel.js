const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema= new Schema({


    firstName:{
        type:String,
    },
    lastName:{
        type:String
    },
    phone: {
        type: String,
        unique: true
    },
    age:{
        type:Number
    },
    roleId:{
        type:Schema.Types.ObjectId,
        ref:"roles"
    },
    password:{
        type: String,
    },
    email:{
        type:String,
        unique:true
    }

})

module.exports= mongoose.model("users",userSchema)