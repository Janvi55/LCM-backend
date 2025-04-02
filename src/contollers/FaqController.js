const FAQ = require("../models/FaqModel");

// Get all FAQs
const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.status(200).json({ message: "FAQs fetched", data: faqs });
    } catch (err) {
        res.status(500).json({ message: "Error fetching FAQs", error: err });
    }
};

// Add a new FAQ
const addFAQ = async (req, res) => {
    try {
        const newFAQ = await FAQ.create(req.body);
        res.status(201).json({ message: "FAQ added", data: newFAQ });
    } catch (err) {
        res.status(500).json({ message: "Error adding FAQ", error: err });
    }
};

// Delete an FAQ by ID
const deleteFAQById = async (req, res) => {
    try {
        await FAQ.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "FAQ deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting FAQ", error: err });
    }
};

module.exports = { getAllFAQs, addFAQ, deleteFAQById };
