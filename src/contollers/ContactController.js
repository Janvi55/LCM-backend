const ContactModel = require("../models/ContactModel");
const submitContactForm = async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        const newMessage = await ContactModel.create(req.body);
        res.status(201).json({ message: "Message submitted successfully", data: newMessage });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error submitting message", error });
    }
};


const getAllMessages = async (req, res) => {
    try {
        const messages = await ContactModel.find();
        res.status(200).json({ message: "Messages retrieved successfully", data: messages });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving messages", error });
    }
};

module.exports = { submitContactForm, getAllMessages };