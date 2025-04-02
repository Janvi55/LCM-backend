const Testimonial = require("../models/TestimonialModel");

// Get all testimonials
const getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.status(200).json({ message: "Testimonials fetched", data: testimonials });
    } catch (err) {
        res.status(500).json({ message: "Error fetching testimonials", error: err });
    }
};

// Add a new testimonial
const addTestimonial = async (req, res) => {
    try {
        const newTestimonial = await Testimonial.create(req.body);
        res.status(201).json({ message: "Testimonial added", data: newTestimonial });
    } catch (err) {
        res.status(500).json({ message: "Error adding testimonial", error: err });
    }
};

// Delete a testimonial by ID
const deleteTestimonialById = async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Testimonial deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting testimonial", error: err });
    }
};

module.exports = { getAllTestimonials, addTestimonial, deleteTestimonialById };
