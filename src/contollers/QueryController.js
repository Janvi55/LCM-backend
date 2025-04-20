const QueriesModel = require("../models/QueriesModel");
const queryModel = require("../models/QueriesModel");
const { stack } = require("../routes/ContactRoutes");
const getAllQueries = async (req, res) => {
  try {
    const queries = await queryModel
      .find()
      .populate("userId", "firstName lastName email"); // Fetch user details
      

    res.status(200).json({
      success: true,
      message: "Queries fetched successfully",
      data: queries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


const addQuery = async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    // Convert isPublic to a boolean (true/false)
    if (req.body.isPublic) {
      req.body.isPublic = req.body.isPublic === "true"; 
    }

    const savedQuery = await queryModel.create(req.body);
    res.json({
      message: "Query created successfully",
      data: savedQuery,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating query", 
      error :error.message,
      stack:error.stack 
    });
  }
};

const deleteQuery = async (req, res) => {
  try {
    const deletedQuery = await queryModel.findByIdAndDelete(req.params.id);
    res.json({
      message: "Query deleted successfully",
      data: deletedQuery,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting query", error });
  }
};


const getQueryById = async (req, res) => {
  try {
    const foundQuery = await queryModel.findById(req.params.id).populate("userId", "name email");
    res.json({
      message: "Query fetched successfully",
      data: foundQuery,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching query", error });
  }
};

   const getAllQueriesByUserId = async (req, res) => {
  
    try {
      const myQueries = await QueriesModel
        .find({userId:req.params.userId})
        .populate("userId");
      if (myQueries.length === 0) {
        res.status(404).json({ message: "No Queries found" });
      } else {
        res.status(200).json({
          message: "Queries found successfully",
          data: myQueries,
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  const updateQuery = async (req, res) => {
    try {
      const updatedQuery = await queryModel.findByIdAndUpdate(
        req.params.id,
        { response: req.body.response, status: req.body.status },
        { new: true }
      );
  
      res.json({
        message: "Query updated successfully",
        data: updatedQuery,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating query", error });
    }
  };



module.exports ={
    getAllQueries,addQuery,deleteQuery,getQueryById,getAllQueriesByUserId,updateQuery
}