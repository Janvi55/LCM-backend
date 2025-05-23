const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const AdminSchema = new Schema({

   name:{
    type:String,
   },
   email:{
    type:String,
    unique:true
   },
   password:{
    type:String
   },
   roleId:{
    type:Schema.Types.ObjectId,
        ref:"roles"
    },
   
   

},{timestamps:true})

module.exports =mongoose.model("admins",AdminSchema)
















//--------------------------------------------------------------
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const adminSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   permissions: [{
//     type: String,
//     enum: ['manage_users', 'manage_lawyers', 'manage_cases', 'view_analytics', 'manage_content'],
//     default: []
//   }],
//   lastAccess: Date
// }, { timestamps: true });

// module.exports = mongoose.model('Admin', adminSchema);