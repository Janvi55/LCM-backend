const ContactModel = require("../models/ContactModel");

const mailUtil = require("../utils/MailUtil")
const addContact= async (req,res) => {
  

    const savedContact= await ContactModel.create(req.body)
    
  
    await mailUtil.sendingMail(savedContact.email,"Thankyou for Contact Us","For any query please contact on these mail")
  
    res.json({
      message:"message send successfully",
      data:savedContact
    })
  }
  
  const deleteContact= async (req,res) => {
  
     
  
  const deletedContact= await ContactModel.findByIdAndDelete(req.params.id)
  
  res.json({
    message:"message deleted..",
      data:deletedContact
  })
    
  }
  
  
  const getContactById= async(req,res)=>{
    //req param.id
  
    const foundContact= await ContactModel.findById(req.params.id)
  
    res.json({
      message:"message fatched..",
      data:foundContact
  
    })
  }
  
  module.exports={
      addContact,deleteContact,getContactById
  }




















//------------------------------------------------------------------------
// const submitContactForm = async (req, res) => {
//     try {
//         console.log("Received Data:", req.body);
//         const newMessage = await ContactModel.create(req.body);
//         res.status(201).json({ message: "Message submitted successfully", data: newMessage });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ message: "Error submitting message", error });
//     }
// };


// const getAllMessages = async (req, res) => {
//     try {
//         const messages = await ContactModel.find();
//         res.status(200).json({ message: "Messages retrieved successfully", data: messages });
//     } catch (error) {
//         res.status(500).json({ message: "Error retrieving messages", error });
//     }
// };

// module.exports = { submitContactForm, getAllMessages };