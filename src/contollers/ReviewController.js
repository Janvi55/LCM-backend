const reviewModel = require("../models/ReviewModel");
const LawyerModel = require("../models/LawyerModel");


// const addReview = async (req, res) => {
//   try {
//     const savedReview = await reviewModel.create(req.body);

//     res.status(201).json({
//       message: "Review added successfully",
//       data: savedReview,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error review adding", error: err.message });
//   }
// };

const addReview = async (req, res) => {
  try {
    // Step 1: Create the review in the database
    const savedReview = (await reviewModel.create(req.body));

    // Step 2: Update the lawyer's rating
    const lawyer = await LawyerModel.findById(req.body.lawyerId);
    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    // Step 3: Calculate the new rating
    const newRatingCount = lawyer.ratingCount + 1;
    const newAverageRating = (lawyer.rating * lawyer.ratingCount + req.body.rating) / newRatingCount;

    // Step 4: Update the lawyer's rating and count in the database
    await LawyerModel.findByIdAndUpdate(req.body.lawyerId, {
      rating: newAverageRating.toFixed(1), // Round to 1 decimal place
      ratingCount: newRatingCount,
    });

    res.status(201).json({
      message: "Review added successfully, Lawyer rating updated",
      data: savedReview,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding review", error: err.message });
  }
};


const getAllReview = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find()
      .populate("userId", "firstName email")// Fetch user details
      .populate("lawyerId", "name"); // Fetch lawyer details
      

    res.status(200).json({
      success: true,
      message: "reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const deleteReview = async (req, res) => {
  try {
    const deletedReview = await reviewModel.findByIdAndDelete(req.params.id);
    res.json({
      message: "Review deleted successfully",
      data: deletedReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting query", error });
  }
};

const getReviewById = async (req, res) => {
  try {
    const foundReview = await reviewModel.findById(req.params.id).populate("userId", "name email").populate("lawyerId", "name");
    res.json({
      message: "review fetched successfully",
      data: foundReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching query", error });
  }
};

 const getAllReviewsByUserId = async (req, res) => {
  
    try {
      const myReviews = await reviewModel
        .find({userId:req.params.userId})
        .populate("userId")
        .populate("lawyerId","name");
      if (myReviews.length === 0) {
        res.status(404).json({ message: "No Reviews found" });
      } else {
        res.status(200).json({
          message: "Reviews found successfully",
          data: myReviews,
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }


  const updateReview = async (req, res) => {
    try {
      const { rating, comment } = req.body; // Extract valid fields
  
      const updatedReview = await reviewModel.findByIdAndUpdate(
        req.params.id,
        { rating, comment }, // Correct field names
        { new: true }
      );
  
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found!" });
      }
  
      res.status(200).json({
        message: "Review updated successfully",
        data: updatedReview,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating review", error: error.message });
    }
  };


  const getReviewsByLawyerId = async (req, res) => {
    try {
      const lawyerId = req.params.lawyerId;
      const reviews = await reviewModel
        .find({ lawyerId })
        .populate("userId", "firstName email")  // Show user info
        .sort({ createdAt: -1 }); // Optional: Latest first
  
      if (reviews.length === 0) {
        return res.status(200).json({
          message: "No reviews found for this lawyer",
          data: [],
        });
      }
  
      res.status(200).json({
        message: "Reviews fetched successfully",
        data: reviews,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  





module.exports={
    addReview,getAllReview,deleteReview,getReviewById,getAllReviewsByUserId,updateReview,getReviewsByLawyerId
}