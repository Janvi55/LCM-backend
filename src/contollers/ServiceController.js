const serviceModel = require("../models/ServiceModel")

// Get all services
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json({ message: "Services fetched", data: services });
    } catch (err) {
        res.status(500).json({ message: "Error fetching services", error: err });
    }
};

// Add a new service
const addService = async (req, res) => {
    try {
        const newService = await Service.create(req.body);
        res.status(201).json({ message: "Service added", data: newService });
    } catch (err) {
        res.status(500).json({ message: "Error adding service", error: err });
    }
};

// Delete a service by ID
const deleteServiceById = async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Service deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting service", error: err });
    }
};

module.exports = { getAllServices, addService, deleteServiceById };
