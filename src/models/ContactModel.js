const mongoose = require("mongoose")
const Schema=mongoose.Schema;

const contactUsSchema= new Schema({
    name:{
        type:String
    },
    
    email:{
        type:String
    },
    message:{
        type:String
    },
    
})

module.exports= mongoose.model("contacts",contactUsSchema)







//-----------------------------------------
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const contactSchema = new Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     message: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("contacts", contactSchema);