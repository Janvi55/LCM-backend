

const LawyerModel = require("../models/LawyerModel");

// ✅ Add Lawyer
const addLawyer = async (req, res) => {
  try {
    const savedLawyer = await LawyerModel.create(req.body);

    res.status(201).json({
      message: "Lawyer added successfully",
      data: savedLawyer,
    });
  } catch (error) {
    console.error("Error adding lawyer:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get All Lawyers
const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await LawyerModel.find()
      .populate("userId", "firstName lastName email") // Populates lawyer's user details
      .select("specialization experienceYears rating availableSlots consultationFee location");

    res.status(200).json({
      message: "All lawyers retrieved successfully",
      data: lawyers,
    });
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get Lawyer By ID
const getLawyerById = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Following the format like in Service Controller
    console.log("Fetching lawyer with ID:", lawyerId);

    const lawyer = await LawyerModel.findById(lawyerId).populate("userId", "firstName lastName email");

    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Lawyer profile retrieved successfully",
      data: lawyer,
    });
  } catch (error) {
    console.error("Error fetching lawyer profile:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// Get top-rated lawyers
const getTopRatedLawyers = async (req, res) => {
  try {
    const lawyerId = req.params.id;
      const topLawyers = await LawyerModel.find().sort({ rating: -1 }).limit(5); // Fetch top 5 highest-rated lawyers

      const lawyer = await LawyerModel.findById(lawyerId).populate("userId", "firstName lastName email");
      res.status(200).json({ success: true, data: topLawyers });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching top-rated lawyers", error });
  }
};

// ✅ Update Lawyer Details
const updateLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Following consistent format
    const updatedLawyer = await LawyerModel.findByIdAndUpdate(lawyerId, req.body, { new: true });

    if (!updatedLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Lawyer details updated successfully",
      data: updatedLawyer,
    });
  } catch (error) {
    console.error("Error updating lawyer details:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Delete Lawyer
const deleteLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Consistent with other controllers
    const deletedLawyer = await LawyerModel.findByIdAndDelete(lawyerId);

    if (!deletedLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Lawyer deleted successfully",
      data: deletedLawyer,
    });
  } catch (error) {
    console.error("Error deleting lawyer:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Update Available Slots
const updateAvailableSlots = async (req, res) => {
  try {
    const lawyerId = req.params.id; // 👈 Consistent ID format
    const { availableSlots } = req.body;

    const updatedLawyer = await LawyerModel.findByIdAndUpdate(
      lawyerId,
      { availableSlots },
      { new: true }
    );

    if (!updatedLawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.status(200).json({
      message: "Available slots updated successfully",
      data: updatedLawyer,
    });
  } catch (error) {
    console.error("Error updating available slots:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  addLawyer,
  getAllLawyers,
  getLawyerById,
  getTopRatedLawyers,
  updateLawyer,
  deleteLawyer,
  updateAvailableSlots,
};
