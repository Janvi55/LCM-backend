const routes = require("express").Router()
const userController = require("../contollers/UserController")
const authMiddleware= require("../middleware/AuthMiddleware")

routes.post("/users",userController.signup)
routes.post("/users/login",userController.loginUserWithToken)
routes.get("/users",authMiddleware,userController.getAllUsers)
routes.delete("/users/:id",userController.deleteUserById)
routes.get("/users/stats", userController.getUserStats); 
routes.get("/users/:id",userController.getUserById)
// routes.post("/users/login",userController.loginUser)


routes.post("/users/forgotpassword",userController.forgotPassword)
routes.post("/users/resetpassword",userController.resetPassword)

module.exports= routes