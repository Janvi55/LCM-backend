const routes = require("express").Router()

const reviewController  = require("../contollers/ReviewController")
routes.post("/addReview",reviewController.addReview)
routes.get("/getAllReview",reviewController.getAllReview)
routes.get("/getReviewById/:id",reviewController.getReviewById)
routes.get("/getAllReviewsByUserId/:userId",reviewController.getAllReviewsByUserId)
routes.delete("/deleteReview/:id",reviewController.deleteReview)
routes.put("/updateReview/:id",reviewController.updateReview)
routes.get("/getReviewsByLawyerId/:lawyerId",reviewController.getReviewsByLawyerId)

module.exports = routes